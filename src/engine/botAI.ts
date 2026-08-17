/**
 * botAI.ts — Motor de Inteligência Artificial para Jogadores Bot no JAM
 * 
 * Implementa:
 * 1. Função de Utilidade de Estado V(S) com pesos adaptativos por fase
 * 2. Simulação Monte Carlo de apresentações nos clubes
 * 3. Seleção de rotas da Fase de Dia baseada em ROI de tempo (ΔV / Δt)
 * 4. Solver determinístico de alocação de notas para apresentações
 * 5. Resolução autônoma de todas as decisões e modais (Luthier, Bicicleta, Estilos, Cubos, Draft)
 * 6. Garantia anti-travamento com fallbacks seguros em 100% das decisões
 */

import type { GameState, PlayerState, MusicianInPlay } from '../types/game';
import type { NoteColor, MusicianCard, ResourceCard } from '../types/cards';
import type { ClubDef, ClubId } from '../types/board';
import { CLUBS } from '../types/board';
import { GameEngine } from './gameEngine';

// ─── 1. AVALIAÇÃO DE ESTADO HEURÍSTICO V(S) ──────────────────────────────────

export interface StateWeights {
  vp: number;
  skill: number;
  renown: number;
  insp: number;
  coins: number;
  discs: number;
  bagQuality: number;
}

function getWeightsForRound(round: number): StateWeights {
  if (round <= 2) {
    return {
      vp: 1.0,
      skill: 2.8,
      renown: 2.2,
      insp: 1.8,
      coins: 1.6,
      discs: 1.4,
      bagQuality: 2.0,
    };
  }
  if (round <= 4) {
    return {
      vp: 1.8,
      skill: 1.8,
      renown: 1.6,
      insp: 1.5,
      coins: 1.2,
      discs: 2.2,
      bagQuality: 1.4,
    };
  }
  return {
    vp: 3.2,
    skill: 0.8,
    renown: 1.0,
    insp: 1.2,
    coins: 0.6,
    discs: 2.8,
    bagQuality: 0.6,
  };
}

export function evaluatePlayerState(player: PlayerState, round: number): number {
  const w = getWeightsForRound(round);

  const whiteCount = player.bag.filter(c => c === 'white').length;
  const coloredCount = player.bag.filter(c => c !== 'white').length;
  const bagQuality = coloredCount * 1.5 - whiteCount * 2.0;

  const totalDiscs = player.totalDiscsRecorded ?? player.discs.length;

  return (
    w.vp * player.score +
    w.skill * player.skill +
    w.renown * player.renown +
    w.insp * player.inspiration +
    w.coins * Math.min(20, player.coins) +
    w.discs * totalDiscs +
    w.bagQuality * bagQuality
  );
}

// ─── 2. SOLVER DE ALOCAÇÃO DE NOTAS NA BANDA ────────────────────────────────

export interface SlotAllocation {
  musicianId: string;
  noteIndex: number;
  scoreGained: number;
}

/**
 * Encontra o melhor slot para alocar um cubo colorido na banda do bot.
 */
export function findBestSlotForCube(
  musicians: MusicianInPlay[],
  cube: NoteColor,
  musicianDirections: Record<string, 'ltr' | 'rtl'> = {},
  canUseWhiteAsWild: boolean = false
): SlotAllocation | null {
  if (cube === 'white' && !canUseWhiteAsWild) return null;

  let bestSlot: SlotAllocation | null = null;
  let maxScore = -1;

  for (const m of musicians) {
    const filled = m.filledNotes || [];
    const dir = musicianDirections[m.id] || 'ltr';

    // Se a direção for ltr (esquerda -> direita)
    let candidateIndex = -1;
    if (dir === 'ltr') {
      for (let i = 0; i < m.notes.length; i++) {
        if (!filled[i]) {
          candidateIndex = i;
          break;
        }
      }
    } else {
      // rtl (direita -> esquerda)
      for (let i = m.notes.length - 1; i >= 0; i--) {
        if (!filled[i]) {
          candidateIndex = i;
          break;
        }
      }
    }

    if (candidateIndex !== -1 && candidateIndex < m.notes.length) {
      const targetNote = m.notes[candidateIndex];
      // Nota compatível (cor exata, slot curinga/neutro ou cubo branco coringa permitido)
      if (targetNote.color === 'wild' || targetNote.color === cube || (cube === 'white' && canUseWhiteAsWild)) {
        const points = targetNote.points;
        if (points > maxScore) {
          maxScore = points;
          bestSlot = {
            musicianId: m.id,
            noteIndex: candidateIndex,
            scoreGained: points,
          };
        }
      }
    }
  }

  return bestSlot;
}

// ─── 3. SIMULAÇÃO MONTE CARLO DE APRESENTAÇÃO ──────────────────────────────

export interface GigSimulationResult {
  averagePoints: number;
  successProbability: number;
  expectedAudience: number;
  expectedCoins: number;
}

