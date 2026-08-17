// Tipos para Tabuleiro Principal, Espaços de Ação e Clubes de JAM

export type ActionLocationId = 
  | 'casa'
  | 'radio'
  | 'conservatorio'
  | 'ruas'
  | 'gravadora'
  | 'lojas'
  | 'parque';

export interface ActionLocationDef {
  id: ActionLocationId;
  index: number; // 0: Casa, 1: Rádio, 2: Gravadora, 3: Conservatório, 4: Lojas, 5: Ruas, 6: Parque
  name: string;
  description: string;
  mainActionDescription: string;
  bonusDescription: string;
  icon: string;
  color: string;
  isStartOnly?: boolean; // Casa só é usada no início da rodada
}

export const BOARD_LOCATIONS: ActionLocationDef[] = [
  {
    id: 'casa',
    index: 0,
    name: 'Casa',
    icon: '🏠',
    color: '#7f8c8d',
    description: 'Ponto de partida da rodada e espera após esgotar o tempo.',
    mainActionDescription: 'Ponto inicial da rodada',
    bonusDescription: 'Sem bônus',
    isStartOnly: true,
  },
  {
    id: 'radio',
    index: 1,
    name: 'Rádio',
    icon: '📻',
    color: '#e67e22',
    description: 'Divulgação em massa: toque um disco gravado (-1 nível) para ganhar +1 Renome.',
    mainActionDescription: 'Toque 1 disco gravado (-1 nível) para ganhar +1 Renome',
    bonusDescription: 'Ficha de Divulgação (+30 público no próximo show)',
  },
  {
    id: 'gravadora',
    index: 2,
    name: 'Gravadora',
    icon: '💿',
    color: '#c0392b',
    description: 'Gravação de discos de vinil a partir de partituras (custa 4 moedas).',
    mainActionDescription: 'Grave uma partitura em Disco de Vinil por 4 moedas',
    bonusDescription: 'Desconto de 1 moeda na gravação (custa 3 moedas)',
  },
  {
    id: 'conservatorio',
    index: 3,
    name: 'Conservatório',
    icon: '🏛️',
    color: '#3498db',
    description: 'Estudo musical: Ganhe 1 passo de Habilidade OU Componha uma Música do nível da sua Habilidade.',
    mainActionDescription: 'Ganhe Habilidade OU Componha Música (opção de +1 nível gastando 1 Inspiração)',
    bonusDescription: 'Escolha 1 entre os 2 cubos disponíveis no Conservatório',
  },
  {
    id: 'lojas',
    index: 4,
    name: 'Lojas',
    icon: '🏪',
    color: '#d4ac0d',
    description: 'Compra de múltiplos recursos da estante e até 1 cubo por turno.',
    mainActionDescription: 'Compre cartas de recurso e até 1 cubo por 2 moedas',
    bonusDescription: 'Desconto de 1 moeda nas cartas de recursos ou venda de disco',
  },
  {
    id: 'ruas',
    index: 5,
    name: 'Ruas',
    icon: '🎻',
    color: '#9b59b6',
    description: 'Contratação de 1 novo músico para sua banda.',
    mainActionDescription: 'Contrate 1 músico pagando seu custo em moedas',
    bonusDescription: 'Ganhe +1 ficha de Inspiração',
  },
  {
    id: 'parque',
    index: 6,
    name: 'Parque',
    icon: '🌳',
    color: '#27ae60',
    description: 'Apresentação livre ao ar livre. Sem taxa de visitação.',
    mainActionDescription: 'Ganhe moedas = Renome (+2 moedas se estiver sozinho no Parque)',
    bonusDescription: 'Sem bônus de setas',
  },
];

export type ClubId = 
  | 'mosca_frita'
  | 'toca_do_gargalo'
  | 'broccolis'
  | 'o_flamingo'
  | 'blue_haven'
  | 'graham_bell_hall';

export interface ClubRewardItem {
  type: 'coins' | 'renown' | 'skill' | 'vp' | 'inspiration';
  amount: number;
}

export interface ClubReward {
  id: string;
  label: string;
  type: 'coins' | 'renown' | 'inspiration' | 'skill' | 'vp' | 'compound' | 'style';
  amount?: number;
  items?: ClubRewardItem[];
  description: string;
  claimedByPlayerId?: string | null;
  claimedRound?: number;
}

