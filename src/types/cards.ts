// Definições de Tipos para Cartas e Componentes de JAM

export type NoteColor = 'white' | 'red' | 'yellow' | 'blue' | 'purple' | 'wild';

export interface MusicianCard {
  id: string;
  name: string;
  level: 0 | 1 | 2 | 3; // 0 para músicos iniciais
  cost: number; // Custo de contratação nas Ruas
  artistNumber: number; // Número no canto superior esquerdo (para descarte no descanso)
  image?: string;
  notes: {
    color: NoteColor;
    points: number; // Pontos de vitória obtidos ao preencher este slot
  }[];
  specialRule?: {
    type: 'same_color' | 'different_colors' | 'reverse_order' | 'bonus_points' | 'draw_extra' | 'custom' | 'right_to_left';
    description: string;
  };
}

export type ResourceCardType = 'instrument' | 'personal';
export type ResourceTiming = 'immediate' | 'passive' | 'triggered' | 'end_game';

export interface ResourceCard {
  id: string;
  name: string;
  cost: number;
  victoryPoints: number; // Pontos no diamante azul (canto superior direito)
  image?: string;
  description: string;
  cardType: ResourceCardType;
  effectType: string;
  effectValue?: number;
  timing: ResourceTiming;
  // Custo especial para o Roadie (muda dependendo da rodada)
  specialCost?: { fromRound: number; cost: number };
  // Custo variável por número de jogadores (Empresário, Bicicleta)
  playerCountCost?: { 2: number; 3: number; 4: number };
}

export interface ObjectiveGoal {
  description: string;
  type: string;    // ex: 'band_size', 'coins', 'resources', 'discs', 'skill', ...
  value: number;   // threshold a ser atingido
}

export interface ObjectiveCard {
  id: string;
  name: string;
  image?: string;
  goals: [ObjectiveGoal, ObjectiveGoal, ObjectiveGoal];
}

export interface StyleCard {
  id: string;
  name: string;
  image?: string;
  description: string;
  timing: 'before_scoring' | 'during_draw' | 'after_draw' | 'passive';
  effectType: string;
}

export interface EventCard {
  id: string;
  name: string;
  image?: string;
  description: string;
  trigger: 'round_start' | 'round_end' | 'action_phase' | 'presentation_phase';
  effectType: string;
}
