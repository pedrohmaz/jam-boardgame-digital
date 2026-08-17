/**
 * JAM Board Game - Motor de Jogo (Game Engine)
 *
 * Este módulo contém toda a lógica pura do jogo, sem dependências de UI.
 * Exporta funções que recebem um GameState e retornam um novo GameState imutável.
 *
 * Referência: Manual de regras JAM v5.1
 */

import type { GameState, PlayerState, TurnActionState, CompositionToken, PendingStyleChoice, NeutralDieState, PlayerColor } from '../types/game';
import { SKILL_STEPS_VALUES, SKILL_STEPS_LABELS } from '../types/game';
import type { NoteColor, ResourceCard, MusicianCard } from '../types/cards';
import type { ClubId } from '../types/board';
import { CLUBS, BOARD_LOCATIONS, INITIAL_CLUB_REWARDS } from '../types/board';
import { ALL_MUSICIANS, LEVEL1_MUSICIANS, LEVEL2_MUSICIANS, LEVEL3_MUSICIANS } from '../data/musicians';
import { ALL_STYLES, ALL_EVENTS } from '../data/styles_events';
import { ALL_RESOURCES, ALL_OBJECTIVES } from '../data/resources';

// ─── UTILITÁRIOS ─────────────────────────────────────────────────────────────

export function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Rola o Dado Neutro (1 a 6). Se informado a posição atual, garante que o resultado é diferente (não repete o mesmo local).
 */
export function rollNeutralDie(currentPosition?: number): number {
  let newPos: number;
  do {
    newPos = Math.floor(Math.random() * 6) + 1;
  } while (newPos === currentPosition);
  return newPos;
}

/**
 * Em partidas para 2 jogadores, quando o jogador realiza a ação do espaço em que o Dado Neutro se encontra,
 * o dado neutro é rolado e movido para um novo espaço (sem repetir o local atual).
 */
export function maybeTriggerNeutralDieReroll(
  state: GameState,
  actionLocationIndex: number
): { neutralDie: NeutralDieState | null | undefined; logMessage?: string } {
  const currentDie = state.neutralDie;
  if (state.players.length !== 2 || !currentDie) {
    return { neutralDie: state.neutralDie };
  }

  if (currentDie.position !== actionLocationIndex) {
    return { neutralDie: currentDie };
  }

  const newPos = rollNeutralDie(currentDie.position);
  const locName = BOARD_LOCATIONS.find(l => l.index === newPos)?.name || `Local ${newPos}`;
  const oldLocName = BOARD_LOCATIONS.find(l => l.index === currentDie.position)?.name || `Local ${currentDie.position}`;

  const updatedNeutralDie: NeutralDieState = {
    ...currentDie,
    position: newPos,
    value: newPos,
  };

  const logMessage = `🎲 Dado Neutro (${currentDie.color}): ação realizada em ${oldLocName} ➔ Dado Neutro rolou ${newPos} e moveu-se para ${locName}!`;

  return { neutralDie: updatedNeutralDie, logMessage };
}

export function drawRandom<T>(array: T[]): { item: T; remaining: T[] } | null {
  if (array.length === 0) return null;
  const idx = Math.floor(Math.random() * array.length);
  const item = array[idx];
  const remaining = [...array.slice(0, idx), ...array.slice(idx + 1)];
  return { item, remaining };
}

const INITIAL_TURN_ACTION_STATE: TurnActionState = {
  selectedLocation: null,
  hasActedThisTurn: false,
  isShoppingInLojas: false,
  hasBoughtCubeThisTurn: false,
  hasSoldDiscThisTurn: false,
  lojasBonusChoice: null,
};

// ─── SETUP DO JOGO ────────────────────────────────────────────────────────────

export interface SetupOptions {
  playerNames: string[];
  playerColors: string[];
  isBots?: boolean[];
  botDifficulties?: ('easy' | 'medium' | 'hard')[];
}

export function createInitialState(options: SetupOptions): GameState {
  const numPlayers = options.playerNames.length;
  if (numPlayers < 1 || numPlayers > 4) {
    throw new Error('JAM suporta 1-4 jogadores.');
  }

  // Baralho único de Músicos: Nível 3 no fundo, Nível 2 no meio, Nível 1 no topo
  const shuffledLevel3 = shuffle(LEVEL3_MUSICIANS);
  const shuffledLevel2 = shuffle(LEVEL2_MUSICIANS);
  const shuffledLevel1 = shuffle(LEVEL1_MUSICIANS);
  const fullMusiciansDeck = [...shuffledLevel1, ...shuffledLevel2, ...shuffledLevel3];

  // Baralho de Recursos: As cartas de Instrumento só são embaralhadas no baralho após o setup inicial
  const personalResources = ALL_RESOURCES.filter(r => r.cardType === 'personal');
  const instrumentResources = ALL_RESOURCES.filter(r => r.cardType === 'instrument');
  const shuffledPersonal = shuffle(personalResources);
  const initialMarketResources = shuffledPersonal.slice(0, 4);
  const remainingResourcesDeck = shuffle([...shuffledPersonal.slice(4), ...instrumentResources]);

  const shuffledObjectives = shuffle(ALL_OBJECTIVES);
  const availableStyles = shuffle(ALL_STYLES);
  const shuffledEvents = shuffle(ALL_EVENTS);

  const eventsByRound: Record<number, string> = {};
  for (let r = 2; r <= 6; r++) {
    const ev = shuffledEvents[r - 2];
    if (ev) eventsByRound[r] = ev.id;
  }

  const initialMainBag = {
    red: 6,
    blue: 6,
    yellow: 6,
    purple: 6,
    white: 0,
  };

  const availableBagColors: NoteColor[] = [];
  Object.entries(initialMainBag).forEach(([c, count]) => {
    for (let i = 0; i < count; i++) availableBagColors.push(c as NoteColor);
  });

  const cons1 = drawRandom(availableBagColors);
  const cube1 = cons1 ? cons1.item : 'red';
  if (cons1 && cube1 in initialMainBag) {
    initialMainBag[cube1 as keyof typeof initialMainBag]--;
  }

  // Garante que o 2º cubo do Conservatório tenha cor estritamente diferente do 1º
  const remainingColorsForSecond = availableBagColors.filter(c => c !== cube1);
  const cons2 = drawRandom(remainingColorsForSecond);
  const cube2 = cons2 ? cons2.item : (cube1 === 'red' ? 'blue' : 'red');
  if (cube2 in initialMainBag) {
    initialMainBag[cube2 as keyof typeof initialMainBag]--;
  }

  const conservatorioCubes: NoteColor[] = [cube1, cube2];

  const availableStartingMusicians = ALL_MUSICIANS.slice(0, 4);
  const draftPlayerIndices = Array.from({ length: numPlayers }, (_, i) => numPlayers - 1 - i);

  // Ordem dos jogadores na primeira rodada é aleatória
  const initialPlayerConfigs = options.playerNames.map((name, i) => ({
    name,
    color: options.playerColors[i] || 'gray',
    isBot: options.isBots ? !!options.isBots[i] : false,
    botDifficulty: options.botDifficulties ? (options.botDifficulties[i] || 'medium') : 'medium',
  }));
  const randomizedPlayerConfigs = shuffle(initialPlayerConfigs);

  const players: PlayerState[] = randomizedPlayerConfigs.map((cfg, i) => {
    const startingBag: NoteColor[] = ['white', 'white', 'white', 'red', 'purple', 'blue', 'yellow'];

    return {
      id: `player_${i}`,
      name: cfg.name,
      color: cfg.color,
      isBot: cfg.isBot,
      botDifficulty: cfg.botDifficulty,
      coins: 8 + i,
      renown: 1,
      skillStepIndex: 0,
      skill: 2,
      inspiration: 1,
      score: 0,
      timeMarker: 5,
      bag: startingBag,
      musicians: [],
      resources: [],
      styles: [],
      objective: shuffledObjectives[i] ? { ...shuffledObjectives[i], completedGoals: [false, false, false] } : null,
      compositions: [{ id: `comp_init_${i}`, level: 1, isRecorded: false }],
      discs: [],
      totalDiscsRecorded: 0,
      gigs: [],
      boardPosition: 0,
      hasRoadie: false,
      hasPublicityToken: false,
      hasFinishedDay: false,
      chosenClub: null,
      maxMusicians: 3,
      reservedStyle: null,
    };
  });

  const market = {
    musicians: fullMusiciansDeck.slice(0, 4) as (MusicianCard | null)[],
    resources: initialMarketResources as (ResourceCard | null)[],
    styles: availableStyles.slice(0, 3),
  };

  let neutralDie: NeutralDieState | null = null;
  const neutralDieLogs: string[] = [];

  if (numPlayers === 2) {
    const allColors: PlayerColor[] = ['orange', 'pink', 'green', 'brown', 'gray'];
    const usedColors = (options.playerColors && options.playerColors.length > 0)
      ? options.playerColors
      : players.map(p => p.color);
    const unusedColors = allColors.filter(c => !usedColors.includes(c));
    const neutralColor = unusedColors.length > 0
      ? unusedColors[Math.floor(Math.random() * unusedColors.length)]
      : 'gray';

    const initialPos = rollNeutralDie();
    neutralDie = {
      color: neutralColor,
      position: initialPos,
      value: initialPos,
    };

    const locName = BOARD_LOCATIONS.find(l => l.index === initialPos)?.name || `Local ${initialPos}`;
    neutralDieLogs.push(`🎲 Setup (2 Jogadores): Dado Neutro [cor: ${neutralColor}] rolou ${initialPos} ➔ posicionado em ${locName}!`);
  }

  return {
    phase: 'day',
    round: 1,
    maxRounds: 6,
    currentPlayerIndex: 0,
    players,
    market,
    decks: {
      musicians: fullMusiciansDeck.slice(4),
      resources: remainingResourcesDeck,
      styles: availableStyles.slice(3),
      events: shuffledEvents,
    },
    conservatorioCubes,
    eventsByRound,
    currentEvent: null,
    turnActionState: { ...INITIAL_TURN_ACTION_STATE },
    nightPresentationPlayerIndex: 0,
    mainBag: initialMainBag,
    clubRewards: JSON.parse(JSON.stringify(INITIAL_CLUB_REWARDS)),
    isInitialDraftActive: true,
    availableStartingMusicians,
    draftPlayerIndices,
    pendingStyleChoice: null,
    neutralDie,
    log: [
      `Jogo criado com ${numPlayers} jogador(es).`,
      ...neutralDieLogs,
      `─── Escolha dos Músicos Iniciais (Ordem Reversa) ───`,
      `Vez de ${players[draftPlayerIndices[0]].name} escolher seu músico inicial.`,
    ],
    winner: null,
    isGameOver: false,
  };
}

export function selectStartingMusician(
  state: GameState,
  musicianId: string
): GameState {
  if (!state.isInitialDraftActive || !state.draftPlayerIndices || state.draftPlayerIndices.length === 0) {
    return state;
  }

  const currentDraftPlayerIdx = state.draftPlayerIndices[0];
  const player = state.players[currentDraftPlayerIdx];
  const availableMusicians = state.availableStartingMusicians || [];
  const chosenMusician = availableMusicians.find(m => m.id === musicianId);

  if (!player || !chosenMusician) {
    return state;
  }

  const cost = chosenMusician.cost || 0;
  const updatedPlayer: PlayerState = {
    ...player,
    coins: Math.max(0, player.coins - cost),
    musicians: [{ ...chosenMusician, filledNotes: [] as (NoteColor | null)[] }],
  };

  const updatedPlayers = state.players.map((p, i) =>
    i === currentDraftPlayerIdx ? updatedPlayer : p
  );

  const remainingAvailable = availableMusicians.filter(m => m.id !== musicianId);
  const nextDraftQueue = state.draftPlayerIndices.slice(1);
  const isDraftComplete = nextDraftQueue.length === 0;

  const logText = `${player.name} pagou ${cost} moeda(s) e escolheu ${chosenMusician.name} como músico inicial! (Saldo restante: ${updatedPlayer.coins} moedas)`;

  return {
    ...state,
    players: updatedPlayers,
    availableStartingMusicians: remainingAvailable,
    draftPlayerIndices: nextDraftQueue,
    isInitialDraftActive: !isDraftComplete,
    log: [
      ...state.log,
      logText,
      ...(isDraftComplete ? [
        '─── Draft Inicial de Músicos Concluído! ───',
        `Rodada 1: Fase de Dia! Vez de ${updatedPlayers[0].name}. Selecione um local no mapa para se mover antes de agir!`,
      ] : [
        `Vez de ${updatedPlayers[nextDraftQueue[0]].name} escolher seu músico inicial.`,
      ]),
    ],
  };
}

// ─── REGRAS DE MOVIMENTO ──────────────────────────────────────────────────────

export interface MovementCostInfo {
  timeCost: number;
  isForward: boolean;
  isReachable: boolean;
  visitingFee: number;
  playersAtTarget: PlayerState[];
  hasNeutralDieAtTarget?: boolean;
  reason?: string;
}

