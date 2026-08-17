import type { MusicianCard, ResourceCard, ObjectiveCard, StyleCard, EventCard, NoteColor } from './cards';
import type { ClubId } from './board';

// ─── TIPOS AUXILIARES ────────────────────────────────────────────────────────

export type PlayerColor = 'orange' | 'pink' | 'green' | 'brown' | 'gray';
export type GamePhase = 'day' | 'club_selection' | 'night' | 'rest' | 'end';

// Trilha de Habilidade com passos oficiais:
// 2, 3, 3., 4, 4., 5, 5., 6, 6., 6.., 7
export const SKILL_STEPS_VALUES: number[] = [2, 3, 3, 4, 4, 5, 5, 6, 6, 6, 7];
export const SKILL_STEPS_LABELS: string[] = ['2', '3', '3·', '4', '4·', '5', '5·', '6', '6·', '6··', '7'];

export interface CompositionToken {
  id: string;
  level: number;       // 1-7 (se virar 0, é descartado)
  isRecorded: boolean; // false = Partitura, true = Disco de Vinil gravado
}

export interface GigRecord {
  round: number;
  clubId?: ClubId;
  points: number;
  coins: number;
  audience?: number;
  success?: boolean;
}

// Músico com slots preenchidos (estado em jogo)
export type MusicianInPlay = MusicianCard & {
  filledNotes: (NoteColor | null)[]; // null = slot vazio
};

// Objetivo em jogo com progresso
export type ObjectiveInPlay = ObjectiveCard & {
  completedGoals: boolean[]; // [false, false, false]
};

// ─── ESTADO DO JOGADOR ───────────────────────────────────────────────────────

export interface PlayerState {
  id: string;
  name: string;
  color: string;
  isBot?: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';

  // Recursos & Moedas
  coins: number;
  score: number;             // Pontos de vitória acumulados
  renown: number;            // Trilha de Renome (1 a 10)
  skillStepIndex: number;    // Índice em SKILL_STEPS_VALUES (0 = nível 2)
  skill: number;             // Nível numérico de Habilidade (retira N cubos no show)
  inspiration: number;       // Fichas de Inspiração (começa com 1; max 3)

  // Posição e Tempo
  boardPosition: number;     // 0: Casa, 1: Rádio, 2: Conservatório, 3: Ruas, 4: Gravadora, 5: Lojas, 6: Parque
  timeMarker: number;        // Valor do dado de tempo (começa em 5; 6 com Roadie)
  hasRoadie: boolean;        // Dado começa em 6 (recurso Roadie)

  // Saco de Cubos Musicais (3 brancos, 1 vermelho, 1 roxo, 1 azul, 1 amarelo)
  bag: NoteColor[];

  // Cartas
  musicians: MusicianInPlay[]; // Começa com 1 músico inicial
  maxMusicians: number;        // Padrão: 3; Sala de Ensaio: 4
  resources: ResourceCard[];
  styles: StyleCard[];
  reservedStyle: StyleCard | null; // Estilo virado para baixo (Chapéu Estiloso)
  objective: ObjectiveInPlay | null;

  // Composições e Discos
  compositions: CompositionToken[]; // Partituras (começa com 1 de nível 1)
  discs: CompositionToken[];        // Discos gravados
  totalDiscsRecorded?: number;      // Total histórico de discos gravados (não diminui ao vender/descartar)
  hasPublicityToken: boolean;       // Ficha de divulgação da Rádio (+30 público)
  hasUsedBicicletaThisRound?: boolean; // Se já utilizou a Bicicleta (recurso 14) nesta rodada (limite 1x/rodada)

  // Estado do Dia / Noite
  hasFinishedDay: boolean;   // true se foi para um clube ou esgotou tempo
  chosenClub: ClubId | null; // Clube escolhido para tocar na fase da noite
  gigs: GigRecord[];
}

// ─── ESTADO DO MERCADO ───────────────────────────────────────────────────────

export interface Market {
  musicians: (MusicianCard | null)[]; // 4 slots de músicos disponíveis para compra
  resources: (ResourceCard | null)[]; // 4 slots na estante (o último slot tem desconto)
  styles: StyleCard[];
}

export interface Decks {
  musicians: MusicianCard[];          // Baralho único ordenado: Nível 1 no topo, Nível 2 no meio, Nível 3 no fundo
  discardedMusicians?: MusicianCard[];
  resources: ResourceCard[];
  discardedResources?: ResourceCard[];
  styles: StyleCard[];
  events: EventCard[];
}

// Saco principal de cubos coloridos
export interface MainBag {
  red: number;
  blue: number;
  yellow: number;
  purple: number;
  white: number;
}