export interface ClubDef {
  id: ClubId;
  name: string;
  icon: string;
  minRenown: number;
  maxCapacity: number; // Lotação Máxima [L] (ex: 30, 40, 50, 70, 90, 120)
  successThreshold: number; // Sucesso [S] (pontos mínimos necessários na apresentação)
  isUnlimited: boolean;
  rewardDescription: string;
}

export const CLUBS: ClubDef[] = [
  {
    id: 'mosca_frita',
    name: 'Mosca Frita',
    icon: '🪰',
    minRenown: 0,
    maxCapacity: 30,
    successThreshold: 0,
    isUnlimited: true,
    rewardDescription: 'Clube livre (máx 30 público, meta 0 pts)',
  },
  {
    id: 'toca_do_gargalo',
    name: 'Toca do Gargalo',
    icon: '🍾',
    minRenown: 1,
    maxCapacity: 40,
    successThreshold: 0,
    isUnlimited: false,
    rewardDescription: 'Requer Renome 1+ (máx 40 público, meta 0 pts)',
  },
  {
    id: 'broccolis',
    name: "Broccoli's",
    icon: '🥦',
    minRenown: 2,
    maxCapacity: 50,
    successThreshold: 3,
    isUnlimited: false,
    rewardDescription: 'Requer Renome 2+ (máx 50 público, meta 3 pts)',
  },
  {
    id: 'o_flamingo',
    name: 'O Flamingo',
    icon: '🦩',
    minRenown: 2,
    maxCapacity: 70,
    successThreshold: 5,
    isUnlimited: false,
    rewardDescription: 'Requer Renome 2+ (máx 70 público, meta 5 pts)',
  },
  {
    id: 'blue_haven',
    name: 'Blue Haven',
    icon: '🎷',
    minRenown: 3,
    maxCapacity: 90,
    successThreshold: 7,
    isUnlimited: false,
    rewardDescription: 'Requer Renome 3+ (máx 90 público, meta 7 pts)',
  },
  {
    id: 'graham_bell_hall',
    name: 'Graham Bell Hall',
    icon: '🎩',
    minRenown: 4,
    maxCapacity: 120,
    successThreshold: 9,
    isUnlimited: true,
    rewardDescription: 'O templo do jazz! Requer Renome 4 (máx 120 público, meta 9 pts)',
  },
];

