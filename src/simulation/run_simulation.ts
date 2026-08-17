import { GameEngine, createInitialState } from '../engine/gameEngine';
import type { PlayerState } from '../types/game';
import type { NoteColor } from '../types/cards';
import { CLUBS } from '../types/board';

export interface GameStats {
  gameNumber: number;
  totalDurationRounds: number;
  winner: string;
  rounds: {
    round: number;
    event: string | null;
    firstPlayer: string;
    playersRoundEnd: {
      name: string;
      coins: number;
      renown: number;
      skill: number;
      inspiration: number;
      musiciansCount: number;
      discsCount: number;
      clubVisited: string | null;
      gigPoints: number;
      gigSuccess: boolean;
      score: number;
    }[];
  }[];
  finalRanking: {
    rank: number;
    name: string;
    color: string;
    finalScore: number;
    coins: number;
    renown: number;
    skill: number;
    musiciansCount: number;
    musicians: { name: string; level: number }[];
    resources: { name: string; vp: number }[];
    discs: number;
    bagSize: number;
  }[];
}

// Heurística de Alocação de Cubos durante o Show
function simulateOptimalGigPlacement(
  player: PlayerState,
  drawnCubes: NoteColor[]
): { assignments: Record<string, NoteColor[]>; points: number } {
  const assignments: Record<string, (NoteColor | null)[]> = {};
  player.musicians.forEach(m => {
    assignments[m.id] = new Array(m.notes.length).fill(null);
  });

  for (const cube of drawnCubes) {
    if (cube === 'white' && !player.styles.some(s => s.effectType === 'white_as_wild')) {
      continue; // Cubo branco bloqueado sem estilo
    }

    let placed = false;
    for (const m of player.musicians) {
      if (placed) break;
      const current = assignments[m.id];
      const filledColors = current.filter((c): c is NoteColor => c !== null);

      if (m.specialRule?.type === 'same_color' && filledColors.length > 0 && filledColors[0] !== cube) {
        continue;
      }
      if (m.specialRule?.type === 'different_colors' && filledColors.includes(cube)) {
        continue;
      }

      for (let i = 0; i < m.notes.length; i++) {
        if (current[i] === null) {
          const note = m.notes[i];
          if (note.color === 'wild' || note.color === cube) {
            current[i] = cube;
            placed = true;
            break;
          }
        }
      }
    }
  }

  let totalPts = 0;
  const finalAssigns: Record<string, NoteColor[]> = {};
  player.musicians.forEach(m => {
    const arr = assignments[m.id];
    finalAssigns[m.id] = arr.filter((c): c is NoteColor => c !== null);
    arr.forEach((c, i) => {
      if (c !== null) totalPts += m.notes[i].points;
    });
  });

  return { assignments: finalAssigns, points: totalPts };
}