// ─── ESTADO DO TURNO ATUAL (FASE DE DIA) ──────────────────────────────────────

export interface TurnActionState {
  selectedLocation: number | null; // Local pré-selecionado (obrigatório selecionar antes de agir)
  hasActedThisTurn: boolean;       // Se a ação principal já foi finalizada neste turno
  isShoppingInLojas: boolean;      // Se o jogador está na loja realizando compras
  hasBoughtCubeThisTurn: boolean;  // Limite de 1 cubo por turno nas Lojas
  isForwardMovementInLojas?: boolean; // Preserva o status do bônus durante compras nas Lojas
  hasSoldDiscThisTurn?: boolean;   // Se vendeu um disco como bônus nas Lojas
  lojasBonusChoice?: 'discount' | 'sell_disc' | null; // Escolha do bônus de movimento nas Lojas
}

// ─── ESTADO DO JOGO ───────────────────────────────────────────────────────────

export interface GameState {
  phase: GamePhase;      // 'day' | 'club_selection' | 'night' | 'rest' | 'end'
  round: number;         // 1 a 6
  maxRounds: number;     // 6
  currentPlayerIndex: number;

  players: PlayerState[];

  market: Market;
  decks: Decks;

  // Cubos disponíveis no Conservatório (2 cubos colocados ao lado do espaço)
  conservatorioCubes: NoteColor[];

  // Saco principal (cubos coloridos disponíveis para compra/reposição)
  mainBag: MainBag;

  // Prêmios das apresentações dos Clubes (slots com cubos dos jogadores)
  clubRewards: Record<ClubId, import('./board').ClubReward[]>;

  // Eventos das rodadas (mapeado: rodada → id do evento)
  eventsByRound: Record<number, string>;
  currentEvent: EventCard | null;

  // Estado do turno ativo
  turnActionState: TurnActionState;

  // Fila de apresentações da noite
  nightPresentationPlayerIndex: number;

  // Log de jogo
  log: string[];

  // Draft inicial de músicos (ordem reversa de turno)
  isInitialDraftActive?: boolean;
  availableStartingMusicians?: import('./cards').MusicianCard[];
  draftPlayerIndices?: number[];

  // Escolha pendente de cubo do Saco Principal (ao subir de nível, evento, etc.)
  pendingCubeChoicesQueue?: PendingCubeChoice[];
  pendingCubeChoice?: PendingCubeChoice | null;

  // Escolha pendente de cartas de estilo (ao cumprir objetivos)
  pendingStyleChoicesQueue?: PendingStyleChoice[];
  pendingStyleChoice?: PendingStyleChoice | null;

  // Escolha pendente de instrumento do Luthier (recurso 15)
  pendingLuthierChoice?: PendingLuthierChoice | null;

  // Decisão pendente de taxa da Bicicleta (recurso 14)
  pendingBicicletaDecision?: PendingBicicletaDecision | null;

  // Dado neutro bloqueador (exclusivo para partidas de 2 jogadores)
  neutralDie?: NeutralDieState | null;

  // Fim de jogo
  isGameOver: boolean;
  winner: string | null; // id do jogador vencedor
}

export interface NeutralDieState {
  color: string;     // Cor do jogador não utilizada (ex: orange, pink, green, brown, gray)
  position: number;  // 1: Rádio, 2: Gravadora, 3: Conservatório, 4: Lojas, 5: Ruas, 6: Parque
  value: number;     // Face do dado (1 a 6)
}

export interface PendingCubeChoice {
  playerId: string;
  playerIndex: number;
  reason: 'skill_level_up' | 'workshop' | 'general';
  title: string;
  description: string;
  newSkillLevel?: number;
}

export interface PendingStyleChoice {
  playerId: string;
  playerIndex: number;
  goalIndex: number; // 0 (1º objetivo), 1 (2º objetivo), 2 (3º objetivo)
  objectiveName: string;
  rewardVP: number;
  drawnStyles: StyleCard[];
}

export interface PendingLuthierChoice {
  playerId: string;
  playerIndex: number;
  availableInstruments: import('./cards').ResourceCard[];
}

export interface PendingBicicletaDecision {
  ownerPlayerId: string;
  ownerPlayerIndex: number;
  visitingPlayerId: string;
  visitingPlayerIndex: number;
  targetLocation: number;
  originalVisitingFee: number;
}

// ─── ESTADO DE APRESENTAÇÃO (sub-estado durante gig) ─────────────────────────

export interface PresentationState {
  playerId: string;
  clubId: ClubId | null;
  drawnCubes: NoteColor[];
  assignments: Record<string, NoteColor[]>;
  pointsEarned: number;
  coinsEarned: number;
  audience: number;
  phase: 'drawing' | 'placing' | 'complete';
}