export function simulateGig(
  player: PlayerState,
  club: ClubDef,
  iterations: number = 80
): GigSimulationResult {
  const hasSensei = player.resources.some(r => r.id === 'recurso_08' || r.effectType === 'extra_draw_in_gig');
  const hasReduceThreshold = player.styles.some(s => s.id === 'estilo_06' || s.effectType === 'reduce_success_threshold');
  const hasWhiteAsWild = player.styles.some(s => s.id === 'estilo_03' || s.effectType === 'white_as_wild');
  const effectiveThreshold = hasReduceThreshold ? Math.max(1, club.successThreshold - 1) : club.successThreshold;

  // Decide se gasta inspiração na simulação se tiver >= 1
  const spendInsp = player.inspiration >= 1 && player.skill < 4;
  const drawCount = player.skill + (hasSensei ? 1 : 0) + (spendInsp ? 1 : 0);

  let successCount = 0;
  let totalPointsAccum = 0;

  for (let it = 0; it < iterations; it++) {
    // Clona e embaralha o saco
    const shuffledBag = [...player.bag].sort(() => Math.random() - 0.5);
    const drawnCubes = shuffledBag.slice(0, drawCount);

    // Clona os músicos com slots vazios
    const mockMusicians = player.musicians.map(m => ({
      ...m,
      filledNotes: [] as (NoteColor | null)[],
    }));

    let gigPoints = 0;
    let whiteWildUsedInSim = false;

    for (const cube of drawnCubes) {
      const canUseWhite = hasWhiteAsWild && !whiteWildUsedInSim;
      if (cube === 'white' && !canUseWhite) continue;

      const best = findBestSlotForCube(mockMusicians, cube, {}, canUseWhite);
      if (best) {
        if (cube === 'white') whiteWildUsedInSim = true;
        const targetM = mockMusicians.find(m => m.id === best.musicianId);
        if (targetM) {
          if (!targetM.filledNotes) targetM.filledNotes = [];
          targetM.filledNotes[best.noteIndex] = cube;
          gigPoints += best.scoreGained;
        }
      }
    }

    if (gigPoints >= effectiveThreshold) {
      successCount++;
    }
    totalPointsAccum += gigPoints;
  }

  const audience = player.renown * 10 + (player.hasPublicityToken ? 30 : 0);
  const actualAudience = Math.min(club.maxCapacity, audience);
  const coins = actualAudience / 10;

  return {
    averagePoints: totalPointsAccum / iterations,
    successProbability: successCount / iterations,
    expectedAudience: actualAudience,
    expectedCoins: coins,
  };
}

// ─── 4. ESCOLHA DO MELHOR CLUBE ──────────────────────────────────────────────

export function botChooseBestClub(state: GameState, botIndex: number): ClubId {
  const bot = state.players[botIndex];
  if (!bot) return 'mosca_frita';

  const eligibleClubs = CLUBS.filter(club => {
    if (bot.renown < club.minRenown) return false;
    if (!club.isUnlimited) {
      const maxCap = state.players.length === 2 ? 1 : 2;
      const occupants = state.players.filter(p => p.id !== bot.id && p.chosenClub === club.id).length;
      if (occupants >= maxCap) return false;
    }
    return true;
  });

  if (eligibleClubs.length === 0) {
    return 'mosca_frita';
  }

  let bestClubId: ClubId = eligibleClubs[0].id;
  let bestExpectedValue = -999;

  for (const club of eligibleClubs) {
    const sim = simulateGig(bot, club, 80);
    // Avalia o valor do prêmio do clube se tiver sucesso
    const rewards = state.clubRewards[club.id] || [];
    const availableRewards = rewards.filter(r => !r.claimedByPlayerId);
    const rewardValue = availableRewards.length > 0 ? 3.5 : 1.0;

    const expectedValue =
      sim.successProbability * (club.successThreshold + rewardValue) +
      sim.expectedCoins * 0.4 +
      (sim.averagePoints >= club.successThreshold ? 2.0 : -1.0);

    if (expectedValue > bestExpectedValue) {
      bestExpectedValue = expectedValue;
      bestClubId = club.id;
    }
  }

  return bestClubId;
}

// ─── 5. MODELO DE DECISÃO DA FASE DE DIA ─────────────────────────────────────

export interface BotDayDecision {
  actionType: 'location_action' | 'go_to_club' | 'pass';
  targetLocation?: number;
  actionDetails?: {
    type: string;
    [key: string]: unknown;
  };
}

export function evaluateObjectiveSynergy(
  bot: PlayerState,
  actionType: 'radio' | 'record_disc' | 'conservatorio_skill' | 'conservatorio_compose' | 'lojas_buy_resource' | 'ruas_hire' | 'parque'
): number {
  if (!bot.objective || !bot.objective.goals) return 0;
  const completed = bot.objective.completedGoals || [false, false, false];
  let bonus = 0;

  bot.objective.goals.forEach((goal, gIdx) => {
    if (completed[gIdx]) return;
    const goalWeight = gIdx === 2 ? 3.5 : gIdx === 1 ? 2.5 : 1.8;

    switch (goal.type) {
      case 'renown': {
        if (actionType === 'radio' || actionType === 'parque') {
          const needed = Math.max(1, goal.value - bot.renown);
          bonus += goalWeight * (1 / needed);
        }
        break;
      }
      case 'discs': {
        const currentDiscs = bot.totalDiscsRecorded ?? bot.discs.length;
        const needed = Math.max(1, goal.value - currentDiscs);
        if (actionType === 'record_disc') {
          bonus += goalWeight * (1.5 / needed);
        } else if (actionType === 'conservatorio_compose') {
          bonus += goalWeight * (0.8 / needed);
        }
        break;
      }
      case 'skill': {
        if (actionType === 'conservatorio_skill') {
          const needed = Math.max(1, goal.value - bot.skill);
          bonus += goalWeight * (1.2 / needed);
        }
        break;
      }
      case 'musicians':
      case 'band_size':
      case 'musicians_level2plus':
      case 'all_levels': {
        if (actionType === 'ruas_hire') {
          bonus += goalWeight * 1.0;
        }
        break;
      }
      case 'resources': {
        if (actionType === 'lojas_buy_resource') {
          const needed = Math.max(1, goal.value - bot.resources.length);
          bonus += goalWeight * (1 / needed);
        }
        break;
      }
      case 'coins': {
        if (actionType === 'parque') {
          const needed = Math.max(1, goal.value - bot.coins);
          bonus += goalWeight * (1 / Math.max(1, needed / 3));
        }
        break;
      }
    }
  });

  return bonus;
}