export function calculateMovement(
  player: PlayerState,
  targetPos: number,
  allPlayers: PlayerState[],
  isReverseArrows = false,
  neutralDie?: NeutralDieState | null
): MovementCostInfo {
  const currentPos = player.boardPosition;

  if (targetPos === currentPos) {
    return { timeCost: 0, isForward: false, isReachable: false, visitingFee: 0, playersAtTarget: [], reason: 'O movimento é obrigatório. Selecione outro local para onde se mover.' };
  }
  if (targetPos === 0) {
    return { timeCost: 0, isForward: false, isReachable: false, visitingFee: 0, playersAtTarget: [], reason: 'A Casa é apenas o ponto de partida da rodada.' };
  }
  if (targetPos < 1 || targetPos > 6) {
    return { timeCost: 0, isForward: false, isReachable: false, visitingFee: 0, playersAtTarget: [], reason: 'Posição inválida.' };
  }

  let timeCost = 1;
  let isForward = true;

  if (isReverseArrows) {
    // Vias Interditadas: sentido horário/numérico invertido (6 -> 5 -> 4 -> 3 -> 2 -> 1)
    if (currentPos === 6 || currentPos === 0) {
      timeCost = 1;
      isForward = true;
    } else if (targetPos < currentPos) {
      timeCost = 1;
      isForward = true;
    } else {
      timeCost = 2;
      isForward = false;
    }
  } else {
    // Sentido normal (Casa / 1 -> 2 -> 3 -> 4 -> 5 -> 6)
    if (currentPos === 0) {
      timeCost = 1;
      isForward = true;
    } else if (targetPos > currentPos) {
      timeCost = 1;
      isForward = true;
    } else {
      timeCost = 2;
      isForward = false;
    }
  }

  const otherPlayersAtTarget = allPlayers.filter(
    p => p.id !== player.id && p.boardPosition === targetPos && p.chosenClub === null && p.boardPosition >= 0
  );
  const hasNeutralDieAtTarget = !!(neutralDie && neutralDie.position === targetPos);

  const hasEmpresario = player.resources.some(r => r.effectType === 'no_entry_fee');
  const visitingFee = (targetPos !== 6 && !hasEmpresario)
    ? otherPlayersAtTarget.length + (hasNeutralDieAtTarget ? 1 : 0)
    : 0;

  const hasEnoughTime = player.timeMarker >= timeCost;
  const hasEnoughCoins = player.coins >= visitingFee;
  const isReachable = hasEnoughTime && hasEnoughCoins;

  let reason: string | undefined;
  if (!hasEnoughTime) reason = `Tempo insuficiente (precisa de ${timeCost} tempo, tem ${player.timeMarker}).`;
  else if (!hasEnoughCoins) reason = `Moedas insuficientes para pagar a taxa de visitação (${visitingFee} moeda(s) necessárias, tem ${player.coins}).`;

  return {
    timeCost,
    isForward,
    isReachable,
    visitingFee,
    playersAtTarget: otherPlayersAtTarget,
    hasNeutralDieAtTarget,
    reason,
  };
}

/**
 * Helper para conceder Inspiração a um jogador, aplicando o efeito do Recurso 13 (Baralho de Cartas):
 * - Se o jogador possuir o Baralho de Cartas (recurso_13 / inspiration_to_points):
 *   - Se já tiver 3 fichas de inspiração (máximo) OU preferir pontos, ganha automaticamente +2 VP por ficha.
 *   - Se tiver menos de 3 fichas, ganha a inspiração normalmente.
 */
export function applyInspirationGain(
  player: PlayerState,
  amount: number = 1
): { updatedPlayer: PlayerState; gainedInspiration: number; gainedVP: number; logMessage: string } {
  const hasBaralhoDeCartas = player.resources.some(r => r.id === 'recurso_13' || r.effectType === 'inspiration_to_points');
  let currentInsp = player.inspiration;
  let currentScore = player.score;
  let gainedInsp = 0;
  let gainedVP = 0;
  const logs: string[] = [];

  for (let i = 0; i < amount; i++) {
    if (hasBaralhoDeCartas && currentInsp >= 3) {
      currentScore += 2;
      gainedVP += 2;
      logs.push(`+2 Pontos de Vitória (Baralho de Cartas: limite de Inspiração atingido)`);
    } else if (currentInsp < 3) {
      currentInsp += 1;
      gainedInsp += 1;
      logs.push(`+1 Inspiração (${currentInsp}/3)`);
    } else {
      logs.push(`(limite de 3 Inspirações atingido)`);
    }
  }

  return {
    updatedPlayer: {
      ...player,
      inspiration: currentInsp,
      score: currentScore,
    },
    gainedInspiration: gainedInsp,
    gainedVP,
    logMessage: logs.join(', '),
  };
}

export function selectTargetLocation(
  state: GameState,
  targetPosition: number
): GameState {
  if (state.turnActionState.hasActedThisTurn) return state;

  const player = state.players[state.currentPlayerIndex];
  const isInvertArrows = state.currentEvent?.effectType === 'invert_arrow_direction';
  const moveInfo = calculateMovement(player, targetPosition, state.players, isInvertArrows, state.neutralDie);

  if (!moveInfo.isReachable) return state;

  return {
    ...state,
    turnActionState: {
      ...state.turnActionState,
      selectedLocation: targetPosition,
    },
  };
}

function applyMovement(state: GameState, targetPos: number): { state: GameState; isForward: boolean } {
  const player = state.players[state.currentPlayerIndex];
  if (player.boardPosition === targetPos) {
    return {
      state,
      isForward: state.turnActionState.isForwardMovementInLojas ?? false,
    };
  }

  const isInvertArrows = state.currentEvent?.effectType === 'invert_arrow_direction';
  const moveInfo = calculateMovement(player, targetPos, state.players, isInvertArrows, state.neutralDie);
  const canAffordAllFees = player.coins >= moveInfo.visitingFee;

  // Checa se há algum jogador no destino com a Bicicleta (recurso 14) que ainda não a utilizou nesta rodada
  const otherPlayersAtTarget = state.players.filter(
    (p, i) => i !== state.currentPlayerIndex && p.boardPosition === targetPos
  );
  const bicicletaOwner = otherPlayersAtTarget.find(
    p => p.resources.some(r => r.id === 'recurso_14' || r.effectType === 'refuse_coin_gain_time') && !p.hasUsedBicicletaThisRound
  );

  let pendingBicicletaDecision: import('../types/game').PendingBicicletaDecision | null = null;
  if (bicicletaOwner && targetPos !== 6 && canAffordAllFees) {
    pendingBicicletaDecision = {
      ownerPlayerId: bicicletaOwner.id,
      ownerPlayerIndex: state.players.findIndex(p => p.id === bicicletaOwner.id),
      visitingPlayerId: player.id,
      visitingPlayerIndex: state.currentPlayerIndex,
      targetLocation: targetPos,
      originalVisitingFee: moveInfo.visitingFee,
    };
  }

  const updatedPlayers = state.players.map((p, i) => {
    if (i === state.currentPlayerIndex) {
      const remainingTime = p.timeMarker - moveInfo.timeCost;
      const isOutOfTime = remainingTime < 1;
      // Se há decisão pendente da bicicleta, desconta as outras taxas agora (ou todas se não houver)
      const feeToPayNow = bicicletaOwner ? Math.max(0, moveInfo.visitingFee - 1) : moveInfo.visitingFee;

      return {
        ...p,
        boardPosition: isOutOfTime ? 0 : targetPos,
        timeMarker: remainingTime,
        coins: canAffordAllFees ? p.coins - feeToPayNow : p.coins,
        score: canAffordAllFees ? p.score : Math.max(0, p.score - 1),
        hasFinishedDay: isOutOfTime ? true : p.hasFinishedDay,
      };
    }
    // Apenas jogadores reais no mesmo espaço recebem +1 moeda (exceto o dono da bicicleta se a decisão estiver pendente)
    if (canAffordAllFees && moveInfo.visitingFee > 0 && p.boardPosition === targetPos) {
      if (bicicletaOwner && p.id === bicicletaOwner.id) {
        return p; // A decisão da bicicleta definirá se ganha +1 moeda ou +1 tempo
      }
      return { ...p, coins: p.coins + 1 };
    }
    return p;
  });

  const locName = BOARD_LOCATIONS.find(l => l.index === targetPos)?.name || `Local ${targetPos}`;
  let feeMsg = '';
  if (moveInfo.visitingFee > 0) {
    if (canAffordAllFees) {
      const neutralNote = moveInfo.hasNeutralDieAtTarget ? ' (inclui 1 moeda ao banco pelo Dado Neutro)' : '';
      feeMsg = ` (pagou ${moveInfo.visitingFee} moeda(s) de taxa${neutralNote})`;
    } else {
      feeMsg = ` (moedas insuficientes para a taxa: não gastou moedas e perdeu 1 VP!)`;
    }
  }

  const isOutOfTime = player.timeMarker - moveInfo.timeCost < 1;
  const outOfTimeMsg = isOutOfTime ? ' [Tempo esgotado: peão retornou à Casa e aguarda a noite!]' : '';

  const hasCupons = player.resources.some(r => r.effectType === 'bonus_reverse_direction');
  const isForwardEffective = moveInfo.isForward || hasCupons;

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    pendingBicicletaDecision: pendingBicicletaDecision || state.pendingBicicletaDecision || null,
    turnActionState: {
      ...state.turnActionState,
      isForwardMovementInLojas: targetPos === 4 ? isForwardEffective : undefined,
    },
    log: [
      ...state.log,
      `${player.name} deslocou-se para ${locName} [-${moveInfo.timeCost} tempo${feeMsg}]${outOfTimeMsg}${hasCupons && !moveInfo.isForward ? ' [Cupons: bônus ativado mesmo no sentido inverso!]' : ''}.`,
    ],
  };

  return { state: newState, isForward: isForwardEffective };
}

// ─── AÇÕES DE CADA LOCAL ──────────────────────────────────────────────────────

/**
 * 1: RÁDIO — Divulgação e Entrevistas.
 * O jogador opta por:
 * - 'play_disc': Tocar um disco gravado (-1 nível) para ganhar +1 Renome (exige possuir disco gravado).
 * - 'publicity': Ganhar a Ficha de Divulgação (+30 público no próximo show).
 * - Bônus das setas (isForward): Faz as DUAS ações!
 */
export function performRadioAction(
  state: GameState,
  chosenDiscId?: string,
  chosenOption?: 'play_disc' | 'publicity'
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já realizou sua ação neste turno.' };
  }

  const targetPos = state.turnActionState.selectedLocation;
  if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) {
    return { newState: state, success: false, message: 'O movimento é obrigatório. Selecione a Rádio no mapa antes de agir.' };
  }
  if (targetPos !== 1) {
    return { newState: state, success: false, message: 'Selecione a Rádio primeiro.' };
  }

  const { state: movedState, isForward } = applyMovement(state, 1);
  const player = movedState.players[movedState.currentPlayerIndex];

  let willPlayDisc = false;
  let willGainPublicity = false;

  if (isForward) {
    willPlayDisc = player.discs.length > 0;
    willGainPublicity = true;
  } else {
    if (chosenOption === 'play_disc') {
      if (player.discs.length === 0) {
        return { newState: state, success: false, message: 'Você precisa de pelo menos 1 Disco de Vinil gravado para tocar na Rádio.' };
      }
      willPlayDisc = true;
    } else {
      willGainPublicity = true;
    }
  }

  let updatedDiscs = [...player.discs];
  let newRenown = player.renown;
  let logText = '';

  if (willPlayDisc && player.discs.length > 0) {
    const discToPlay = chosenDiscId
      ? player.discs.find(d => d.id === chosenDiscId) || player.discs[0]
      : player.discs[0];

    const newDiscLevel = discToPlay.level - 1;
    updatedDiscs = player.discs.filter(d => d.id !== discToPlay.id);
    if (newDiscLevel > 0) {
      updatedDiscs = [...updatedDiscs, { ...discToPlay, level: newDiscLevel }];
    }

    newRenown = Math.min(10, player.renown + 1);
    const discStatus = newDiscLevel > 0
      ? `disco Nv${discToPlay.level} passou a Nv${newDiscLevel}`
      : `disco Nv${discToPlay.level} foi totalmente executado (descartado)`;

    logText += `tocou música na Rádio (${discStatus}) e ganhou +1 Renome (${newRenown}/10)`;
  }

  if (willGainPublicity) {
    logText += (logText.length > 0 ? ' E ' : '') + 'ganhou a Ficha de Divulgação (+30 público no próximo show)';
  }

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...p,
      renown: newRenown,
      discs: updatedDiscs,
      hasPublicityToken: willGainPublicity ? true : p.hasPublicityToken,
    } : p
  );

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 1);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 1,
      hasActedThisTurn: true,
    },
    log: [
      ...movedState.log,
      `${player.name} ${logText} na Rádio${isForward ? ' [Bônus: ambas as ações ativadas!]' : ''}.`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `Ação na Rádio realizada com sucesso!` };
}

/**
 * 2: CONSERVATÓRIO — OPÇÃO A: Ganhar Habilidade.
 */