export function simulateSingleGame(gameNumber: number): GameStats {
  let state = createInitialState({
    playerNames: ['Ana (Laranja)', 'Bruno (Rosa)', 'Carlos (Verde)'],
    playerColors: ['orange', 'pink', 'green'],
  });

  const roundsStats: GameStats['rounds'] = [];

  while (!state.isGameOver && state.round <= 6) {
    const currentRound = state.round;
    const currentEventName = state.currentEvent ? state.currentEvent.name : null;
    const startingPlayerName = state.players[state.currentPlayerIndex].name;

    // Se o evento for Patrocínio, resolve escolhas
    if (state.currentEvent?.id === 'evento_04' || state.currentEvent?.effectType === 'sponsorship_choice') {
      state.players.forEach((p, pIdx) => {
        const choice: 'coins' | 'renown' | 'skill' = p.coins < 6 ? 'coins' : p.renown < 4 ? 'renown' : 'skill';
        state = GameEngine.applySponsorshipChoice(state, pIdx, choice);
        if (state.pendingCubeChoice) {
          const { newState } = GameEngine.resolvePendingCubeChoice(state, { spendInspiration: false });
          state = newState;
        }
      });
    }

    // ─── FASE DE DIA: Ações dos Jogadores ───────────────────
    let safetyTurns = 0;
    while (state.phase === 'day' && safetyTurns < 100) {
      safetyTurns++;
      const p = state.players[state.currentPlayerIndex];

      if (p.hasFinishedDay || p.timeMarker < 1) {
        state = GameEngine.nextTurn(state);
        continue;
      }

      // Se tiver pouco tempo restante (<= 2), decide ir ao clube
      if (p.timeMarker <= 1 || (p.boardPosition !== 0 && p.timeMarker <= 2 && Math.random() > 0.35)) {
        const eligibleClubs = CLUBS.filter(c => p.renown >= c.minRenown);
        const bestClub = eligibleClubs[eligibleClubs.length - 1] || CLUBS[0];
        const res = GameEngine.goToClub(state, bestClub.id);
        if (res.success) {
          state = res.newState;
          state = GameEngine.nextTurn(state);
          continue;
        }
      }

      // Escolhe destino válido no mapa
      const currentPos = p.boardPosition;
      let candidates: number[] = [];

      if (p.coins >= 6 && p.musicians.length < p.maxMusicians && state.market.musicians.some(m => m !== null && p.coins >= m.cost)) {
        candidates.push(3); // Ruas
      }
      if (p.coins >= 4 && p.compositions.some(c => !c.isRecorded)) {
        candidates.push(4); // Gravadora
      }
      if (p.skill < 4) {
        candidates.push(2); // Conservatório
      }
      if (p.discs.length > 0) {
        candidates.push(1); // Rádio
      }
      if (p.coins < 5) {
        candidates.push(6); // Parque
      }
      if (p.coins >= 3 && state.market.resources.some(r => r !== null && p.coins >= r.cost)) {
        candidates.push(5); // Lojas
      }

      // Filtra candidatos para não ficar na mesma posição
      candidates = candidates.filter(c => c !== currentPos);
      if (candidates.length === 0) {
        candidates = [1, 2, 3, 4, 5, 6].filter(c => c !== currentPos);
      }

      const targetLoc = candidates[0];
      state = GameEngine.selectTargetLocation(state, targetLoc);

      // Executa a ação do local correspondente
      if (targetLoc === 1) {
        const res = GameEngine.performRadioAction(state, p.discs[0]?.id, p.discs.length > 0 ? 'play_disc' : 'publicity');
        if (res.success) state = res.newState;
      } else if (targetLoc === 2) {
        if (p.skill >= 3 && p.compositions.filter(c => !c.isRecorded).length === 0 && Math.random() > 0.5) {
          const res = GameEngine.performConservatorioCompose(state, false, 0);
          if (res.success) state = res.newState;
        } else {
          const res = GameEngine.performConservatorioGainSkill(state, { chosenConservatorioCubeIndex: 0, skillUpSpendInspiration: false });
          if (res.success) state = res.newState;
        }
      } else if (targetLoc === 3) {
        const affordableMusicianIdx = state.market.musicians.findIndex(m => m !== null && p.coins >= m.cost);
        if (affordableMusicianIdx !== -1 && p.musicians.length < p.maxMusicians) {
          const res = GameEngine.performRuasHireMusician(state, affordableMusicianIdx);
          if (res.success) state = res.newState;
        }
      } else if (targetLoc === 4) {
        const unrecordedComp = p.compositions.find(c => !c.isRecorded);
        if (unrecordedComp && p.coins >= 4) {
          const res = GameEngine.performGravadoraRecordDisc(state, unrecordedComp.id);
          if (res.success) state = res.newState;
        }
      } else if (targetLoc === 5) {
        const affordableResIdx = state.market.resources.findIndex(r => r !== null && p.coins >= r.cost);
        if (affordableResIdx !== -1) {
          const res = GameEngine.performLojasBuyResource(state, affordableResIdx);
          if (res.success) state = res.newState;
        }
        if (p.coins >= 2 && !state.turnActionState.hasBoughtCubeThisTurn) {
          const res = GameEngine.performLojasBuyCube(state, 'red');
          if (res.success) state = res.newState;
        }
        state = GameEngine.performLojasFinishShopping(state);
      } else if (targetLoc === 6) {
        const res = GameEngine.performParqueAction(state);
        if (res.success) state = res.newState;
      }

      state = GameEngine.nextTurn(state);
    }

    // ─── FASE DE ESCOLHA DE CLUBES (se houver jogadores pendentes) ───
    if (state.phase === 'club_selection') {
      state.players.forEach((p) => {
        if (p.chosenClub === null) {
          const eligibleClubs = CLUBS.filter(c => p.renown >= c.minRenown);
          const chosen = eligibleClubs[eligibleClubs.length - 1] || CLUBS[0];
          const res = GameEngine.goToClub(state, chosen.id);
          if (res.success) state = res.newState;
        }
      });
      state = GameEngine.nextTurn(state);
    }

    // ─── FASE DA NOITE: Apresentações nos Clubes ────────────
    const roundPlayersSummary = [];

    if (state.phase === 'night') {
      for (let i = 0; i < state.players.length; i++) {
        const p = state.players[i];
        const club = CLUBS.find(c => c.id === p.chosenClub) || CLUBS[0];

        const drawCount = p.skill;
        const drawnCubes: NoteColor[] = [];
        const bagCopy = [...p.bag];
        for (let d = 0; d < drawCount && bagCopy.length > 0; d++) {
          const randIdx = Math.floor(Math.random() * bagCopy.length);
          drawnCubes.push(bagCopy.splice(randIdx, 1)[0]);
        }

        const { assignments, points } = simulateOptimalGigPlacement(p, drawnCubes);
        const success = points >= club.successThreshold;
        const audience = Math.min(club.maxCapacity, p.renown * 10 + (p.hasPublicityToken ? 30 : 0));
        const coins = Math.floor(audience / 10);

        const gigRes = GameEngine.performNightGig(state, assignments, {
          pointsGained: points,
          coinsGained: coins,
          audience,
          success,
        });
        if (gigRes.success) state = gigRes.newState;

        if (success) {
          const availableRewards = (state.clubRewards[club.id] || []).filter(r => !r.claimedByPlayerId);
          if (availableRewards.length > 0) {
            const rewardRes = GameEngine.claimClubReward(state, club.id, availableRewards[0].id);
            if (rewardRes.success) state = rewardRes.newState;
          }
        }

        const updatedP = state.players[i];
        roundPlayersSummary.push({
          name: updatedP.name,
          coins: updatedP.coins,
          renown: updatedP.renown,
          skill: updatedP.skill,
          inspiration: updatedP.inspiration,
          musiciansCount: updatedP.musicians.length,
          discsCount: updatedP.discs.length,
          clubVisited: club.name,
          gigPoints: points,
          gigSuccess: success,
          score: updatedP.score,
        });
      }
    }

    roundsStats.push({
      round: currentRound,
      event: currentEventName,
      firstPlayer: startingPlayerName,
      playersRoundEnd: roundPlayersSummary,
    });

    state = GameEngine.startNewRound(state);
  }

  const finalSorted = [...state.players].sort((a, b) => b.score - a.score);

  return {
    gameNumber,
    totalDurationRounds: 6,
    winner: finalSorted[0].name,
    rounds: roundsStats,
    finalRanking: finalSorted.map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      color: p.color,
      finalScore: p.score,
      coins: p.coins,
      renown: p.renown,
      skill: p.skill,
      musiciansCount: p.musicians.length,
      musicians: p.musicians.map(m => ({
        name: m.name,
        level: m.level,
      })),
      resources: p.resources.map(r => ({ name: r.name, vp: r.victoryPoints })),
      discs: p.discs.length,
      bagSize: p.bag.length,
    })),
  };
}

export function runAllSimulations(): GameStats[] {
  return [
    simulateSingleGame(1),
    simulateSingleGame(2),
    simulateSingleGame(3),
  ];
}