export function projectInstrumentVP(bot: PlayerState, state: GameState, resource: ResourceCard): number {
  let vp = resource.victoryPoints || 0;

  switch (resource.effectType) {
    case 'victory_points_only':
      break;
    case 'points_per_gig_achievement': {
      let claimedCount = 0;
      Object.values(state.clubRewards).forEach(arr => {
        arr.forEach(r => { if (r.claimedByPlayerId === bot.id) claimedCount++; });
      });
      vp += claimedCount + 1;
      break;
    }
    case 'points_per_musician_level': {
      let pts = 0;
      bot.musicians.forEach(m => { pts += (m.level || 1); });
      vp += pts;
      break;
    }
    case 'points_equal_skill_level':
      vp += bot.skill;
      break;
    case 'points_based_on_white_cubes': {
      const whiteCount = bot.bag.filter(c => c === 'white').length;
      vp += whiteCount === 0 ? 6 : whiteCount === 1 ? 4 : whiteCount === 2 ? 2 : 0;
      break;
    }
    case 'points_per_resource':
      vp += (bot.resources.length + 1) * (resource.effectValue ?? 1);
      break;
    case 'points_per_chosen_color_cube': {
      const colorCounts: Record<string, number> = {};
      bot.bag.forEach(c => { if (c !== 'white') colorCounts[c] = (colorCounts[c] || 0) + 1; });
      const maxCount = Object.keys(colorCounts).length > 0 ? Math.max(...Object.values(colorCounts)) : 0;
      vp += maxCount * (resource.effectValue ?? 1);
      break;
    }
    case 'points_per_disc': {
      const totalD = (bot.totalDiscsRecorded ?? bot.discs.length) + (bot.compositions.length > 0 ? 1 : 0);
      vp += totalD * (resource.effectValue ?? 2);
      break;
    }
  }

  return vp;
}