export function performConservatorioGainSkill(
  state: GameState,
  options?: {
    chosenConservatorioCubeIndex?: number;
    chosenWorkshopColor?: NoteColor;
    skillUpSpendInspiration?: boolean;
    skillUpChosenColor?: NoteColor;
    recycleConservatorioCubes?: boolean;
  } | number,
  legacyChosenMainBagColor?: NoteColor
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já realizou sua ação neste turno.' };
  }

  const targetPos = state.turnActionState.selectedLocation;
  if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) {
    return { newState: state, success: false, message: 'O movimento é obrigatório. Selecione o Conservatório no mapa antes de agir.' };
  }
  if (targetPos !== 3) {
    return { newState: state, success: false, message: 'Selecione o Conservatório primeiro.' };
  }

  const opts = typeof options === 'object' && options !== null ? options : {
    chosenConservatorioCubeIndex: typeof options === 'number' ? options : undefined,
    chosenWorkshopColor: legacyChosenMainBagColor,
    skillUpSpendInspiration: false,
    skillUpChosenColor: undefined,
    recycleConservatorioCubes: false,
  };

  const { state: movedState, isForward } = applyMovement(state, 3);
  const player = movedState.players[movedState.currentPlayerIndex];

  const oldSkill = SKILL_STEPS_VALUES[player.skillStepIndex ?? 0];
  const nextStepIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (player.skillStepIndex ?? 0) + 1);
  const newSkill = SKILL_STEPS_VALUES[nextStepIndex];
  const stepLabel = SKILL_STEPS_LABELS[nextStepIndex];
  const isNumericLevelUp = newSkill > oldSkill;

  let updatedConservatorioCubes = [...movedState.conservatorioCubes];
  let updatedMainBag = { ...movedState.mainBag };

  // ── 1. Ganho de Cubo por Aumento Numérico de Nível de Habilidade ──
  let pendingCubeChoice: import('../types/game').PendingCubeChoice | null = null;
  if (isNumericLevelUp) {
    pendingCubeChoice = {
      playerId: player.id,
      playerIndex: movedState.currentPlayerIndex,
      reason: 'skill_level_up',
      title: 'Aumento de Nível de Habilidade!',
      description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
      newSkillLevel: newSkill,
    };
  }

  // ── 2. Bônus do Conservatório (Setas / Workshop / Reciclar) ──
  let bonusCube: NoteColor | null = null;
  let bonusCustomText = '';

  const isWorkshop = movedState.currentEvent?.id === 'evento_05' ||
    movedState.currentEvent?.effectType === 'conservatorio_choose_any_cube' ||
    movedState.currentEvent?.effectType === 'conservatorio_choose_from_bag';

  if (isForward) {
    if (opts.recycleConservatorioCubes) {
      updatedConservatorioCubes.forEach(c => {
        if (c in updatedMainBag) updatedMainBag[c as keyof typeof updatedMainBag]++;
      });
      const newConsCubes: NoteColor[] = [];
      for (let k = 0; k < 2; k++) {
        const mainBagColors: NoteColor[] = [];
        Object.entries(updatedMainBag).forEach(([c, count]) => {
          if (c !== 'white') {
            for (let i = 0; i < count; i++) mainBagColors.push(c as NoteColor);
          }
        });
        const drawn = drawRandom(mainBagColors);
        if (drawn) {
          newConsCubes.push(drawn.item);
          if (drawn.item in updatedMainBag) updatedMainBag[drawn.item as keyof typeof updatedMainBag]--;
        }
      }
      updatedConservatorioCubes = newConsCubes;
      bonusCustomText = ' e optou por não pegar cubo, reciclando os 2 cubos do Conservatório';
    } else if (isWorkshop && opts.chosenWorkshopColor && (updatedMainBag[opts.chosenWorkshopColor as keyof typeof updatedMainBag] || 0) > 0) {
      bonusCube = opts.chosenWorkshopColor;
      updatedMainBag[opts.chosenWorkshopColor as keyof typeof updatedMainBag]--;
      bonusCustomText = ` e escolheu 1 cubo ${opts.chosenWorkshopColor} do Saco Principal (Evento Workshop)`;
    } else if (opts.chosenConservatorioCubeIndex !== undefined && updatedConservatorioCubes[opts.chosenConservatorioCubeIndex]) {
      bonusCube = updatedConservatorioCubes[opts.chosenConservatorioCubeIndex];

      const mainBagColors: NoteColor[] = [];
      Object.entries(updatedMainBag).forEach(([c, count]) => {
        if (c !== 'white') {
          for (let i = 0; i < count; i++) mainBagColors.push(c as NoteColor);
        }
      });
      const drawn = drawRandom(mainBagColors);
      if (drawn) {
        updatedConservatorioCubes[opts.chosenConservatorioCubeIndex] = drawn.item;
        if (drawn.item in updatedMainBag) {
          updatedMainBag[drawn.item as keyof typeof updatedMainBag]--;
        }
      }
      bonusCustomText = ` e escolheu 1 cubo ${bonusCube} do Conservatório`;
    }
  }

  const gainedCubes: NoteColor[] = [];
  if (bonusCube) gainedCubes.push(bonusCube);

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...p,
      skillStepIndex: nextStepIndex,
      skill: newSkill,
      bag: gainedCubes.length > 0 ? [...p.bag, ...gainedCubes] : p.bag,
    } : p
  );

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 3);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    conservatorioCubes: updatedConservatorioCubes,
    mainBag: updatedMainBag,
    pendingCubeChoice: pendingCubeChoice || movedState.pendingCubeChoice || null,
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 3,
      hasActedThisTurn: true,
    },
    log: [
      ...movedState.log,
      `${player.name} estudou no Conservatório: avançou para o passo ${stepLabel} (Habilidade ${newSkill})${bonusCustomText}.`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `Habilidade avançada para o passo ${stepLabel}!` };
}

/**
 * 2: CONSERVATÓRIO — OPÇÃO B: Compor Música.
 */
export function performConservatorioCompose(
  state: GameState,
  spendInspiration: boolean,
  chosenConservatorioCubeIndex?: number,
  chosenMainBagColor?: NoteColor,
  recycleConservatorioCubes?: boolean
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já realizou sua ação neste turno.' };
  }

  const targetPos = state.turnActionState.selectedLocation;
  if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) {
    return { newState: state, success: false, message: 'O movimento é obrigatório. Selecione o Conservatório no mapa antes de agir.' };
  }
  if (targetPos !== 3) {
    return { newState: state, success: false, message: 'Selecione o Conservatório primeiro.' };
  }

  if (spendInspiration && state.players[state.currentPlayerIndex].inspiration < 1) {
    return { newState: state, success: false, message: 'Fichas de Inspiração insuficientes.' };
  }

  const { state: movedState, isForward } = applyMovement(state, 3);
  const player = movedState.players[movedState.currentPlayerIndex];

  const hasCadernoComposicao = player.resources.some(r => r.id === 'recurso_03' || r.effectType === 'composition_bonus_level');
  const cadernoBonus = hasCadernoComposicao ? 1 : 0;
  const bonusLevel = spendInspiration && player.inspiration >= 1 ? 1 : 0;
  const compLevel = player.skill + cadernoBonus + bonusLevel;
  const newComp = { id: `comp_${Date.now()}`, level: compLevel, isRecorded: false };

  let cubeGained: NoteColor | null = null;
  let updatedConservatorioCubes = [...movedState.conservatorioCubes];
  let updatedMainBag = { ...movedState.mainBag };
  let bonusCustomText = '';

  const isWorkshop = movedState.currentEvent?.id === 'evento_05' ||
    movedState.currentEvent?.effectType === 'conservatorio_choose_any_cube' ||
    movedState.currentEvent?.effectType === 'conservatorio_choose_from_bag';

  if (isForward) {
    if (recycleConservatorioCubes) {
      updatedConservatorioCubes.forEach(c => {
        if (c in updatedMainBag) updatedMainBag[c as keyof typeof updatedMainBag]++;
      });
      const newConsCubes: NoteColor[] = [];
      for (let k = 0; k < 2; k++) {
        const mainBagColors: NoteColor[] = [];
        Object.entries(updatedMainBag).forEach(([c, count]) => {
          if (c !== 'white') {
            for (let i = 0; i < count; i++) mainBagColors.push(c as NoteColor);
          }
        });
        const drawn = drawRandom(mainBagColors);
        if (drawn) {
          newConsCubes.push(drawn.item);
          if (drawn.item in updatedMainBag) updatedMainBag[drawn.item as keyof typeof updatedMainBag]--;
        }
      }
      updatedConservatorioCubes = newConsCubes;
      bonusCustomText = ' e optou por não pegar cubo, reciclando os 2 cubos do Conservatório';
    } else if (isWorkshop && chosenMainBagColor && (updatedMainBag[chosenMainBagColor as keyof typeof updatedMainBag] || 0) > 0) {
      cubeGained = chosenMainBagColor;
      updatedMainBag[chosenMainBagColor as keyof typeof updatedMainBag]--;
      bonusCustomText = ` e pegou 1 cubo ${chosenMainBagColor} diretamente do Saco Principal (Evento Workshop)`;
    } else if (chosenConservatorioCubeIndex !== undefined && updatedConservatorioCubes[chosenConservatorioCubeIndex]) {
      cubeGained = updatedConservatorioCubes[chosenConservatorioCubeIndex];
      const mainBagColors: NoteColor[] = [];
      Object.entries(updatedMainBag).forEach(([c, count]) => {
        if (c !== 'white') {
          for (let i = 0; i < count; i++) mainBagColors.push(c as NoteColor);
        }
      });
      const drawn = drawRandom(mainBagColors);
      if (drawn) {
        updatedConservatorioCubes[chosenConservatorioCubeIndex] = drawn.item;
        if (drawn.item in updatedMainBag) {
          updatedMainBag[drawn.item as keyof typeof updatedMainBag]--;
        }
      }
      bonusCustomText = ` e pegou 1 cubo ${cubeGained} do Conservatório`;
    }
  }

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...p,
      inspiration: p.inspiration - (bonusLevel > 0 ? 1 : 0),
      compositions: [...p.compositions, newComp],
      bag: cubeGained ? [...p.bag, cubeGained] : p.bag,
    } : p
  );

  const inspText = bonusLevel > 0 ? ' [gastou 1 Inspiração para +1 nível!]' : '';
  const cadernoText = hasCadernoComposicao ? ' [Caderno de Composição: +1 nível]' : '';

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 3);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    conservatorioCubes: updatedConservatorioCubes,
    mainBag: updatedMainBag,
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 3,
      hasActedThisTurn: true,
    },
    log: [
      ...movedState.log,
      `${player.name} compôs uma Partitura Nível ${compLevel}${cadernoText}${inspText}${bonusCustomText}.`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `Partitura Nível ${compLevel} composta!${cadernoText}${inspText}` };
}

/**
 * 3: RUAS — Contratar Músico do mercado de 4 slots.
 * Custo: Moedas indicadas na carta.
 * Bônus das setas: +1 Inspiração!
 */
export function performRuasHireMusician(
  state: GameState,
  slotIndex: number,
  replacedMusicianId?: string
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já realizou sua ação neste turno.' };
  }

  const targetPos = state.turnActionState.selectedLocation;
  if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) {
    return { newState: state, success: false, message: 'O movimento é obrigatório. Selecione as Ruas no mapa antes de agir.' };
  }
  if (targetPos !== 5) {
    return { newState: state, success: false, message: 'Selecione as Ruas primeiro.' };
  }

  const musician = state.market.musicians[slotIndex];
  if (!musician) {
    return { newState: state, success: false, message: 'Slot vazio (músico já contratado nesta rodada).' };
  }

  const { state: movedState, isForward } = applyMovement(state, 5);
  const player = movedState.players[movedState.currentPlayerIndex];

  const actualCost = musician.cost;

  if (player.coins < actualCost) {
    return { newState: state, success: false, message: `Moedas insuficientes (custa ${actualCost} moedas).` };
  }

  const maxMusicians = (player.maxMusicians || 3) >= 4 || player.resources.some(r => r.id === 'recurso_09' || r.effectType === 'musician_hand_size_4') ? 4 : 3;
  const isBandFull = player.musicians.length >= maxMusicians;
  if (isBandFull && !replacedMusicianId) {
    return { newState: state, success: false, message: `Banda cheia (${player.musicians.length}/${maxMusicians}). Escolha qual músico substituir ou descarte o novo músico.` };
  }

  const updatedMarketMusicians = [...movedState.market.musicians];
  updatedMarketMusicians[slotIndex] = null;

  const newMusicianEntry = { ...musician, filledNotes: [] as (NoteColor | null)[] };
  
  let playerAfterInspiration = player;
  let bonusText = '';
  if (isForward) {
    const { updatedPlayer: pWithInsp, logMessage: inspLog } = applyInspirationGain(player, 1);
    playerAfterInspiration = pWithInsp;
    bonusText = ` [Bônus das Ruas: ${inspLog}]`;
  }

  let updatedMusicians = [...playerAfterInspiration.musicians];
  let replaceText = '';

  if (isBandFull && replacedMusicianId) {
    if (replacedMusicianId === 'discard_new') {
      replaceText = ' (e optou por descartar o músico recém-comprado)';
    } else {
      const replaced = playerAfterInspiration.musicians.find(m => m.id === replacedMusicianId);
      updatedMusicians = playerAfterInspiration.musicians.filter(m => m.id !== replacedMusicianId);
      updatedMusicians.push(newMusicianEntry);
      replaceText = replaced ? ` (substituindo ${replaced.name})` : '';
    }
  } else {
    updatedMusicians.push(newMusicianEntry);
  }

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...playerAfterInspiration,
      coins: playerAfterInspiration.coins - actualCost,
      musicians: updatedMusicians,
    } : p
  );

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 5);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    market: {
      ...movedState.market,
      musicians: updatedMarketMusicians,
    },
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 5,
      hasActedThisTurn: true,
    },
    log: [
      ...movedState.log,
      `${player.name} contratou ${musician.name} (Nível ${musician.level}) por ${actualCost} moedas nas Ruas${replaceText}${bonusText}.`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `${musician.name} contratado para a banda!${replaceText}${bonusText}` };
}

/**
 * 4: GRAVADORA — Gravar Disco de Vinil a partir de Composição.
 * Custo: 4 moedas (3 moedas com o bônus das setas - desconto de 1 moeda).
 */
export function performGravadoraRecordDisc(
  state: GameState,
  compositionId?: string
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já realizou sua ação neste turno.' };
  }

  const targetPos = state.turnActionState.selectedLocation;
  if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) {
    return { newState: state, success: false, message: 'O movimento é obrigatório. Selecione a Gravadora no mapa antes de agir.' };
  }
  if (targetPos !== 2) {
    return { newState: state, success: false, message: 'Selecione a Gravadora primeiro.' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.compositions.length === 0) {
    return { newState: state, success: false, message: 'Você não tem partituras para gravar. Vá ao Conservatório compor uma música primeiro.' };
  }

  const isInvertArrows = state.currentEvent?.effectType === 'invert_arrow_direction';
  const moveInfo = calculateMovement(currentPlayer, 2, state.players, isInvertArrows, state.neutralDie);
  const recordingCost = moveInfo.isForward ? 3 : 4;

  if (currentPlayer.coins < recordingCost + moveInfo.visitingFee) {
    return { newState: state, success: false, message: `Moedas insuficientes. Gravar o disco custa ${recordingCost} moedas${moveInfo.visitingFee > 0 ? ` + ${moveInfo.visitingFee} de taxa` : ''}.` };
  }

  const { state: movedState, isForward } = applyMovement(state, 2);
  const player = movedState.players[movedState.currentPlayerIndex];

  const compToRecord = compositionId
    ? player.compositions.find(c => c.id === compositionId) || player.compositions[0]
    : player.compositions[0];

  const updatedCompositions = player.compositions.filter(c => c.id !== compToRecord.id);
  const newDisc = { ...compToRecord, isRecorded: true };

  const instantVP = compToRecord.level >= 7 ? 3 : compToRecord.level >= 4 ? 2 : 1;

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...p,
      coins: p.coins - recordingCost,
      compositions: updatedCompositions,
      discs: [...p.discs, newDisc],
      score: p.score + instantVP,
      totalDiscsRecorded: (p.totalDiscsRecorded ?? 0) + 1,
    } : p
  );

  const discountMsg = isForward ? ' (com 1 moeda de desconto do bônus)' : '';

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 2);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 2,
      hasActedThisTurn: true,
    },
    log: [
      ...movedState.log,
      `${player.name} gravou a Partitura Nível ${compToRecord.level} em Disco de Vinil por ${recordingCost} moedas na Gravadora (+${instantVP} Pontos de Vitória)${discountMsg}.`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `Disco Nível ${compToRecord.level} gravado por ${recordingCost} moedas (+${instantVP} Pontos de Vitória)!` };
}