export const INITIAL_CLUB_REWARDS: Record<ClubId, ClubReward[]> = {
  mosca_frita: [
    { id: 'mf_ren_1', label: '+1 Renome', type: 'renown', amount: 1, description: 'Avance 1 nível na trilha de Renome', claimedByPlayerId: null },
    { id: 'mf_ren_2', label: '+1 Renome', type: 'renown', amount: 1, description: 'Avance 1 nível na trilha de Renome', claimedByPlayerId: null },
    { id: 'mf_skill_1', label: '+1 Habilidade', type: 'skill', amount: 1, description: 'Avance 1 passo na trilha de Habilidade', claimedByPlayerId: null },
    { id: 'mf_skill_2', label: '+1 Habilidade', type: 'skill', amount: 1, description: 'Avance 1 passo na trilha de Habilidade', claimedByPlayerId: null },
  ],
  toca_do_gargalo: [
    { id: 'tg_ren_1', label: '+1 Renome', type: 'renown', amount: 1, description: 'Avance 1 nível na trilha de Renome', claimedByPlayerId: null },
    { id: 'tg_ren_2', label: '+1 Renome', type: 'renown', amount: 1, description: 'Avance 1 nível na trilha de Renome', claimedByPlayerId: null },
    { id: 'tg_skill_1', label: '+1 Habilidade', type: 'skill', amount: 1, description: 'Avance 1 passo na trilha de Habilidade', claimedByPlayerId: null },
    { id: 'tg_coin_3', label: '+3 Moedas', type: 'coins', amount: 3, description: 'Ganhe 3 moedas de cachê', claimedByPlayerId: null },
  ],
  broccolis: [
    {
      id: 'br_ren_skill_1',
      label: '+1 Renome & +1 Habilidade',
      type: 'compound',
      items: [
        { type: 'renown', amount: 1 },
        { type: 'skill', amount: 1 },
      ],
      description: 'Avance 1 Renome e 1 passo de Habilidade',
      claimedByPlayerId: null,
    },
    {
      id: 'br_ren_skill_2',
      label: '+1 Renome & +1 Habilidade',
      type: 'compound',
      items: [
        { type: 'renown', amount: 1 },
        { type: 'skill', amount: 1 },
      ],
      description: 'Avance 1 Renome e 1 passo de Habilidade',
      claimedByPlayerId: null,
    },
    {
      id: 'br_ren_coin_2',
      label: '+1 Renome & +2 Moedas',
      type: 'compound',
      items: [
        { type: 'renown', amount: 1 },
        { type: 'coins', amount: 2 },
      ],
      description: 'Avance 1 Renome e ganhe 2 moedas',
      claimedByPlayerId: null,
    },
    {
      id: 'br_skill_coin_2',
      label: '+1 Habilidade & +2 Moedas',
      type: 'compound',
      items: [
        { type: 'skill', amount: 1 },
        { type: 'coins', amount: 2 },
      ],
      description: 'Avance 1 passo de Habilidade e ganhe 2 moedas',
      claimedByPlayerId: null,
    },
  ],
  o_flamingo: [
    { id: 'fl_ren_2', label: '+2 Renome', type: 'renown', amount: 2, description: 'Avance 2 níveis na trilha de Renome', claimedByPlayerId: null },
    {
      id: 'fl_ren_skill_1',
      label: '+1 Renome & +1 Habilidade',
      type: 'compound',
      items: [
        { type: 'renown', amount: 1 },
        { type: 'skill', amount: 1 },
      ],
      description: 'Avance 1 Renome e 1 passo de Habilidade',
      claimedByPlayerId: null,
    },
    {
      id: 'fl_ren_skill_2',
      label: '+1 Renome & +1 Habilidade',
      type: 'compound',
      items: [
        { type: 'renown', amount: 1 },
        { type: 'skill', amount: 1 },
      ],
      description: 'Avance 1 Renome e 1 passo de Habilidade',
      claimedByPlayerId: null,
    },
    { id: 'fl_vp_2', label: '+2 Pontos', type: 'vp', amount: 2, description: 'Ganhe 2 Pontos de Vitória', claimedByPlayerId: null },
  ],
  blue_haven: [
    {
      id: 'bh_ren_skill_1',
      label: '+1 Renome & +1 Habilidade',
      type: 'compound',
      items: [
        { type: 'renown', amount: 1 },
        { type: 'skill', amount: 1 },
      ],
      description: 'Avance 1 Renome e 1 passo de Habilidade',
      claimedByPlayerId: null,
    },
    {
      id: 'bh_ren_skill_2',
      label: '+1 Renome & +1 Habilidade',
      type: 'compound',
      items: [
        { type: 'renown', amount: 1 },
        { type: 'skill', amount: 1 },
      ],
      description: 'Avance 1 Renome e 1 passo de Habilidade',
      claimedByPlayerId: null,
    },
    { id: 'bh_vp_3', label: '+3 Pontos', type: 'vp', amount: 3, description: 'Ganhe 3 Pontos de Vitória', claimedByPlayerId: null },
    { id: 'bh_vp_2', label: '+2 Pontos', type: 'vp', amount: 2, description: 'Ganhe 2 Pontos de Vitória', claimedByPlayerId: null },
  ],
  graham_bell_hall: [
    { id: 'gb_vp_4_1', label: '+4 Pontos', type: 'vp', amount: 4, description: 'Ganhe 4 Pontos de Vitória', claimedByPlayerId: null },
    { id: 'gb_vp_4_2', label: '+4 Pontos', type: 'vp', amount: 4, description: 'Ganhe 4 Pontos de Vitória', claimedByPlayerId: null },
    { id: 'gb_vp_3', label: '+3 Pontos', type: 'vp', amount: 3, description: 'Ganhe 3 Pontos de Vitória', claimedByPlayerId: null },
    { id: 'gb_vp_2', label: '+2 Pontos', type: 'vp', amount: 2, description: 'Ganhe 2 Pontos de Vitória', claimedByPlayerId: null },
  ],
};