export function computeBotDayAction(state: GameState, botIndex: number): BotDayDecision {
  const bot = state.players[botIndex];
  if (!bot || bot.hasFinishedDay || bot.timeMarker < 1 || state.turnActionState.hasActedThisTurn) {
    return { actionType: 'pass' };
  }

  const isInvert = state.currentEvent?.effectType === 'invert_arrow_direction';

  let bestDecision: BotDayDecision = { actionType: 'pass' };
  let bestScoreRate = -999;

  // Avalia ir para clube voluntariamente: APENAS se timeMarker <= 3 (idealmente <= 2)
  if (bot.boardPosition !== 0 && bot.timeMarker <= 3) {
    const bestClubId = botChooseBestClub(state, botIndex);
    const targetClubDef = CLUBS.find(c => c.id === bestClubId) || CLUBS[0];
    
    // Capacidade do clube e disputa por vagas
    const playersInThisClub = state.players.filter(p => p.chosenClub === bestClubId);
    const isClubAlmostFull = playersInThisClub.length >= targetClubDef.maxCapacity - 1;
    const wantsInspiration = bot.inspiration < 3;
    
    // Utilidade de ir para o clube agora (ganha +1 inspiração por tempo economizado)
    let clubUtility = wantsInspiration ? 2.2 : 0.8;
    if (isClubAlmostFull && targetClubDef.maxCapacity <= 2) {
      clubUtility += 1.2; // Urgência estratégica para garantir vaga em clube disputado
    }

    // A taxa é ponderada pelo tempo que seria abandonado
    const timeCostEquivalent = Math.max(1, bot.timeMarker);
    const clubRate = clubUtility / timeCostEquivalent;

    if (clubRate > bestScoreRate) {
      bestScoreRate = clubRate;
      bestDecision = {
        actionType: 'go_to_club',
        actionDetails: { type: 'club', clubId: bestClubId },
      };
    }
  }

  // Avalia todos os 6 locais possíveis no mapa
  for (let loc = 1; loc <= 6; loc++) {
    const moveInfo = GameEngine.calculateMovement(bot, loc, state.players, isInvert, state.neutralDie);
    if (!moveInfo.isReachable) continue;

    const timeCost = Math.max(1, moveInfo.timeCost);
    const fee = moveInfo.visitingFee;

    // ── Local 1: RÁDIO ──
    if (loc === 1 && bot.coins >= fee) {
      const hasDiscs = bot.discs.length > 0;
      let gain = 0;
      if (moveInfo.isForward) {
        gain = (hasDiscs ? 3.0 : 0) + 2.0; // Toca disco + ganha divulgação
      } else {
        gain = hasDiscs ? 2.5 : 1.5;
      }
      gain += evaluateObjectiveSynergy(bot, 'radio');
      const rate = gain / timeCost;
      if (rate > bestScoreRate) {
        bestScoreRate = rate;
        bestDecision = {
          actionType: 'location_action',
          targetLocation: 1,
          actionDetails: {
            type: 'radio',
            option: hasDiscs ? 'play_disc' : 'publicity',
            discId: bot.discs[0]?.id,
          },
        };
      }
    }

    // ── Local 2: GRAVADORA ──
    if (loc === 2 && bot.compositions.length > 0) {
      const comp = [...bot.compositions].sort((a, b) => b.level - a.level)[0];
      const recordingCost = moveInfo.isForward ? 3 : 4;
      const totalGravadoraCost = recordingCost + fee;
      if (bot.coins >= totalGravadoraCost) {
        let discGain = comp.level * 2.5 + (moveInfo.isForward ? 1.5 : 0);
        discGain += evaluateObjectiveSynergy(bot, 'record_disc');
        const rate = discGain / timeCost;
        if (rate > bestScoreRate) {
          bestScoreRate = rate;
          bestDecision = {
            actionType: 'location_action',
            targetLocation: 2,
            actionDetails: {
              type: 'record_disc',
              compositionId: comp.id,
            },
          };
        }
      }
    }

    // ── Local 3: CONSERVATÓRIO ──
    if (loc === 3 && bot.coins >= fee) {
      // Decisão entre Ganhar Habilidade vs Compor
      const wantsSkill = bot.skill < 5;
      if (wantsSkill) {
        let skillGain = 3.2 + evaluateObjectiveSynergy(bot, 'conservatorio_skill');
        const rate = skillGain / timeCost;
        if (rate > bestScoreRate) {
          bestScoreRate = rate;
          bestDecision = {
            actionType: 'location_action',
            targetLocation: 3,
            actionDetails: {
              type: 'conservatorio_skill',
              cubeIndex: 0,
            },
          };
        }
      } else {
        // Compor música
        let compGain = 2.8 + evaluateObjectiveSynergy(bot, 'conservatorio_compose');
        const rate = compGain / timeCost;
        if (rate > bestScoreRate) {
          bestScoreRate = rate;
          bestDecision = {
            actionType: 'location_action',
            targetLocation: 3,
            actionDetails: {
              type: 'conservatorio_compose',
              spendInspiration: bot.inspiration >= 1,
              cubeIndex: 0,
            },
          };
        }
      }
    }

    // ── Local 4: LOJAS ──
    if (loc === 4) {
      const resources = state.market.resources;
      let bestSlot = -1;
      let maxResGain = -1;

      resources.forEach((r, slotIdx) => {
        if (!r) return;
        const isLastSlot = slotIdx === 3;
        const slotDisc = isLastSlot ? 1 : 0;
        const bonusDisc = moveInfo.isForward ? 1 : 0;
        let baseCost = r.cost;
        if (r.specialCost && state.round >= r.specialCost.fromRound) baseCost = r.specialCost.cost;
        if (r.playerCountCost) {
          const numPlayers = state.players.length as 2 | 3 | 4;
          baseCost = r.playerCountCost[numPlayers] ?? r.cost;
        }
        const finalCost = Math.max(0, baseCost - slotDisc - bonusDisc);
        const totalLojasCost = finalCost + fee;

        if (bot.coins >= totalLojasCost) {
          let utility = (r.victoryPoints || 0) * 1.5;
          if (r.cardType === 'instrument') {
            const projectedVP = projectInstrumentVP(bot, state, r);
            utility = projectedVP * 2.2 + (bot.coins >= 8 || state.round >= 4 ? 2.5 : 0);
          }
          if (r.effectType === 'gain_skill') utility += 3.5;
          if (r.effectType === 'gain_renown') utility += 2.5;
          utility += evaluateObjectiveSynergy(bot, 'lojas_buy_resource');

          const net = utility - finalCost * 0.4;
          if (net > maxResGain) {
            maxResGain = net;
            bestSlot = slotIdx;
          }
        }
      });

      if (bestSlot !== -1 && maxResGain > 0) {
        const rate = maxResGain / timeCost;
        if (rate > bestScoreRate) {
          bestScoreRate = rate;
          bestDecision = {
            actionType: 'location_action',
            targetLocation: 4,
            actionDetails: {
              type: 'lojas_buy_resource',
              slotIndex: bestSlot,
            },
          };
        }
      }
    }

    // ── Local 5: RUAS ──
    if (loc === 5) {
      const musicians = state.market.musicians;
      let bestMusicianSlot = -1;
      let maxMusicianGain = -1;

      musicians.forEach((m, slotIdx) => {
        if (!m) return;
        const totalMusicianCost = m.cost + fee;
        if (bot.coins >= totalMusicianCost) {
          let gain = m.level * 2.0 + (m.notes.length >= 3 ? 1.5 : 0) + (moveInfo.isForward ? 1.5 : 0);
          gain += evaluateObjectiveSynergy(bot, 'ruas_hire');
          if (gain > maxMusicianGain) {
            maxMusicianGain = gain;
            bestMusicianSlot = slotIdx;
          }
        }
      });

      if (bestMusicianSlot !== -1 && maxMusicianGain > 0) {
        const rate = maxMusicianGain / timeCost;
        if (rate > bestScoreRate) {
          bestScoreRate = rate;
          bestDecision = {
            actionType: 'location_action',
            targetLocation: 5,
            actionDetails: {
              type: 'ruas_hire',
              slotIndex: bestMusicianSlot,
              replacedMusicianId: bot.musicians.length >= (bot.maxMusicians || 3) ? bot.musicians[0]?.id : undefined,
            },
          };
        }
      }
    }

    // ── Local 6: PARQUE ──
    if (loc === 6 && bot.boardPosition !== 6) {
      const otherPlayersInPark = state.players.filter(p => p.id !== bot.id && p.boardPosition === 6);
      const hasNeutralDieAtPark = !!(state.neutralDie && state.neutralDie.position === 6);
      const alone = otherPlayersInPark.length === 0 && !hasNeutralDieAtPark;
      let coinsGained = bot.renown + (alone ? 2 : 0);
      coinsGained += evaluateObjectiveSynergy(bot, 'parque');
      const rate = (coinsGained * 0.5) / timeCost;
      if (rate > bestScoreRate) {
        bestScoreRate = rate;
        bestDecision = {
          actionType: 'location_action',
          targetLocation: 6,
          actionDetails: {
            type: 'parque',
          },
        };
      }
    }
  }

  // Se nenhum local do tabuleiro foi selecionado ou alcançável (ex: no Parque com 1 de tempo),
  // e o bot ainda está no tabuleiro com tempo >= 1, ele DEVE ir para um clube!
  if (bestDecision.actionType === 'pass' && bot.boardPosition !== 0 && bot.timeMarker >= 1) {
    const bestClub = botChooseBestClub(state, botIndex);
    return {
      actionType: 'go_to_club',
      actionDetails: { type: 'club', clubId: bestClub },
    };
  }

  return bestDecision;
}