/**
 * 5: LOJAS — Comprar Recurso (múltiplas compras permitidas sem limite!).
 */
export function performLojasBuyResource(
  state: GameState,
  slotIndex: number
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já encerrou suas compras neste turno.' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isAlreadyAtLojas = currentPlayer.boardPosition === 4;
  const isSelectedLojas = state.turnActionState.selectedLocation === 4;

  if (!isAlreadyAtLojas && !isSelectedLojas) {
    return { newState: state, success: false, message: 'Selecione as Lojas no mapa primeiro.' };
  }

  const { state: movedState, isForward } = applyMovement(state, 4);
  const player = movedState.players[movedState.currentPlayerIndex];

  const resource = movedState.market.resources[slotIndex];
  if (!resource) {
    return { newState: state, success: false, message: 'Slot vazio (já comprado nesta rodada).' };
  }

  let baseCost = resource.cost;
  if (resource.specialCost && movedState.round >= resource.specialCost.fromRound) {
    baseCost = resource.specialCost.cost;
  }
  if (resource.playerCountCost) {
    const numPlayers = movedState.players.length as 2 | 3 | 4;
    baseCost = resource.playerCountCost[numPlayers] ?? resource.cost;
  }

  const isLastSlot = slotIndex === 3;
  const slotDiscount = isLastSlot ? 1 : 0;
  const hasSoldDisc = movedState.turnActionState.hasSoldDiscThisTurn || movedState.turnActionState.lojasBonusChoice === 'sell_disc';
  const bonusDiscount = (isForward && !hasSoldDisc) ? 1 : 0;
  const totalDiscount = slotDiscount + bonusDiscount;

  const finalCost = Math.max(0, baseCost - totalDiscount);

  if (player.coins < finalCost) {
    return { newState: state, success: false, message: `Moedas insuficientes (custa ${finalCost} moedas).` };
  }

  const updatedMarketResources = [...movedState.market.resources];
  updatedMarketResources[slotIndex] = null;

  let updatedPlayer = {
    ...player,
    coins: player.coins - finalCost,
    resources: [...player.resources, resource],
  };

  let pendingSkillCubeChoice: import('../types/game').PendingCubeChoice | null = null;
  let pendingLuthierChoice: import('../types/game').PendingLuthierChoice | null = null;

  switch (resource.effectType) {
    case 'gain_renown':
      updatedPlayer = { ...updatedPlayer, renown: Math.min(10, updatedPlayer.renown + (resource.effectValue ?? 1)) };
      break;
    case 'gain_skill': {
      const oldSkill = SKILL_STEPS_VALUES[player.skillStepIndex ?? 0];
      const nextSkillIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (player.skillStepIndex ?? 0) + 1);
      const newSkill = SKILL_STEPS_VALUES[nextSkillIndex];
      const isNumericSkillUp = newSkill > oldSkill;

      updatedPlayer = {
        ...updatedPlayer,
        skillStepIndex: nextSkillIndex,
        skill: newSkill,
      };

      if (isNumericSkillUp) {
        pendingSkillCubeChoice = {
          playerId: player.id,
          playerIndex: movedState.currentPlayerIndex,
          reason: 'skill_level_up',
          title: 'Livro Misterioso: Aumento de Habilidade!',
          description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
          newSkillLevel: newSkill,
        };
      }
      break;
    }
    case 'musician_hand_size_4':
      updatedPlayer = { ...updatedPlayer, maxMusicians: 4 };
      break;
    case 'die_starts_at_6':
      updatedPlayer = { ...updatedPlayer, hasRoadie: true };
      break;
    case 'choose_instrument_card': {
      const availableInstruments = [
        ...movedState.decks.resources.filter(r => r.cardType === 'instrument'),
        ...(movedState.decks.discardedResources || []).filter(r => r.cardType === 'instrument'),
      ];
      if (availableInstruments.length > 0) {
        pendingLuthierChoice = {
          playerId: player.id,
          playerIndex: movedState.currentPlayerIndex,
          availableInstruments,
        };
      }
      break;
    }
  }

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? updatedPlayer : p
  );

  const discountDetails = totalDiscount > 0 ? ` (desconto: -${totalDiscount} moedas${slotDiscount > 0 ? ' [Último Espaço]' : ''}${bonusDiscount > 0 ? ' [Bônus de Movimento]' : ''})` : '';

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 4);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    neutralDie: updatedNeutralDie,
    pendingCubeChoice: pendingSkillCubeChoice || movedState.pendingCubeChoice || null,
    pendingLuthierChoice: pendingLuthierChoice || movedState.pendingLuthierChoice || null,
    market: {
      ...movedState.market,
      resources: updatedMarketResources,
    },
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 4,
      isShoppingInLojas: true,
      lojasBonusChoice: hasSoldDisc ? 'sell_disc' : (isForward ? 'discount' : null),
      hasActedThisTurn: false,
    },
    log: [
      ...movedState.log,
      `${player.name} comprou ${resource.name} por ${finalCost} moedas nas Lojas${discountDetails}.`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `${resource.name} adquirido!` };
}

/**
 * Resolução da escolha de instrumento pelo Luthier (Recurso 15).
 */
export function resolvePendingLuthierChoice(
  state: GameState,
  chosenInstrumentId?: string
): { newState: GameState; success: boolean; message: string } {
  const pending = state.pendingLuthierChoice;
  if (!pending) {
    return { newState: state, success: false, message: 'Nenhuma escolha de Luthier pendente.' };
  }

  const player = state.players[pending.playerIndex];
  if (!player) {
    return { newState: state, success: false, message: 'Jogador não encontrado.' };
  }

  let updatedPlayer = { ...player };
  let updatedDecks = { ...state.decks };
  let logText = '';

  if (chosenInstrumentId) {
    const allInstruments = [
      ...state.decks.resources.filter(r => r.cardType === 'instrument'),
      ...(state.decks.discardedResources || []).filter(r => r.cardType === 'instrument'),
    ];
    const instrument = allInstruments.find(r => r.id === chosenInstrumentId);

    if (instrument && player.coins >= instrument.cost) {
      updatedPlayer.coins -= instrument.cost;
      updatedPlayer.resources = [...updatedPlayer.resources, instrument];

      // Remove de decks e descartes
      const newDeckRes = state.decks.resources.filter(r => r.id !== chosenInstrumentId);
      const newDiscRes = (state.decks.discardedResources || []).filter(r => r.id !== chosenInstrumentId);

      // Reembaralha o baralho de recursos
      updatedDecks.resources = shuffle(newDeckRes);
      updatedDecks.discardedResources = newDiscRes;

      logText = `${player.name} usou o Luthier e comprou ${instrument.name} pelo valor de face (${instrument.cost} moedas). Baralho de recursos reembaralhado!`;
    } else {
      logText = `${player.name} optou por não comprar nenhum instrumento com o Luthier.`;
    }
  } else {
    logText = `${player.name} optou por não comprar nenhum instrumento com o Luthier.`;
  }

  const updatedPlayers = state.players.map((p, i) => i === pending.playerIndex ? updatedPlayer : p);

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    decks: updatedDecks,
    pendingLuthierChoice: null,
    log: [...state.log, logText],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: logText };
}

/**
 * Resolução da decisão de taxa da Bicicleta (Recurso 14).
 */
export function resolveBicicletaDecision(
  state: GameState,
  waiveFee: boolean
): { newState: GameState; success: boolean; message: string } {
  const pending = state.pendingBicicletaDecision;
  if (!pending) {
    return { newState: state, success: false, message: 'Nenhuma decisão de Bicicleta pendente.' };
  }

  const owner = state.players[pending.ownerPlayerIndex];
  const visiting = state.players[pending.visitingPlayerIndex];
  if (!owner || !visiting) {
    return { newState: state, success: false, message: 'Jogadores não encontrados.' };
  }

  let updatedOwner = { ...owner };
  let updatedVisiting = { ...visiting };
  let logText = '';

  if (waiveFee && !owner.hasUsedBicicletaThisRound) {
    updatedOwner.timeMarker = Math.min(6, updatedOwner.timeMarker + 1);
    updatedOwner.hasUsedBicicletaThisRound = true;
    logText = `🚲 ${owner.name} usou a Bicicleta: recusou a moeda de ${visiting.name} e ganhou +1 Tempo! (${visiting.name} economizou 1 moeda).`;
  } else {
    // Pagamento normal da taxa de 1 moeda de visiting para owner
    updatedVisiting.coins = Math.max(0, updatedVisiting.coins - 1);
    updatedOwner.coins = updatedOwner.coins + 1;
    logText = `${owner.name} optou por receber 1 moeda de taxa de ${visiting.name}.`;
  }

  const updatedPlayers = state.players.map((p, i) => {
    if (i === pending.ownerPlayerIndex) return updatedOwner;
    if (i === pending.visitingPlayerIndex) return updatedVisiting;
    return p;
  });

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    pendingBicicletaDecision: null,
    log: [...state.log, logText],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: logText };
}

/**
 * 5: LOJAS — Vender Disco de Vinil (Opção alternativa ao desconto de 1 moeda no bônus de movimento).
 * Ganha moedas iguais ao nível do disco e reduz o nível do disco em 1 (descarta se for para nível 0).
 */
export function performLojasSellDisc(
  state: GameState,
  discId: string
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já encerrou suas ações nas Lojas neste turno.' };
  }
  if (state.turnActionState.hasSoldDiscThisTurn) {
    return { newState: state, success: false, message: 'Você já vendeu um disco neste turno.' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isAlreadyAtLojas = currentPlayer.boardPosition === 4;
  const isSelectedLojas = state.turnActionState.selectedLocation === 4;

  if (!isAlreadyAtLojas && !isSelectedLojas) {
    return { newState: state, success: false, message: 'Selecione as Lojas primeiro.' };
  }

  const { state: movedState, isForward } = state.turnActionState.isShoppingInLojas
    ? { state, isForward: state.turnActionState.isForwardMovementInLojas ?? false }
    : applyMovement(state, 4);

  const player = movedState.players[movedState.currentPlayerIndex];

  if (!isForward) {
    return { newState: state, success: false, message: 'Vender discos é uma opção exclusiva do bônus de movimento com as setas para as Lojas.' };
  }

  const disc = player.discs.find(d => d.id === discId);
  if (!disc) {
    return { newState: state, success: false, message: 'Disco não encontrado.' };
  }

  const coinsGained = disc.level;
  const newDiscLevel = disc.level - 1;
  const updatedDiscs = player.discs
    .map(d => d.id === discId ? (newDiscLevel > 0 ? { ...d, level: newDiscLevel } : null) : d)
    .filter((d): d is CompositionToken => d !== null);

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...p,
      coins: p.coins + coinsGained,
      discs: updatedDiscs,
    } : p
  );

  const discStatusText = newDiscLevel > 0
    ? `(o disco agora é Nível ${newDiscLevel})`
    : `(o nível chegou a 0, disco descartado)`;

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 4);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 4,
      isShoppingInLojas: true,
      isForwardMovementInLojas: true,
      hasSoldDiscThisTurn: true,
      lojasBonusChoice: 'sell_disc',
      hasActedThisTurn: false,
    },
    log: [
      ...movedState.log,
      `${player.name} vendeu um Disco Nível ${disc.level} nas Lojas por ${coinsGained} moedas ${discStatusText} [Bônus de Movimento das Lojas].`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return {
    newState: checkPlayerObjectives(newState),
    success: true,
    message: `Disco Nível ${disc.level} vendido por ${coinsGained} moedas! ${discStatusText}`,
  };
}

/**
 * 5: LOJAS — Define a escolha explícita do bônus de movimento ('discount' ou 'sell_disc').
 */
export function setLojasBonusChoice(
  state: GameState,
  choice: 'discount' | 'sell_disc'
): { newState: GameState; success: boolean; message: string } {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const isAlreadyAtLojas = currentPlayer.boardPosition === 4;
  const isSelectedLojas = state.turnActionState.selectedLocation === 4;

  if (!isAlreadyAtLojas && !isSelectedLojas) {
    return { newState: state, success: false, message: 'Selecione as Lojas primeiro.' };
  }

  const { state: movedState, isForward } = state.turnActionState.isShoppingInLojas
    ? { state, isForward: state.turnActionState.isForwardMovementInLojas ?? false }
    : applyMovement(state, 4);

  if (!isForward) {
    return { newState: state, success: false, message: 'Bônus indisponível para movimento contra as setas.' };
  }

  const newState: GameState = {
    ...movedState,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 4,
      isShoppingInLojas: true,
      isForwardMovementInLojas: true,
      lojasBonusChoice: choice,
      hasActedThisTurn: false,
    },
    log: [
      ...movedState.log,
      `${currentPlayer.name} escolheu ${choice === 'discount' ? 'Desconto de 1 Moeda' : 'Vender Disco'} como Bônus das Lojas.`,
    ],
  };

  return {
    newState,
    success: true,
    message: `Bônus selecionado: ${choice === 'discount' ? 'Desconto de 1 Moeda em compras' : 'Vender Disco'}.`,
  };
}

/**
 * 5: LOJAS — Efeito Imediato do Chapéu Estiloso (recurso_11):
 * Reserva 1 estilo virado para baixo OU substitui 1 estilo ativo se já possuir 2.
 */
export function performChapeuEstilosoChoose(
  state: GameState,
  chosenStyleId: string,
  replacedStyleId?: string
): { newState: GameState; success: boolean; message: string } {
  const player = state.players[state.currentPlayerIndex];
  const allStyles = [...state.decks.styles, ...state.market.styles];
  const chosenStyle = allStyles.find(s => s.id === chosenStyleId);

  if (!chosenStyle) {
    return { newState: state, success: false, message: 'Estilo não encontrado.' };
  }

  const remainingDeckStyles = state.decks.styles.filter(s => s.id !== chosenStyleId);
  const remainingMarketStyles = state.market.styles.filter(s => s.id !== chosenStyleId);

  let updatedStyles = [...player.styles];
  let updatedReservedStyle = player.reservedStyle;
  let logMessage = '';

  if (replacedStyleId) {
    const replaced = player.styles.find(s => s.id === replacedStyleId);
    updatedStyles = player.styles.map(s => s.id === replacedStyleId ? chosenStyle : s);
    if (replaced) remainingDeckStyles.push(replaced);
    logMessage = `${player.name} trocou o estilo ${replaced?.name} por ${chosenStyle.name} com o Chapéu Estiloso.`;
  } else {
    updatedReservedStyle = chosenStyle;
    logMessage = `${player.name} reservou o estilo ${chosenStyle.name} (virado para baixo) com o Chapéu Estiloso.`;
  }

  const updatedPlayers = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? {
      ...p,
      styles: updatedStyles,
      reservedStyle: updatedReservedStyle,
    } : p
  );

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    decks: {
      ...state.decks,
      styles: remainingDeckStyles,
    },
    market: {
      ...state.market,
      styles: remainingMarketStyles,
    },
    log: [...state.log, logMessage],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: logMessage };
}