// ─── 6. EXECUÇÃO COMPLETA DE APRESENTAÇÃO AUTOMATIZADA PARA BOTS ───────────

export function executeAutomatedBotGig(
  state: GameState,
  botPlayerIndex: number
): GameState {
  const bot = state.players[botPlayerIndex];
  if (!bot || !bot.chosenClub) return state;

  const club = CLUBS.find(c => c.id === bot.chosenClub);
  if (!club) return state;

  const hasSensei = bot.resources.some(r => r.id === 'recurso_08' || r.effectType === 'extra_draw_in_gig');
  const hasReduceThreshold = bot.styles.some(s => s.id === 'estilo_06' || s.effectType === 'reduce_success_threshold');
  const hasStyle01 = bot.styles.some(s => s.id === 'estilo_01' || s.effectType === 'swap_cube_once');
  const hasStyle02 = bot.styles.some(s => s.id === 'estilo_02' || s.effectType === 'reserve_cube_once');
  const hasStyle05 = bot.styles.some(s => s.id === 'estilo_05' || s.effectType === 'inspire_extra_draw_anytime');
  const effectiveThreshold = hasReduceThreshold ? Math.max(1, club.successThreshold - 1) : club.successThreshold;

  // Decide se gasta 1 inspiração no sorteio inicial
  let useExtraDrawInspiration = (bot.inspiration >= 1 && bot.skill < 4) || (hasStyle05 && bot.inspiration >= 1);
  const drawCount = bot.skill + (hasSensei ? 1 : 0) + (useExtraDrawInspiration && !hasStyle05 ? 1 : 0);

  // Estilo 09: Se tiver, escolhe 1 cubo do saco principal que melhor complete a banda
  let chosenMainBagCube: NoteColor | null = null;
  if (bot.styles.some(s => s.id === 'estilo_09' || s.effectType === 'draw_from_main_bag')) {
    const needed = getNeededCubeColors(bot);
    for (const col of needed) {
      if ((state.mainBag[col as keyof typeof state.mainBag] || 0) > 0) {
        chosenMainBagCube = col;
        break;
      }
    }
  }

  // Sorteia os cubos
  const workingBag = chosenMainBagCube ? [...bot.bag, chosenMainBagCube] : [...bot.bag];
  const shuffled = workingBag.sort(() => Math.random() - 0.5);
  let drawn = shuffled.slice(0, drawCount);
  let remainingBag = shuffled.slice(drawCount);

  // Estilo 10: Se o 1º cubo for branco, re-sorteia 1x
  if (bot.styles.some(s => s.id === 'estilo_10' || s.effectType === 'first_white_redraw')) {
    const firstWhiteIdx = drawn.indexOf('white');
    if (firstWhiteIdx !== -1 && remainingBag.length > 0) {
      const newCube = remainingBag[0];
      remainingBag = [...remainingBag.slice(1), 'white'];
      drawn[firstWhiteIdx] = newCube;
    }
  }

  // Aloca nos músicos
  const assignments: Record<string, NoteColor[]> = {};
  const musicianDirections: Record<string, 'ltr' | 'rtl'> = {};
  const mutableMusicians = bot.musicians.map(m => {
    assignments[m.id] = [];
    return { ...m, filledNotes: [] as (NoteColor | null)[] };
  });

  const hasWhiteAsWild = bot.styles.some(s => s.id === 'estilo_03' || s.effectType === 'white_as_wild');
  const unplacedCubes: NoteColor[] = [];
  let simulatedPoints = 0;
  let whiteWildUsed = false;
  let style01Used = false;
  let reservedCube: NoteColor | null = null;

  for (let i = 0; i < drawn.length; i++) {
    let cube = drawn[i];
    const canUseWhite = hasWhiteAsWild && !whiteWildUsed;

    // Estilo 01: Se cubo é branco sem coringa ou não cabe, tenta trocar 1x pelo saco
    if (hasStyle01 && !style01Used && remainingBag.length > 0) {
      const wouldFit = cube !== 'white' && findBestSlotForCube(mutableMusicians, cube, musicianDirections, false) !== null;
      if (!wouldFit && (!canUseWhite || cube !== 'white')) {
        const replacement = remainingBag[0];
        remainingBag = [...remainingBag.slice(1), cube];
        cube = replacement;
        drawn[i] = replacement;
        style01Used = true;
      }
    }

    if (cube === 'white' && !canUseWhite) {
      unplacedCubes.push(cube);
      continue;
    }

    const best = findBestSlotForCube(mutableMusicians, cube, musicianDirections, canUseWhite);
    if (best) {
      if (cube === 'white') whiteWildUsed = true;
      const targetM = mutableMusicians.find(m => m.id === best.musicianId);
      if (targetM) {
        if (!targetM.filledNotes) targetM.filledNotes = [];
        targetM.filledNotes[best.noteIndex] = cube;
        if (!assignments[best.musicianId]) assignments[best.musicianId] = [];
        assignments[best.musicianId][best.noteIndex] = cube;
        simulatedPoints += best.scoreGained;
      }
    } else {
      // Estilo 02: Reserva 1 cubo que não coube agora para tentar alocar depois
      if (hasStyle02 && reservedCube === null && cube !== 'white') {
        reservedCube = cube;
      } else {
        unplacedCubes.push(cube);
      }
    }
  }

  // Estilo 02: Tenta alocar o cubo reservado se abriu vaga
  if (reservedCube) {
    const bestRes = findBestSlotForCube(mutableMusicians, reservedCube, musicianDirections, false);
    if (bestRes) {
      const targetM = mutableMusicians.find(m => m.id === bestRes.musicianId);
      if (targetM) {
        if (!targetM.filledNotes) targetM.filledNotes = [];
        targetM.filledNotes[bestRes.noteIndex] = reservedCube;
        if (!assignments[bestRes.musicianId]) assignments[bestRes.musicianId] = [];
        assignments[bestRes.musicianId][bestRes.noteIndex] = reservedCube;
        simulatedPoints += bestRes.scoreGained;
      }
    } else {
      unplacedCubes.push(reservedCube);
    }
  }

  // Estilo 05: Se faltam pontos para bater a meta e tem inspiração, puxa cubo extra tático agora
  if (hasStyle05 && simulatedPoints < effectiveThreshold && bot.inspiration >= 1 && remainingBag.length > 0) {
    useExtraDrawInspiration = true;
    const extraCube = remainingBag[0];
    remainingBag = remainingBag.slice(1);
    const canUseWhite = hasWhiteAsWild && !whiteWildUsed;
    const bestExtra = findBestSlotForCube(mutableMusicians, extraCube, musicianDirections, canUseWhite);
    if (bestExtra) {
      if (extraCube === 'white') whiteWildUsed = true;
      const targetM = mutableMusicians.find(m => m.id === bestExtra.musicianId);
      if (targetM) {
        if (!targetM.filledNotes) targetM.filledNotes = [];
        targetM.filledNotes[bestExtra.noteIndex] = extraCube;
        if (!assignments[bestExtra.musicianId]) assignments[bestExtra.musicianId] = [];
        assignments[bestExtra.musicianId][bestExtra.noteIndex] = extraCube;
        simulatedPoints += bestExtra.scoreGained;
      }
    } else {
      unplacedCubes.push(extraCube);
    }
  }

  // Se houver cubo branco não alocado e inspiração >= 1, elimina
  const whiteUnplaced = unplacedCubes.includes('white');
  const eliminatedCube = (whiteUnplaced && (bot.inspiration - (useExtraDrawInspiration ? 1 : 0)) >= 1)
    ? ('white' as NoteColor)
    : null;

  // Se o bot atingirá o sucesso, reivindica o prêmio antes de fechar o show
  let stateBeforeShow = state;
  if (simulatedPoints >= effectiveThreshold) {
    const clubRewards = state.clubRewards[bot.chosenClub] || [];
    const hasPremioCobicado = bot.styles.some(s => s.effectType === 'claim_taken_reward' || s.id === 'estilo_11');
    const availableRewards = clubRewards.filter(r => !r.claimedByPlayerId || hasPremioCobicado);

    if (availableRewards.length > 0) {
      const priority = ['style', 'skill', 'renown', 'coins', 'vp'];
      const sortedRewards = [...availableRewards].sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type));
      const chosenRewardId = sortedRewards[0].id;

      let disabledRewardId: string | undefined = undefined;
      if (sortedRewards[0].claimedByPlayerId && hasPremioCobicado) {
        const freeReward = clubRewards.find(r => !r.claimedByPlayerId && r.id !== chosenRewardId);
        disabledRewardId = freeReward?.id;
      }

      const claimResult = GameEngine.claimClubReward(
        state,
        bot.chosenClub,
        chosenRewardId,
        undefined,
        bot.id,
        disabledRewardId
      );
      stateBeforeShow = claimResult.newState;
    }
  }

  // Executa o show no motor de jogo (que conclui e avança a rodada/turno)
  const gigResult = GameEngine.performNightGig(stateBeforeShow, assignments, {
    extraDrawInspirationUsed: useExtraDrawInspiration,
    eliminatedCube,
    chosenMainBagCube,
  });

  return gigResult.newState;
}

export function botChooseStartingMusician(state: GameState, botIndex: number): MusicianCard {
  const bot = state.players[botIndex];
  const available = state.availableStartingMusicians || [];
  if (available.length === 0) return ALL_AVAILABLE_FALLBACK_MUSICIAN;
  if (available.length === 1) return available[0];

  let bestMusician = available[0];
  let bestScore = -999;

  available.forEach(m => {
    // 1. Pontos potenciais e capacidade de notas
    const totalPts = m.notes.reduce((sum, n) => sum + n.points, 0);
    let utility = totalPts * 2.5;

    // 2. Sinergia com as cores do Conservatório Inicial
    const consCubes = state.conservatorioCubes || [];
    const notesColors = m.notes.map(n => n.color);
    consCubes.forEach(col => {
      if (notesColors.includes(col)) {
        utility += 2.0; // Excelente sinergia para capturar cubo no turno 1
      }
    });

    // 3. Flexibilidade de notas coringa (wild)
    const wildCount = m.notes.filter(n => n.color === 'wild').length;
    utility += wildCount * 1.8;

    // 4. Sinergia com a carta de Objetivo pessoal do bot
    if (bot?.objective?.goals) {
      bot.objective.goals.forEach(g => {
        if (g.type === 'cubes_same_color') {
          if (m.notes.length >= 2 && (m.notes[0].color === m.notes[1]?.color || wildCount > 0)) {
            utility += 2.2;
          }
        }
      });
    }

    // Leve ruído determinístico baseado no ID para desempate variado
    const tieBreaker = ((m.artistNumber || 1) * 7 + botIndex * 3) % 5 * 0.15;
    utility += tieBreaker;

    if (utility > bestScore) {
      bestScore = utility;
      bestMusician = m;
    }
  });

  return bestMusician;
}