/**
 * Reclamar Prêmio de Apresentação de um Clube ao atingir a meta de sucesso.
 */
export function claimClubReward(
  state: GameState,
  clubId: ClubId,
  rewardId: string,
  gainedStyleCardId?: string,
  targetPlayerId?: string,
  disabledRewardId?: string
): { newState: GameState; success: boolean; message: string } {
  const playerIndex = targetPlayerId
    ? state.players.findIndex(p => p.id === targetPlayerId)
    : state.currentPlayerIndex;
  const actualIndex = playerIndex !== -1 ? playerIndex : state.currentPlayerIndex;
  const player = state.players[actualIndex];
  const clubRewards = state.clubRewards[clubId] || [];
  const hasPremioCobicado = player.styles.some(s => s.effectType === 'claim_taken_reward' || s.id === 'estilo_11');

  let updatedClubRewards = [...clubRewards];
  const chosenReward = updatedClubRewards.find(r => r.id === rewardId);
  const isAlways1VP = rewardId === 'always_1_vp' || rewardId === 'fallback_vp';

  let updatedPlayer = { ...player };
  let logText = '';
  let updatedMainBag = { ...state.mainBag };
  let pendingRewardCubeChoice: import('../types/game').PendingCubeChoice | null = null;

  if (isAlways1VP) {
    updatedPlayer.score += 1;
    logText = `escolheu ganhar +1 Ponto de Vitória de prêmio`;
  } else if (chosenReward) {
    if (chosenReward.claimedByPlayerId && !hasPremioCobicado) {
      return { newState: state, success: false, message: 'Este prêmio já foi reclamado por outro jogador.' };
    }

    updatedClubRewards = updatedClubRewards.map(r =>
      r.id === rewardId ? { ...r, claimedByPlayerId: player.id, claimedRound: state.round } : r
    );

    // Se o jogador usou o Estilo 11 (Prêmio Cobiçado) para pegar um prêmio já reclamado e escolheu um prêmio livre para desabilitar:
    if (hasPremioCobicado && disabledRewardId && disabledRewardId !== rewardId) {
      updatedClubRewards = updatedClubRewards.map(r =>
        r.id === disabledRewardId && !r.claimedByPlayerId
          ? { ...r, claimedByPlayerId: player.id, claimedRound: state.round }
          : r
      );
    }

    const applyItem = (type: string, amount: number) => {
      if (type === 'coins') {
        updatedPlayer.coins += amount;
      } else if (type === 'renown') {
        updatedPlayer.renown = Math.min(10, updatedPlayer.renown + amount);
      } else if (type === 'inspiration') {
        const { updatedPlayer: pWithInsp } = applyInspirationGain(updatedPlayer, amount);
        updatedPlayer = pWithInsp;
      } else if (type === 'vp') {
        updatedPlayer.score += amount;
      } else if (type === 'skill') {
        const oldSkill = SKILL_STEPS_VALUES[updatedPlayer.skillStepIndex ?? 0];
        const nextSkillIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (updatedPlayer.skillStepIndex ?? 0) + amount);
        const newSkill = SKILL_STEPS_VALUES[nextSkillIndex];
        const isNumericSkillUp = newSkill > oldSkill;

        updatedPlayer.skillStepIndex = nextSkillIndex;
        updatedPlayer.skill = newSkill;

        if (isNumericSkillUp) {
          pendingRewardCubeChoice = {
            playerId: player.id,
            playerIndex: actualIndex,
            reason: 'skill_level_up',
            title: 'Prêmio do Clube: Aumento de Habilidade!',
            description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
            newSkillLevel: newSkill,
          };
        }
      }
    };

    if (chosenReward.type === 'compound' && chosenReward.items) {
      chosenReward.items.forEach(item => applyItem(item.type, item.amount));
      logText = `reclamou o prêmio [${chosenReward.label}]${disabledRewardId ? ' (e desabilitou 1 slot com Prêmio Cobiçado)' : ''}`;
    } else {
      applyItem(chosenReward.type, chosenReward.amount ?? 1);
      logText = `reclamou o prêmio [${chosenReward.label}]${disabledRewardId ? ' (e desabilitou 1 slot com Prêmio Cobiçado)' : ''}`;
    }

    if (chosenReward.type === 'style') {
      if (gainedStyleCardId) {
        const styleFromDeck = state.decks.styles.find(s => s.id === gainedStyleCardId) ||
          state.market.styles.find(s => s.id === gainedStyleCardId);
        if (styleFromDeck) {
          updatedPlayer.styles = [...updatedPlayer.styles.slice(0, 1), styleFromDeck];
          logText = `ganhou a carta de estilo ${styleFromDeck.name}`;
        }
      } else if (updatedPlayer.reservedStyle) {
        updatedPlayer.styles = [...updatedPlayer.styles.slice(0, 1), updatedPlayer.reservedStyle];
        updatedPlayer.reservedStyle = null;
        logText = `ativou seu Estilo Reservado!`;
      }
    }
  }

  const updatedPlayers = state.players.map((p, i) =>
    i === actualIndex ? updatedPlayer : p
  );

  const clubObj = CLUBS.find(c => c.id === clubId);
  const clubName = clubObj ? clubObj.name : clubId;

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    mainBag: updatedMainBag,
    pendingCubeChoice: pendingRewardCubeChoice || state.pendingCubeChoice || null,
    clubRewards: {
      ...state.clubRewards,
      [clubId]: updatedClubRewards,
    },
    log: [
      ...state.log,
      `${player.name} ${logText} no show do clube ${clubName}!`,
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `Prêmio resgatado!` };
}

export function performLojasBuyCube(
  state: GameState,
  chosenColor: NoteColor
): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já encerrou suas compras neste turno.' };
  }

  if (state.turnActionState.hasBoughtCubeThisTurn) {
    return { newState: state, success: false, message: 'Limite atingido: você só pode comprar 1 cubo por turno nas Lojas.' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isAlreadyAtLojas = currentPlayer.boardPosition === 4;
  const isSelectedLojas = state.turnActionState.selectedLocation === 4;

  if (!isAlreadyAtLojas && !isSelectedLojas) {
    return { newState: state, success: false, message: 'Selecione as Lojas primeiro.' };
  }

  const { state: movedState } = applyMovement(state, 4);
  const player = movedState.players[movedState.currentPlayerIndex];

  if (player.coins < 2) {
    return { newState: state, success: false, message: 'Moedas insuficientes (custa 2 moedas por cubo).' };
  }

  const availableCount = movedState.mainBag[chosenColor as keyof typeof movedState.mainBag] || 0;
  if (availableCount < 1) {
    return { newState: state, success: false, message: `Não há cubos ${chosenColor} disponíveis no saco principal.` };
  }

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...p,
      coins: p.coins - 2,
      bag: [...p.bag, chosenColor],
    } : p
  );

  const updatedMainBag = {
    ...movedState.mainBag,
    [chosenColor]: availableCount - 1,
  };

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 4);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    mainBag: updatedMainBag,
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 4,
      isShoppingInLojas: true,
      hasBoughtCubeThisTurn: true,
      hasActedThisTurn: false,
    },
    log: [
      ...movedState.log,
      `${player.name} comprou 1 cubo ${chosenColor} do Saco Principal por 2 moedas nas Lojas.`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: `1 cubo ${chosenColor} comprado e adicionado ao seu saco!` };
}

export function performLojasFinishShopping(state: GameState): GameState {
  const { state: movedState } = state.turnActionState.isShoppingInLojas
    ? { state }
    : applyMovement(state, 4);
  const player = movedState.players[movedState.currentPlayerIndex];
  const newState: GameState = {
    ...movedState,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 4,
      isShoppingInLojas: false,
      hasActedThisTurn: true,
    },
    log: [
      ...movedState.log,
      `${player.name} concluiu suas compras nas Lojas.`,
    ],
  };
  return checkPlayerObjectives(newState);
}

// ─── 6: PARQUE ──────────────────────────────────────────────────────────────

export function performParqueAction(state: GameState): { newState: GameState; success: boolean; message: string } {
  if (state.turnActionState.hasActedThisTurn) {
    return { newState: state, success: false, message: 'Você já realizou sua ação neste turno.' };
  }

  const targetPos = state.turnActionState.selectedLocation;
  if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) {
    return { newState: state, success: false, message: 'O movimento é obrigatório. Selecione o Parque no mapa antes de agir.' };
  }
  if (targetPos !== 6) {
    return { newState: state, success: false, message: 'Selecione o Parque primeiro.' };
  }

  const { state: movedState, isForward: _ } = applyMovement(state, 6);
  const player = movedState.players[movedState.currentPlayerIndex];

  const otherPlayersInPark = movedState.players.filter(
    (p, i) => i !== movedState.currentPlayerIndex && p.boardPosition === 6
  );
  const hasNeutralDieInPark = !!(movedState.neutralDie && movedState.neutralDie.position === 6);
  const isAloneInPark = otherPlayersInPark.length === 0 && !hasNeutralDieInPark;

  const baseCoins = player.renown;
  const bonusCoins = isAloneInPark ? 2 : 0;
  const totalCoinsGained = baseCoins + bonusCoins;

  const updatedPlayers = movedState.players.map((p, i) =>
    i === movedState.currentPlayerIndex ? {
      ...p,
      coins: p.coins + totalCoinsGained,
    } : p
  );

  const bonusText = isAloneInPark ? ' (+2 moedas de bônus por estar sozinho no Parque!)' : '';

  const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 6);

  const newState: GameState = {
    ...movedState,
    players: updatedPlayers,
    neutralDie: updatedNeutralDie,
    turnActionState: {
      ...movedState.turnActionState,
      selectedLocation: 6,
      hasActedThisTurn: true,
    },
    log: [
      ...movedState.log,
      `${player.name} tocou no Parque e arrecadou ${totalCoinsGained} moedas (${baseCoins} pelo Renome${bonusText}).`,
      ...(neutralDieLog ? [neutralDieLog] : []),
    ],
  };

  return {
    newState: checkPlayerObjectives(newState),
    success: true,
    message: `Apresentação no Parque: +${totalCoinsGained} moedas!${bonusText}`,
  };
}

// ─── IR PARA CLUBE DE JAZZ (ENCERRA O DIA) ──────────────────────────────────

export function goToClub(
  state: GameState,
  clubId: ClubId
): { newState: GameState; success: boolean; message: string } {
  const player = state.players[state.currentPlayerIndex];

  // Se já escolheu um clube para esta rodada, não pode escolher de novo
  if (player.chosenClub !== null) {
    return { newState: state, success: false, message: 'Você já escolheu seu clube para esta rodada.' };
  }

  // Durante a fase 'day', se já realizou uma ação no turno atual e ainda tem tempo restante, deve passar a vez primeiro
  if (state.phase === 'day' && state.turnActionState.hasActedThisTurn && !player.hasFinishedDay && player.timeMarker >= 1) {
    return { newState: state, success: false, message: 'Você já realizou uma ação neste turno. Passe a vez primeiro.' };
  }

  const club = CLUBS.find(c => c.id === clubId);
  if (!club) {
    return { newState: state, success: false, message: 'Clube inválido.' };
  }

  if (player.renown < club.minRenown) {
    return { newState: state, success: false, message: `Requer Renome ${club.minRenown}+ (seu renome é ${player.renown}).` };
  }

  // Regra de exclusividade de clubes:
  // 2 jogadores: Mosca/Graham Bell ilimitados, outros 1 vaga
  // 3+ jogadores: Mosca/Graham Bell ilimitados, outros 2 vagas
  if (!club.isUnlimited) {
    const maxCapacity = state.players.length === 2 ? 1 : 2;
    const currentOccupants = state.players.filter(p => p.id !== player.id && p.chosenClub === clubId).length;
    if (currentOccupants >= maxCapacity) {
      return {
        newState: state,
        success: false,
        message: `O clube ${club.name} já atingiu o limite de ${maxCapacity} jogador(es) nesta rodada.`
      };
    }
  }

  // Se o jogador escolhe ir para um clube no lugar de fazer uma ação (ainda tem tempo >= 1 na Fase de Dia), ganha 1 inspiração
  const isChoosingClubInsteadOfAction = state.phase === 'day' && player.timeMarker >= 1 && player.boardPosition !== 0;
  const bonusInspiration = isChoosingClubInsteadOfAction ? 1 : 0;

  const updatedPlayers = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? {
      ...p,
      hasFinishedDay: true,
      chosenClub: clubId,
      boardPosition: -1, // Marcador removido dos espaços da cidade e alocado no clube
      inspiration: Math.min(3, p.inspiration + bonusInspiration),
    } : p
  );

  const bonusMsg = bonusInspiration > 0 ? ' [sobrou tempo: ganhou +1 Inspiração!]' : '';

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    turnActionState: {
      ...state.turnActionState,
      hasActedThisTurn: true,
    },
    log: [
      ...state.log,
      `${player.name} foi para o clube ${club.name}!${bonusMsg}`,
    ],
  };

  const checkedState = checkPlayerObjectives(newState);
  return { newState: checkPhaseTransition(checkedState), success: true, message: `Você foi para ${club.name}!${bonusMsg}` };
}

// ─── APRESENTAÇÃO NA NOITE ────────────────────────────────────────────────────

export function drawFromBag(bag: NoteColor[], count: number): NoteColor[] {
  const tempBag = [...bag];
  const drawn: NoteColor[] = [];
  for (let i = 0; i < count && tempBag.length > 0; i++) {
    const result = drawRandom(tempBag);
    if (result) {
      drawn.push(result.item);
      tempBag.splice(tempBag.indexOf(result.item), 1);
    }
  }
  return drawn;
}