// ─── 7. PROCESSADOR PRINCIPAL DO TURNO DO BOT (ANTI-TRAVAMENTO) ──────────────

/**
 * Executa 1 passo atômico do Bot dependendo do estado atual do jogo.
 * Retorna o novo estado com garantia estrita de nunca travar a partida.
 */
export function processBotStep(state: GameState): GameState {
  try {
    // ── CENÁRIO 1: DRAFT INICIAL DE MÚSICOS ──
    if (state.isInitialDraftActive && state.draftPlayerIndices && state.draftPlayerIndices.length > 0) {
      const currentIdx = state.draftPlayerIndices[0];
      const player = state.players[currentIdx];
      if (player?.isBot) {
        const chosenMusician = botChooseStartingMusician(state, currentIdx);
        return GameEngine.selectStartingMusician(state, chosenMusician.id);
      }
      return state;
    }

    // ── CENÁRIO 2: ESCOLHA PENDENTE DE CUBO (HABILIDADE / EVENTO) ──
    if (state.pendingCubeChoice) {
      const pIdx = state.pendingCubeChoice.playerIndex;
      const player = state.players[pIdx];
      if (player?.isBot) {
        const needed = getNeededCubeColors(player);
        let chosenColor: NoteColor = 'blue';
        for (const col of needed) {
          if ((state.mainBag[col as keyof typeof state.mainBag] || 0) > 0) {
            chosenColor = col;
            break;
          }
        }
        return GameEngine.resolvePendingCubeChoice(state, { chosenColor }).newState;
      }
      return state;
    }

    // ── CENÁRIO 3: ESCOLHA PENDENTE DE ESTILO (OBJETIVOS) ──
    if (state.pendingStyleChoice) {
      const pIdx = state.pendingStyleChoice.playerIndex;
      const player = state.players[pIdx];
      if (player?.isBot) {
        const styles = state.pendingStyleChoice.drawnStyles;
        const chosenStyle = styles[0];
        return GameEngine.resolvePendingStyleChoice(state, chosenStyle?.id || '').newState;
      }
      return state;
    }

    // ── CENÁRIO 4: MODAL DO LUTHIER (RECURSO 15) ──
    if (state.pendingLuthierChoice) {
      const pIdx = state.pendingLuthierChoice.playerIndex;
      const player = state.players[pIdx];
      if (player?.isBot) {
        const availableInstruments = state.pendingLuthierChoice.availableInstruments;
        const affordable = availableInstruments.filter(inst => player.coins >= inst.cost);
        if (affordable.length > 0 && player.coins >= 8) {
          return GameEngine.resolvePendingLuthierChoice(state, affordable[0].id).newState;
        }
        return GameEngine.resolvePendingLuthierChoice(state, undefined).newState;
      }
      return state;
    }

    // ── CENÁRIO 5: MODAL DA BICICLETA (RECURSO 14) ──
    if (state.pendingBicicletaDecision) {
      const ownerIdx = state.pendingBicicletaDecision.ownerPlayerIndex;
      const owner = state.players[ownerIdx];
      if (owner?.isBot) {
        // Se tempo <= 3, recusa moeda e ganha +1 Tempo; senão recebe 1 moeda
        const waive = owner.timeMarker <= 3;
        return GameEngine.resolveBicicletaDecision(state, waive).newState;
      }
      return state;
    }

    // ── CENÁRIO 6: FASE DE ESCOLHA DE CLUBES ──
    if (state.phase === 'club_selection') {
      const currentIdx = state.currentPlayerIndex;
      const player = state.players[currentIdx];
      if (player?.isBot && player.chosenClub === null) {
        const bestClub = botChooseBestClub(state, currentIdx);
        return GameEngine.goToClub(state, bestClub).newState;
      }
      return state;
    }

    // ── CENÁRIO 7: FASE DA NOITE (APRESENTAÇÕES NOS CLUBES) ──
    if (state.phase === 'night') {
      const showPlayerIdx = state.currentPlayerIndex;
      const player = state.players[showPlayerIdx];
      if (player?.isBot && player.chosenClub) {
        return executeAutomatedBotGig(state, showPlayerIdx);
      }
      return state;
    }

    // ── CENÁRIO 8: FASE DE DIA (AÇÕES NO TABULEIRO) ──
    if (state.phase === 'day') {
      const currentIdx = state.currentPlayerIndex;
      const player = state.players[currentIdx];
      if (player?.isBot) {
        if (player.hasFinishedDay || player.timeMarker < 1 || state.turnActionState.hasActedThisTurn) {
          return GameEngine.passTurn(state);
        }

        const decision = computeBotDayAction(state, currentIdx);

        if (decision.actionType === 'go_to_club' && decision.actionDetails?.clubId) {
          return GameEngine.goToClub(state, decision.actionDetails.clubId as ClubId).newState;
        }

        if (decision.actionType === 'location_action' && decision.targetLocation && decision.actionDetails) {
          const loc = decision.targetLocation;
          const details = decision.actionDetails;

          // 1. Pré-seleciona localização
          let movedState = GameEngine.selectTargetLocation(state, loc);

          // 2. Executa a ação do local com validação estrita
          let result: { newState: GameState; success: boolean; message?: string } | null = null;
          switch (details.type) {
            case 'radio':
              result = GameEngine.performRadioAction(movedState, details.discId as string, details.option as any);
              break;
            case 'record_disc':
              result = GameEngine.performGravadoraRecordDisc(movedState, details.compositionId as string);
              break;
            case 'conservatorio_skill':
              result = GameEngine.performConservatorioGainSkill(movedState, { chosenConservatorioCubeIndex: details.cubeIndex as number });
              break;
            case 'conservatorio_compose':
              result = GameEngine.performConservatorioCompose(movedState, details.spendInspiration as boolean, details.cubeIndex as number);
              break;
            case 'lojas_buy_resource': {
              const buyRes = GameEngine.performLojasBuyResource(movedState, details.slotIndex as number);
              if (buyRes.success) {
                return GameEngine.performLojasFinishShopping(buyRes.newState);
              }
              result = buyRes;
              break;
            }
            case 'ruas_hire':
              result = GameEngine.performRuasHireMusician(movedState, details.slotIndex as number, details.replacedMusicianId as string);
              break;
            case 'parque':
              result = GameEngine.performParqueAction(movedState);
              break;
          }

          if (result) {
            if (result.success) {
              return result.newState;
            } else {
              console.error(`[BOT ACTION ERROR] ${player.name} falhou ao tentar executar "${details.type}" no local ${loc}: ${result.message}`, { details, player });
              return {
                ...state,
                log: [
                  ...state.log,
                  `⚠️ [ERRO DO BOT] ${player.name} tentou ${details.type} no local ${loc}, mas a ação falhou: "${result.message}".`,
                ],
              };
            }
          }
        }

        // Se o bot não encontrou ação válida mas ainda tem tempo e não agiu, reporta o erro
        if (!state.turnActionState.hasActedThisTurn && !player.hasFinishedDay && player.timeMarker >= 1) {
          console.error(`[BOT DECISION ERROR] ${player.name} tem tempo (${player.timeMarker}) mas não tomou uma ação válida!`, { decision, player });
          return {
            ...state,
            log: [
              ...state.log,
              `⚠️ [ERRO DO BOT] ${player.name} possui ${player.timeMarker} de tempo mas nenhuma ação válida foi selecionada!`,
            ],
          };
        }

        // Passa o turno apenas se já agiu legalmente neste turno
        if (state.turnActionState.hasActedThisTurn || player.hasFinishedDay) {
          return GameEngine.passTurn(state);
        }
      }
    }

    return state;
  } catch (err) {
    console.error('Erro na execução do Bot:', err);
    return state;
  }
}

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

function getNeededCubeColors(player: PlayerState): NoteColor[] {
  const needed: Record<string, number> = {};
  player.musicians.forEach(m => {
    const filled = m.filledNotes || [];
    m.notes.forEach((n, idx) => {
      if (!filled[idx] && n.color !== 'wild') {
        needed[n.color] = (needed[n.color] || 0) + 1;
      }
    });
  });
  const sorted = Object.entries(needed).sort((a, b) => b[1] - a[1]).map(([col]) => col as NoteColor);
  return sorted.length > 0 ? sorted : ['blue', 'red', 'yellow', 'purple'];
}

const ALL_AVAILABLE_FALLBACK_MUSICIAN: MusicianCard = {
  id: 'musico_init_fallback',
  name: 'Músico Inicial',
  artistNumber: 1,
  level: 1,
  cost: 0,
  notes: [
    { color: 'blue', points: 1 },
    { color: 'red', points: 2 },
  ],
  image: '/assets/musicos/frente/musicos_01.jpg',
};