export interface NightGigOptions {
  pointsGained?: number;
  coinsGained?: number;
  audience?: number;
  success?: boolean;
  extraDrawInspirationUsed?: boolean;
  eliminatedCube?: NoteColor | null;
  chosenMainBagCube?: NoteColor | null;
}

export function performNightGig(
  state: GameState,
  musicianAssignments: Record<string, NoteColor[]>,
  options?: NightGigOptions
): { newState: GameState; pointsGained: number; coinsGained: number; audience: number; success: boolean } {
  const player = state.players[state.currentPlayerIndex];
  const club = CLUBS.find(c => c.id === player.chosenClub) || CLUBS[0];

  const hasWhiteAsWild = player.styles.some(s => s.effectType === 'white_as_wild');

  let totalPoints = 0;

  if (options?.pointsGained !== undefined) {
    totalPoints = options.pointsGained;
  } else {
    player.musicians.forEach(musician => {
      const assignedColors = musicianAssignments[musician.id];
      if (!assignedColors || assignedColors.length === 0) return;

      musician.notes.forEach((note, idx) => {
        const assignedColor = assignedColors[idx];
        if (!assignedColor) return;
        if (assignedColor === 'white' && !hasWhiteAsWild) return;

        const isCompatible = note.color === 'wild' || note.color === assignedColor || (hasWhiteAsWild && assignedColor === 'white');
        if (isCompatible) {
          totalPoints += note.points;
        }
      });
    });
  }

  const hasBonusCoinsStyle = player.styles.some(s => s.effectType === 'bonus_coins_presentation' || s.id === 'estilo_04');
  const bonusCoinsFromStyle = hasBonusCoinsStyle ? (state.round >= 5 ? 3 : 2) : 0;

  const hasReduceThresholdStyle = player.styles.some(s => s.effectType === 'reduce_success_threshold' || s.id === 'estilo_06');
  const effectiveSuccessThreshold = club ? Math.max(1, club.successThreshold - (hasReduceThresholdStyle ? 1 : 0)) : 0;

  const baseAudience = player.renown * 10 + (player.hasPublicityToken ? 30 : 0);
  const finalAudience = options?.audience !== undefined 
    ? options.audience 
    : Math.min(club.maxCapacity, Math.max(10, baseAudience));
  
  const baseCoinsGained = options?.coinsGained !== undefined 
    ? options.coinsGained 
    : Math.floor(finalAudience / 10);
  
  const coinsGained = baseCoinsGained + (options?.coinsGained !== undefined ? 0 : bonusCoinsFromStyle);
  
  const gigSuccess = options?.success !== undefined 
    ? options.success 
    : totalPoints >= effectiveSuccessThreshold;

  // Bag management: all drawn cubes return to bag EXCEPT if player eliminated one with inspiration
  const updatedBag = [...player.bag];
  let updatedMainBag = { ...state.mainBag };
  let inspirationSpent = 0;
  let mainBagStyleLog = '';

  // Estilo 09 (draw_from_main_bag): adiciona cubo escolhido do saco principal permanentemente
  if (options?.chosenMainBagCube && (updatedMainBag[options.chosenMainBagCube as keyof typeof updatedMainBag] || 0) > 0) {
    const chosenC = options.chosenMainBagCube;
    updatedMainBag[chosenC as keyof typeof updatedMainBag]--;
    updatedBag.push(chosenC);
    mainBagStyleLog = ` [Seleção do Saco Principal: pegou 1 cubo ${chosenC}]`;
  }

  if (options?.extraDrawInspirationUsed) {
    inspirationSpent += 1;
  }

  if (options?.eliminatedCube) {
    inspirationSpent += 1;
    const elimIdx = updatedBag.indexOf(options.eliminatedCube);
    if (elimIdx !== -1) {
      updatedBag.splice(elimIdx, 1);
    }
  }

  // Estilo Composição Bônus (estilo_07 / gain_composition_after_gig): ganha partitura Nível (Habilidade - 1)
  const hasGainCompAfterGig = player.styles.some(s => s.effectType === 'gain_composition_after_gig' || s.id === 'estilo_07');
  let updatedCompositions = [...player.compositions];
  let extraCompLog = '';

  if (hasGainCompAfterGig) {
    const extraCompLevel = Math.max(2, player.skill - 1);
    const extraCompToken = {
      id: `comp_gig_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      level: extraCompLevel,
      isRecorded: false,
    };
    updatedCompositions.push(extraCompToken);
    extraCompLog = ` [Composição Bônus: ganhou Partitura Nível ${extraCompLevel}]`;
  }

  // Reset musicians filledNotes for subsequent rounds
  const resetMusicians = player.musicians.map(m => ({
    ...m,
    filledNotes: [] as (NoteColor | null)[],
  }));

  const gigRecord = {
    round: state.round,
    clubId: club.id,
    points: totalPoints,
    coins: coinsGained,
    audience: finalAudience,
    success: gigSuccess,
  };

  const updatedPlayers = state.players.map((p, i) =>
    i === state.currentPlayerIndex ? {
      ...p,
      score: p.score + totalPoints,
      coins: p.coins + coinsGained,
      inspiration: Math.max(0, p.inspiration - inspirationSpent),
      musicians: resetMusicians,
      bag: updatedBag,
      compositions: updatedCompositions,
      hasPublicityToken: false,
      gigs: [...p.gigs, gigRecord],
    } : p
  );

  const nextNightIndex = state.nightPresentationPlayerIndex + 1;
  const playersWithShows = updatedPlayers.filter(p => p.chosenClub !== null);
  const allShowsCompleted = nextNightIndex >= playersWithShows.length;

  let newState: GameState = {
    ...state,
    players: updatedPlayers,
    mainBag: updatedMainBag,
    nightPresentationPlayerIndex: nextNightIndex,
    log: [
      ...state.log,
      `${player.name} tocou em ${club.name}: ${finalAudience} pessoas, +${totalPoints} pts, +${coinsGained} moedas${gigSuccess ? ' [Meta alcançada!]' : ''}${options?.eliminatedCube ? ` [Eliminou 1 cubo ${options.eliminatedCube}]` : ''}${extraCompLog}${mainBagStyleLog}${bonusCoinsFromStyle > 0 ? ` [Cachê Extra: +${bonusCoinsFromStyle} moedas]` : ''}${hasReduceThresholdStyle ? ` [Minimalismo: Meta ${effectiveSuccessThreshold} pts]` : ''}.`,
    ],
  };

  if (allShowsCompleted) {
    newState = startNewRound(newState);
  } else {
    const nextShowPlayer = playersWithShows[nextNightIndex];
    if (nextShowPlayer) {
      const nextShowPlayerIdx = newState.players.findIndex(p => p.id === nextShowPlayer.id);
      newState.currentPlayerIndex = nextShowPlayerIdx;
    }
  }

  newState = checkPlayerObjectives(newState);

  return {
    newState,
    pointsGained: totalPoints,
    coinsGained: coinsGained,
    audience: finalAudience,
    success: gigSuccess,
  };
}

// ─── GERENCIAMENTO DE TURNOS E FASES ──────────────────────────────────────────

function replenishMusiciansRiver(marketMusicians: (MusicianCard | null)[], musiciansDeck: MusicianCard[]): { newMusicians: (MusicianCard | null)[]; remainingDeck: MusicianCard[] } {
  const newMusicians = [...marketMusicians];
  let remainingDeck = [...musiciansDeck];

  for (let i = 0; i < 4; i++) {
    if (newMusicians[i] === null && remainingDeck.length > 0) {
      newMusicians[i] = remainingDeck[0];
      remainingDeck = remainingDeck.slice(1);
    }
  }

  return { newMusicians, remainingDeck };
}

function replenishResourceRiver(marketResources: (ResourceCard | null)[], resourceDeck: ResourceCard[]): { newRiver: (ResourceCard | null)[]; remainingDeck: ResourceCard[] } {
  const existingCards = marketResources.filter((c): c is ResourceCard => c !== null);
  let newDeck = [...resourceDeck];

  const newRiver: (ResourceCard | null)[] = [null, null, null, null];
  
  let writeIdx = 3;
  for (let i = existingCards.length - 1; i >= 0 && writeIdx >= 0; i--) {
    newRiver[writeIdx] = existingCards[i];
    writeIdx--;
  }

  for (let idx = 0; idx < 4; idx++) {
    if (newRiver[idx] === null && newDeck.length > 0) {
      newRiver[idx] = newDeck[0];
      newDeck = newDeck.slice(1);
    }
  }

  return { newRiver, remainingDeck: newDeck };
}

export function nextTurn(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  if (!state.turnActionState.hasActedThisTurn && !player.hasFinishedDay && player.timeMarker >= 1) {
    return state;
  }

  const updatedPlayers = state.players.map((p, i) => {
    if (i === state.currentPlayerIndex && p.timeMarker < 1) {
      return { ...p, boardPosition: 0, hasFinishedDay: true };
    }
    return p;
  });

  const { newRiver, remainingDeck: remainingResourcesDeck } = replenishResourceRiver(state.market.resources, state.decks.resources);
  const { newMusicians, remainingDeck: remainingMusiciansDeck } = replenishMusiciansRiver(state.market.musicians, state.decks.musicians);

  let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
  let loops = 0;
  while (updatedPlayers[nextIdx].hasFinishedDay && loops < state.players.length) {
    nextIdx = (nextIdx + 1) % state.players.length;
    loops++;
  }

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    currentPlayerIndex: nextIdx,
    market: {
      ...state.market,
      resources: newRiver,
      musicians: newMusicians,
    },
    decks: {
      ...state.decks,
      resources: remainingResourcesDeck,
      musicians: remainingMusiciansDeck,
    },
    turnActionState: { ...INITIAL_TURN_ACTION_STATE },
    log: [...state.log, `Vez de ${updatedPlayers[nextIdx].name}. Selecione um local no mapa para se mover antes de agir!`],
  };

  const checkedState = checkPlayerObjectives(newState);
  return checkPhaseTransition(checkedState);
}

function checkPhaseTransition(state: GameState): GameState {
  if (state.phase === 'day') {
    const allFinished = state.players.every(p => p.hasFinishedDay || p.timeMarker < 1);
    if (!allFinished) return state;

    const playersAtCasa = state.players.map(p =>
      p.chosenClub === null ? { ...p, boardPosition: 0, hasFinishedDay: true } : p
    );

    const playersNeedingClub = playersAtCasa.filter(p => p.chosenClub === null);

    if (playersNeedingClub.length > 0) {
      const firstNeedingIndex = playersAtCasa.findIndex(p => p.id === playersNeedingClub[0].id);
      return {
        ...state,
        phase: 'club_selection',
        players: playersAtCasa,
        currentPlayerIndex: firstNeedingIndex,
        turnActionState: { ...INITIAL_TURN_ACTION_STATE },
        log: [
          ...state.log,
          '─── Todos encerraram as ações na cidade! ───',
          `Fase de Escolha de Clubes: ${playersNeedingClub[0].name} escolhe em qual clube tocar esta noite.`,
        ],
      };
    }
  }

  if (state.phase === 'club_selection') {
    const playersNeedingClub = state.players.filter(p => p.chosenClub === null);
    if (playersNeedingClub.length > 0) {
      const nextNeedingIndex = state.players.findIndex(p => p.id === playersNeedingClub[0].id);
      return {
        ...state,
        currentPlayerIndex: nextNeedingIndex,
        log: [
          ...state.log,
          `Fase de Escolha de Clubes: vez de ${state.players[nextNeedingIndex].name} escolher um clube.`,
        ],
      };
    }
  }

  const playersWithClub = state.players.filter(p => p.chosenClub !== null);

  if (playersWithClub.length === 0) {
    return startNewRound({
      ...state,
      phase: 'night',
      log: [...state.log, '─── Fase da Noite: Nenhum show agendado nesta rodada. ───'],
    });
  }

  const firstShowPlayerIndex = state.players.findIndex(p => p.id === playersWithClub[0].id);

  return {
    ...state,
    phase: 'night',
    currentPlayerIndex: firstShowPlayerIndex,
    nightPresentationPlayerIndex: 0,
    turnActionState: { ...INITIAL_TURN_ACTION_STATE },
    log: [
      ...state.log,
      '─── FASE DA NOITE: Apresentações nos Clubes! ───',
      `Primeiro show: ${playersWithClub[0].name} no clube ${CLUBS.find(c => c.id === playersWithClub[0].chosenClub)?.name}.`,
    ],
  };
}

export function startNewRound(state: GameState): GameState {
  const prevRound = state.round;
  const newRound = state.round + 1;

  if (newRound > state.maxRounds) {
    return endGame(state);
  }

  const eventId = state.eventsByRound[newRound];
  const currentEvent = eventId ? ALL_EVENTS.find(e => e.id === eventId) ?? null : null;
  const isInvertArrowsEvent = currentEvent?.effectType === 'invert_arrow_direction';
  const startPosition = isInvertArrowsEvent ? 6 : 0;

  const inspirationGainLogs: string[] = [];

  const updatedPlayers = state.players.map(p => {
    const hasRoadie = p.hasRoadie || p.resources.some(r => r.id === 'recurso_04' || r.effectType === 'die_starts_at_6');
    const hasColecao = p.resources.some(r => r.id === 'recurso_02' || r.effectType === 'inspiration_each_round');
    const hasSalaEnsaio = p.maxMusicians >= 4 || p.resources.some(r => r.id === 'recurso_09' || r.effectType === 'musician_hand_size_4');
    
    let playerAfterInspiration = p;
    if (hasColecao) {
      const { updatedPlayer: pWithInsp, logMessage: inspLog } = applyInspirationGain(p, 1);
      playerAfterInspiration = pWithInsp;
      inspirationGainLogs.push(`Coleção de Discos: ${p.name} ganhou ${inspLog} no início da Rodada ${newRound}.`);
    }

    return {
      ...playerAfterInspiration,
      boardPosition: startPosition,
      timeMarker: hasRoadie ? 6 : 5,
      hasRoadie,
      maxMusicians: hasSalaEnsaio ? 4 : (p.maxMusicians || 3),
      hasFinishedDay: false,
      chosenClub: null,
      hasUsedBicicletaThisRound: false,
    };
  });

  const startPositionText = isInvertArrowsEvent
    ? 'Evento Vias Interditadas: Todos os jogadores iniciam no Parque (6) com as setas invertidas!'
    : 'Todos os jogadores retornam à Casa com seus dados reiniciados (5 tempos).';

  const startingPlayerIndex = (newRound - 1) % state.players.length;

  // ─── CLEANUP PHASE (FIM DA RODADA ANTERIOR) ──────────────────────────────────
  let updatedConservatorioCubes = [...state.conservatorioCubes];
  let updatedMainBag = { ...state.mainBag };
  let conservatorioCleanupText = '';

  // 1. Conservatório: se ambos os cubos forem da mesma cor, voltam ao saco e 2 novos são sorteados
  if (updatedConservatorioCubes.length === 2 && updatedConservatorioCubes[0] === updatedConservatorioCubes[1]) {
    updatedConservatorioCubes.forEach(c => {
      if (c in updatedMainBag) updatedMainBag[c as keyof typeof updatedMainBag]++;
    });
    const newConsCubes: NoteColor[] = [];
    for (let k = 0; k < 2; k++) {
      const mainBagColors: NoteColor[] = [];
      Object.entries(updatedMainBag).forEach(([c, count]) => {
        if (c !== 'white') {
          for (let i = 0; i < count; i++) mainBagColors.push(c as NoteColor);
        }
      });
      const drawn = drawRandom(mainBagColors);
      if (drawn) {
        newConsCubes.push(drawn.item);
        if (drawn.item in updatedMainBag) updatedMainBag[drawn.item as keyof typeof updatedMainBag]--;
      }
    }
    updatedConservatorioCubes = newConsCubes;
    conservatorioCleanupText = 'Limpeza: Os 2 cubos iguais do Conservatório foram devolvidos ao saco e 2 novos foram repostos.';
  }

  // 2. Músicos (River): descarta os 2 mais à direita (índices 2 e 3), desliza os restantes para a esquerda e compra 2 novos
  let discardedMusicians = [...(state.decks.discardedMusicians || [])];
  let currentDeckMusicians = [...state.decks.musicians];

  const remainingMarketMusicians: (MusicianCard | null)[] = [];
  if (state.market.musicians[0]) remainingMarketMusicians.push(state.market.musicians[0]);
  if (state.market.musicians[1]) remainingMarketMusicians.push(state.market.musicians[1]);
  if (state.market.musicians[2]) discardedMusicians.push(state.market.musicians[2]!);
  if (state.market.musicians[3]) discardedMusicians.push(state.market.musicians[3]!);

  const newMarketMusicians: (MusicianCard | null)[] = [...remainingMarketMusicians];
  while (newMarketMusicians.length < 4 && currentDeckMusicians.length > 0) {
    newMarketMusicians.push(currentDeckMusicians[0]);
    currentDeckMusicians = currentDeckMusicians.slice(1);
  }
  while (newMarketMusicians.length < 4) {
    newMarketMusicians.push(null);
  }

  // Descarte de Músicos de Nível 1 no Fim da Rodada 2 / Nível 2 no Fim da Rodada 4
  let musiciansPurgeText = '';
  if (prevRound === 2) {
    const purged = currentDeckMusicians.filter(m => m.level === 1);
    currentDeckMusicians = currentDeckMusicians.filter(m => m.level !== 1);
    discardedMusicians.push(...purged);
    if (purged.length > 0) {
      musiciansPurgeText = `Limpeza Rodada 2: ${purged.length} músicos de Nível 1 foram descartados do baralho.`;
    }
  } else if (prevRound === 4) {
    const purged = currentDeckMusicians.filter(m => m.level === 2);
    currentDeckMusicians = currentDeckMusicians.filter(m => m.level !== 2);
    discardedMusicians.push(...purged);
    if (purged.length > 0) {
      musiciansPurgeText = `Limpeza Rodada 4: ${purged.length} músicos de Nível 2 foram descartados do baralho.`;
    }
  }

  // 3. Lojas (Recursos): todos os 4 recursos são descartados e 4 novos são comprados (reembaralhando o descarte se o baralho esgotar)
  let discardedResources = [...(state.decks.discardedResources || [])];
  let currentDeckResources = [...state.decks.resources];

  state.market.resources.forEach(r => {
    if (r) discardedResources.push(r);
  });

  const newMarketResources: (ResourceCard | null)[] = [];
  for (let i = 0; i < 4; i++) {
    if (currentDeckResources.length === 0 && discardedResources.length > 0) {
      currentDeckResources = shuffle([...discardedResources]);
      discardedResources = [];
    }
    if (currentDeckResources.length > 0) {
      newMarketResources.push(currentDeckResources[0]);
      currentDeckResources = currentDeckResources.slice(1);
    } else {
      newMarketResources.push(null);
    }
  }

  return {
    ...state,
    round: newRound,
    phase: 'day',
    currentPlayerIndex: startingPlayerIndex,
    players: updatedPlayers,
    market: {
      ...state.market,
      musicians: newMarketMusicians,
      resources: newMarketResources,
    },
    decks: {
      ...state.decks,
      musicians: currentDeckMusicians,
      discardedMusicians,
      resources: currentDeckResources,
      discardedResources,
    },
    conservatorioCubes: updatedConservatorioCubes,
    mainBag: updatedMainBag,
    currentEvent,
    turnActionState: { ...INITIAL_TURN_ACTION_STATE },
    nightPresentationPlayerIndex: 0,
    log: [
      ...state.log,
      `─── Fim da Rodada ${prevRound} • Limpeza do Tabuleiro ───`,
      ...(conservatorioCleanupText ? [conservatorioCleanupText] : []),
      'Mercado de Músicos: 2 cartas descartadas à direita, cartas deslizadas e 2 novas repostas.',
      ...(musiciansPurgeText ? [musiciansPurgeText] : []),
      'Lojas: Todos os 4 recursos foram descartados e 4 novos recursos foram repostos.',
      `─── Rodada ${newRound}: Fase de Dia ───`,
      startPositionText,
      ...inspirationGainLogs,
      `Primeiro jogador da Rodada ${newRound}: ${updatedPlayers[startingPlayerIndex].name}.`,
      ...(currentEvent ? [`Evento da Rodada: ${currentEvent.name} — ${currentEvent.description}`] : []),
      `Vez de ${updatedPlayers[startingPlayerIndex].name}. Selecione um local no mapa para se mover antes de agir!`,
    ],
  };
}

export interface FinalScoreBreakdown {
  playerId: string;
  playerName: string;
  playerColor: string;
  gameScore: number;
  resourcesVP: number;
  instrumentBonusVP: number;
  discsVP: number;
  totalDiscs: number;
  discRankText: string;
  renownVP: number;
  renown: number;
  coinsVP: number;
  coins: number;
  inspirationVP: number;
  inspiration: number;
  totalScore: number;
  rank: number;
  details: {
    resourcesList: { name: string; vp: number; description?: string }[];
    instrumentsList: { name: string; vp: number; description?: string }[];
  };
}

export function calculateDiscRanking(players: PlayerState[]): Record<string, { points: number; rankText: string }> {
  const DISC_POS_POINTS = [5, 3, 1, 0, 0];
  const list = players.map(p => ({
    id: p.id,
    discs: p.totalDiscsRecorded ?? p.discs.length,
  }));

  list.sort((a, b) => b.discs - a.discs);

  const result: Record<string, { points: number; rankText: string }> = {};
  let i = 0;
  while (i < list.length) {
    const currentDiscs = list[i].discs;
    let j = i;
    while (j < list.length && list[j].discs === currentDiscs) {
      j++;
    }
    const tieCount = j - i;
    let sumPts = 0;
    for (let k = i; k < j; k++) {
      sumPts += DISC_POS_POINTS[k] ?? 0;
    }
    const ptsEach = Math.floor(sumPts / tieCount);
    const startRank = i + 1;
    const endRank = j;
    const rankLabel = tieCount > 1 ? `${startRank}º-${endRank}º lugar (${tieCount} empatados)` : `${startRank}º lugar`;

    for (let k = i; k < j; k++) {
      result[list[k].id] = {
        points: ptsEach,
        rankText: `${rankLabel} (${currentDiscs} discos gravados) ➔ +${ptsEach} VP`,
      };
    }
    i = j;
  }
  return result;
}

export function calculateFinalScores(state: GameState): FinalScoreBreakdown[] {
  const discRankings = calculateDiscRanking(state.players);

  const breakdowns: FinalScoreBreakdown[] = state.players.map(player => {
    let resourcesVP = 0;
    let instrumentBonusVP = 0;
    const resourcesList: { name: string; vp: number; description?: string }[] = [];
    const instrumentsList: { name: string; vp: number; description?: string }[] = [];

    player.resources.forEach(resource => {
      const isInstrument = resource.cardType === 'instrument';

      if (resource.victoryPoints > 0) {
        resourcesVP += resource.victoryPoints;
        if (isInstrument) {
          instrumentsList.push({
            name: resource.name,
            vp: resource.victoryPoints,
            description: `+${resource.victoryPoints} VP impresso no instrumento`,
          });
        } else {
          resourcesList.push({
            name: resource.name,
            vp: resource.victoryPoints,
            description: `+${resource.victoryPoints} VP impresso no recurso`,
          });
        }
      }

      if (resource.timing === 'end_game') {
        let cardBonus = 0;
        let bonusDesc = '';

        switch (resource.effectType) {
          case 'victory_points_only':
            break;
          case 'points_per_gig_achievement': {
            let claimedClubRewardsCount = 0;
            Object.values(state.clubRewards).forEach(rewardsArray => {
              rewardsArray.forEach(r => {
                if (r.claimedByPlayerId === player.id) {
                  claimedClubRewardsCount++;
                }
              });
            });
            cardBonus = claimedClubRewardsCount;
            bonusDesc = `${claimedClubRewardsCount} prêmio(s) de apresentação de clube conquistado(s) ➔ +${cardBonus} VP`;
            break;
          }
          case 'points_per_musician_level': {
            let pts = 0;
            player.musicians.forEach(m => {
              pts += (m.level || 1);
            });
            cardBonus = pts;
            bonusDesc = `Níveis dos músicos (${player.musicians.map(m => `Nv${m.level}`).join(', ')}) ➔ +${pts} VP`;
            break;
          }
          case 'points_equal_skill_level':
            cardBonus = player.skill;
            bonusDesc = `Habilidade Nível ${player.skill} ➔ +${player.skill} VP`;
            break;
          case 'points_based_on_white_cubes': {
            const whiteCount = player.bag.filter(c => c === 'white').length;
            if (whiteCount === 0) cardBonus = 6;
            else if (whiteCount === 1) cardBonus = 4;
            else if (whiteCount === 2) cardBonus = 2;
            else cardBonus = 0;
            bonusDesc = `${whiteCount} cubo(s) branco(s) no saco (${whiteCount === 0 ? '0=6pts' : whiteCount === 1 ? '1=4pts' : whiteCount === 2 ? '2=2pts' : '3=0pts'}) ➔ +${cardBonus} VP`;
            break;
          }
          case 'points_per_resource':
            cardBonus = player.resources.length * (resource.effectValue ?? 1);
            bonusDesc = `${player.resources.length} carta(s) de recurso no total ➔ +${cardBonus} VP`;
            break;
          case 'points_per_chosen_color_cube': {
            const colorCounts: Record<string, number> = {};
            player.bag.forEach(c => { if (c !== 'white') colorCounts[c] = (colorCounts[c] || 0) + 1; });
            const maxCount = Object.keys(colorCounts).length > 0 ? Math.max(...Object.values(colorCounts)) : 0;
            cardBonus = maxCount * (resource.effectValue ?? 1);
            const topColors = Object.entries(colorCounts).filter(([, count]) => count === maxCount).map(([col]) => col);
            bonusDesc = maxCount > 0
              ? `Maior grupo não-branco (${maxCount} cubos [${topColors.join('/')}]) ➔ +${cardBonus} VP`
              : 'Nenhum cubo não-branco no saco ➔ 0 VP';
            break;
          }
          case 'points_per_disc': {
            const totalD = (player.totalDiscsRecorded ?? player.discs.length);
            cardBonus = totalD * (resource.effectValue ?? 2);
            bonusDesc = `${totalD} disco(s) gravado(s) ➔ +${cardBonus} VP`;
            break;
          }
        }

        if (cardBonus > 0) {
          instrumentBonusVP += cardBonus;
          instrumentsList.push({
            name: resource.name,
            vp: cardBonus,
            description: bonusDesc,
          });
        }
      }
    });

    const discInfo = discRankings[player.id] || { points: 0, rankText: '0 discos ➔ 0 VP' };
    const discsVP = discInfo.points;
    const totalDiscs = (player.totalDiscsRecorded ?? player.discs.length);
    const renownVP = Math.floor(player.renown / 2);
    const coinsVP = Math.floor(player.coins / 5);
    const inspirationVP = player.inspiration;
    const gameScore = player.score;

    const totalScore = gameScore + resourcesVP + instrumentBonusVP + discsVP + renownVP + coinsVP + inspirationVP;

    return {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      gameScore,
      resourcesVP,
      instrumentBonusVP,
      discsVP,
      totalDiscs,
      discRankText: discInfo.rankText,
      renownVP,
      renown: player.renown,
      coinsVP,
      coins: player.coins,
      inspirationVP,
      inspiration: player.inspiration,
      totalScore,
      rank: 1,
      details: {
        resourcesList,
        instrumentsList,
      },
    };
  });

  breakdowns.sort((a, b) => b.totalScore - a.totalScore || b.coins - a.coins);

  breakdowns.forEach((b, idx) => {
    b.rank = idx + 1;
  });

  return breakdowns;
}

export function endGame(state: GameState): GameState {
  const scores = calculateFinalScores(state);
  const updatedPlayers = state.players.map(p => {
    const sc = scores.find(s => s.playerId === p.id);
    return {
      ...p,
      score: sc ? sc.totalScore : p.score,
    };
  });

  const winner = scores[0];

  return {
    ...state,
    phase: 'end',
    players: updatedPlayers,
    isGameOver: true,
    winner: winner?.playerId || state.players[0].id,
    log: [
      ...state.log,
      '─── FIM DE JOGO: PONTUAÇÃO FINAL ───',
      ...scores.map(s => `${s.rank}º: ${s.playerName} - ${s.totalScore} pts (Partida: ${s.gameScore}, Recursos/Inst: ${s.resourcesVP + s.instrumentBonusVP}, Discos: ${s.discsVP}, Renome: ${s.renownVP}, Moedas: ${s.coinsVP}, Insp: ${s.inspirationVP})`),
      `🏆 Vencedor: ${winner?.playerName}!`,
    ],
  };
}

export function applySponsorshipChoice(
  state: GameState,
  playerIndex: number,
  choice: 'coins' | 'renown' | 'skill'
): GameState {
  const player = state.players[playerIndex];
  if (!player) return state;

  let updatedPlayer = { ...player };
  let logText = '';
  let updatedMainBag = { ...state.mainBag };
  let pendingSponsorshipCubeChoice: import('../types/game').PendingCubeChoice | null = null;

  if (choice === 'coins') {
    updatedPlayer.coins += 5;
    logText = `${player.name} escolheu Ganhar 5 Moedas no Evento Patrocínio!`;
  } else if (choice === 'renown') {
    updatedPlayer.renown = Math.min(10, player.renown + 1);
    logText = `${player.name} escolheu Ganhar +1 Renome (${updatedPlayer.renown}/10) no Evento Patrocínio!`;
  } else if (choice === 'skill') {
    const oldSkill = SKILL_STEPS_VALUES[player.skillStepIndex ?? 0];
    const nextStepIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (player.skillStepIndex ?? 0) + 1);
    const newSkill = SKILL_STEPS_VALUES[nextStepIndex];
    const isNumericLevelUp = newSkill > oldSkill;

    if (isNumericLevelUp) {
      pendingSponsorshipCubeChoice = {
        playerId: player.id,
        playerIndex: playerIndex,
        reason: 'skill_level_up',
        title: 'Patrocínio: Aumento de Habilidade!',
        description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
        newSkillLevel: newSkill,
      };
    }

    updatedPlayer = {
      ...updatedPlayer,
      skillStepIndex: nextStepIndex,
      skill: newSkill,
    };
    logText = `${player.name} escolheu Ganhar 1 Habilidade (Passo ${SKILL_STEPS_LABELS[nextStepIndex]}, Nível ${newSkill}) no Evento Patrocínio!`;
  }

  const updatedPlayers = state.players.map((p, i) => i === playerIndex ? updatedPlayer : p);

  return {
    ...state,
    players: updatedPlayers,
    mainBag: updatedMainBag,
    pendingCubeChoice: pendingSponsorshipCubeChoice || state.pendingCubeChoice || null,
    log: [...state.log, logText],
  };
}

/**
 * Resolve a escolha de cubo do Saco Principal do jogador (CubeSelectionModal).
 */
export function resolvePendingCubeChoice(
  state: GameState,
  choice: { chosenColor?: NoteColor; spendInspiration?: boolean }
): { newState: GameState; success: boolean; message: string } {
  const pending = state.pendingCubeChoice;
  if (!pending) {
    return { newState: state, success: false, message: 'Nenhuma escolha de cubo pendente.' };
  }

  const player = state.players[pending.playerIndex] || state.players[state.currentPlayerIndex];
  const hasTocaDiscos = player.resources.some(r => r.id === 'recurso_07' || r.effectType === 'choose_cube_on_skill_up');
  let updatedPlayer = { ...player };
  let updatedMainBag = { ...state.mainBag };
  let logText = '';

  if (hasTocaDiscos && choice.chosenColor && (updatedMainBag[choice.chosenColor as keyof typeof updatedMainBag] || 0) > 0) {
    const c = choice.chosenColor;
    updatedMainBag[c as keyof typeof updatedMainBag]--;
    updatedPlayer.bag = [...updatedPlayer.bag, c];
    logText = `${player.name} usou o Toca-Discos e escolheu 1 cubo ${c} do Saco Principal!`;
  } else if (choice.spendInspiration && choice.chosenColor && player.inspiration >= 1 && (updatedMainBag[choice.chosenColor as keyof typeof updatedMainBag] || 0) > 0) {
    const c = choice.chosenColor;
    updatedMainBag[c as keyof typeof updatedMainBag]--;
    updatedPlayer.inspiration = Math.max(0, updatedPlayer.inspiration - 1);
    updatedPlayer.bag = [...updatedPlayer.bag, c];
    logText = `${player.name} gastou 1 Inspiração e escolheu 1 cubo ${c} do Saco Principal!`;
  } else {
    // Sorteio aleatório do saco principal
    const mainBagColors: NoteColor[] = [];
    Object.entries(updatedMainBag).forEach(([c, count]) => {
      if (c !== 'white') {
        for (let i = 0; i < count; i++) mainBagColors.push(c as NoteColor);
      }
    });
    const drawn = drawRandom(mainBagColors);
    if (drawn) {
      if (drawn.item in updatedMainBag) {
        updatedMainBag[drawn.item as keyof typeof updatedMainBag]--;
      }
      updatedPlayer.bag = [...updatedPlayer.bag, drawn.item];
      logText = `${player.name} sorteou 1 cubo ${drawn.item} do Saco Principal!`;
    }
  }

  const updatedPlayers = state.players.map((p, i) =>
    i === pending.playerIndex ? updatedPlayer : p
  );

  const newState: GameState = {
    ...state,
    players: updatedPlayers,
    mainBag: updatedMainBag,
    pendingCubeChoice: null,
    log: [
      ...state.log,
      logText,
    ],
  };

  return { newState: checkPlayerObjectives(newState), success: true, message: logText };
}

/**
 * ─── SISTEMA DE OBJETIVOS E CARTAS DE ESTILO ──────────────────────────────────
 * Verifica os objetivos de todos os jogadores (ou do jogador atual).
 * Recompensas oficiais:
 * - Metas da carta:
 *   - 1ª meta (slot 0): +2 Pontos de Vitória
 *   - 2ª meta (slot 1): +3 Pontos de Vitória
 *   - 3ª meta (slot 2): +5 Pontos de Vitória
 * - Cartas de Estilo (ordem de cumprimento):
 *   - Ao cumprir o 1º objetivo (em qualquer ordem): Ganha 1 carta de Estilo (escolhe 1 de 3)
 *   - Ao cumprir o 2º objetivo (em qualquer ordem): Não ganha estilo
 *   - Ao cumprir o 3º objetivo (em qualquer ordem): Ganha 1 carta de Estilo (escolhe 1 de 3)
 */
export function checkPlayerObjectives(state: GameState): GameState {
  let updatedPlayers = [...state.players];
  let updatedDecks = { ...state.decks };
  let logEntries: string[] = [];
  const existingQueue: PendingStyleChoice[] = state.pendingStyleChoicesQueue
    ? [...state.pendingStyleChoicesQueue]
    : (state.pendingStyleChoice ? [state.pendingStyleChoice] : []);

  updatedPlayers = updatedPlayers.map((player, pIdx) => {
    if (!player.objective) return player;

    const completedGoals = player.objective.completedGoals ? [...player.objective.completedGoals] : [false, false, false];
    while (completedGoals.length < 3) completedGoals.push(false);

    let completedCount = completedGoals.filter(Boolean).length;
    let newScore = player.score;
    let modified = false;

    player.objective.goals.forEach((goal, gIdx) => {
      if (completedGoals[gIdx]) return; // Já cumprido

      let isCompleted = false;

      switch (goal.type) {
        case 'musicians':
        case 'band_size':
          isCompleted = player.musicians.length >= goal.value;
          break;
        case 'score':
        case 'points':
          isCompleted = player.score >= goal.value;
          break;
        case 'renown':
          isCompleted = player.renown >= goal.value;
          break;
        case 'coins':
          isCompleted = player.coins >= goal.value;
          break;
        case 'resources':
          isCompleted = player.resources.length >= goal.value;
          break;
        case 'discs':
          isCompleted = (player.totalDiscsRecorded ?? player.discs.length) >= goal.value || player.discs.length >= goal.value;
          break;
        case 'cubes_same_color': {
          const colorCounts: Record<string, number> = {};
          player.bag.forEach(c => {
            if (c !== 'white') colorCounts[c] = (colorCounts[c] || 0) + 1;
          });
          isCompleted = Object.values(colorCounts).some(cnt => cnt >= goal.value);
          break;
        }
        case 'skill':
          isCompleted = player.skill >= goal.value;
          break;
        case 'eliminated_white_cubes': {
          const whiteRemaining = player.bag.filter(c => c === 'white').length;
          const eliminatedWhite = Math.max(0, 3 - whiteRemaining);
          isCompleted = eliminatedWhite >= goal.value;
          break;
        }
        case 'gigs':
          isCompleted = player.gigs.length >= goal.value;
          break;
        case 'musicians_level2plus':
          isCompleted = player.musicians.filter(m => m.level >= 2).length >= goal.value;
          break;
        case 'all_levels':
          isCompleted = player.musicians.some(m => m.level === 1) &&
                        player.musicians.some(m => m.level === 2) &&
                        player.musicians.some(m => m.level === 3);
          break;
        case 'colored_cubes':
          isCompleted = player.bag.filter(c => c !== 'white').length >= goal.value;
          break;
        case 'gig_achievements':
          isCompleted = player.gigs.filter(g => g.success).length >= goal.value;
          break;
        case 'disc_level':
          isCompleted = player.discs.some(d => d.level >= goal.value);
          break;
        case 'styles':
          isCompleted = player.styles.length >= goal.value;
          break;
      }

      if (isCompleted) {
        completedGoals[gIdx] = true;
        completedCount++;
        modified = true;

        // Pontos de Vitória da meta específica:
        const rewardVP = gIdx === 0 ? 2 : gIdx === 1 ? 3 : 5;
        newScore += rewardVP;

        // Cartas de Estilo concedidas no 1º e 3º objetivo cumpridos no total
        const triggersStyle = (completedCount === 1 || completedCount === 3);

        if (triggersStyle) {
          let styleDeck = [...updatedDecks.styles];
          const drawn = styleDeck.slice(0, 3);
          styleDeck = styleDeck.slice(3);
          updatedDecks = { ...updatedDecks, styles: styleDeck };

          const newChoice: PendingStyleChoice = {
            playerId: player.id,
            playerIndex: pIdx,
            goalIndex: gIdx,
            objectiveName: player.objective?.name || 'Objetivo',
            rewardVP,
            drawnStyles: drawn,
          };

          existingQueue.push(newChoice);
        }

        logEntries.push(
          `🎯 ${player.name} cumpriu a meta ("${goal.description}") da carta ${player.objective?.name}! Ganhou +${rewardVP} Pontos de Vitória${triggersStyle ? ' e 3 cartas de estilo para escolher 1 (Recompensa de Estilo)' : ''}.`
        );
      }
    });

    if (modified) {
      return {
        ...player,
        score: newScore,
        objective: {
          ...player.objective!,
          completedGoals,
        },
      };
    }

    return player;
  });

  return {
    ...state,
    players: updatedPlayers,
    decks: updatedDecks,
    pendingStyleChoicesQueue: existingQueue,
    pendingStyleChoice: existingQueue[0] || null,
    log: logEntries.length > 0 ? [...state.log, ...logEntries] : state.log,
  };
}

/**
 * Resolve a escolha de carta de estilo do jogador ao cumprir um objetivo.
 */
export function resolvePendingStyleChoice(
  state: GameState,
  chosenStyleId: string
): { newState: GameState; success: boolean; message: string } {
  const queue = state.pendingStyleChoicesQueue
    ? [...state.pendingStyleChoicesQueue]
    : (state.pendingStyleChoice ? [state.pendingStyleChoice] : []);

  if (queue.length === 0) {
    return { newState: state, success: false, message: 'Nenhuma escolha de estilo pendente.' };
  }

  const currentPending = queue[0];
  const player = state.players[currentPending.playerIndex];
  if (!player) {
    return { newState: state, success: false, message: 'Jogador não encontrado.' };
  }

  const chosenStyle = currentPending.drawnStyles.find(s => s.id === chosenStyleId) || currentPending.drawnStyles[0];
  if (!chosenStyle) {
    return { newState: state, success: false, message: 'Estilo não encontrado.' };
  }

  const remainingStyles = currentPending.drawnStyles.filter(s => s.id !== chosenStyle.id);
  const shuffledRemaining = shuffle(remainingStyles);
  const updatedStyleDeck = [...state.decks.styles, ...shuffledRemaining];

  const updatedPlayers = state.players.map((p, i) =>
    i === currentPending.playerIndex ? {
      ...p,
      styles: [...p.styles, chosenStyle],
    } : p
  );

  const updatedQueue = queue.slice(1);
  const logMsg = `✨ ${player.name} escolheu a carta de estilo ${chosenStyle.name}!`;

  let newState: GameState = {
    ...state,
    players: updatedPlayers,
    decks: {
      ...state.decks,
      styles: updatedStyleDeck,
    },
    pendingStyleChoicesQueue: updatedQueue,
    pendingStyleChoice: updatedQueue[0] || null,
    log: [...state.log, logMsg],
  };

  // Re-executa verificação de objetivos
  newState = checkPlayerObjectives(newState);

  return { newState, success: true, message: logMsg };
}

export function getBotAction(
  state: GameState
): { action: string; params?: Record<string, unknown> } {
  const player = state.players[state.currentPlayerIndex];

  if (state.turnActionState.hasActedThisTurn || player.hasFinishedDay) {
    return { action: 'pass' };
  }

  if (player.boardPosition === 0 || player.timeMarker >= 2) {
    return { action: 'park' };
  }

  return { action: 'pass' };
}

export const GameEngine = {
  createInitialState,
  selectStartingMusician,
  calculateMovement,
  selectTargetLocation,
  performRadioAction,
  performConservatorioGainSkill,
  performConservatorioCompose,
  performRuasHireMusician,
  performGravadoraRecordDisc,
  performLojasBuyResource,
  performLojasSellDisc,
  setLojasBonusChoice,
  performChapeuEstilosoChoose,
  performLojasBuyCube,
  performLojasFinishShopping,
  performParqueAction,
  goToClub,
  performNightGig,
  claimClubReward,
  applySponsorshipChoice,
  resolvePendingCubeChoice,
  checkPlayerObjectives,
  resolvePendingStyleChoice,
  resolvePendingLuthierChoice,
  resolveBicicletaDecision,
  applyInspirationGain,
  nextTurn,
  passTurn: nextTurn,
  startNewRound,
  endGame,
  calculateFinalScores,
  calculateDiscRanking,
  getBotAction,
  shuffle,
  rollDie,
  rollNeutralDie,
  maybeTriggerNeutralDieReroll,
  drawRandom,
  drawFromBag,
};
