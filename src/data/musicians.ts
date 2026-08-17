import type { MusicianCard } from '../types/cards';

// ============================================================
// Cartas de Músico - Banco de Dados Completo
// 
// Legenda de ícones observados nas cartas:
//  ≠  (ícone diferente) = Regra "Todos Diferentes": cada slot deve ser de cor diferente
//  =  (ícone igual)     = Regra "Todos Iguais": todos os slots devem ter a mesma cor
//  🕺 (ícone duplo/pares) = "Pares": o repeat notation (barras |: :|) indica
//                          que os slots emparelhados devem ter a mesma cor
//
// Estrutura de notas:
//  color: 'wild' = slot vazio (aceita qualquer cor)
//  color: 'red'/'blue'/'yellow'/'purple'/'white' = slot de cor específica
//  points: VP obtidos ao preencher o slot
//
// Cartas 1-4  = Músicos Iniciais (level 0) - distribuídos no início
// Cartas 5-10 = Músicos Nível 1 (barato, 1 nota)
// Cartas 11-19 = Músicos Nível 2 (intermediário, 2 notas)
// Cartas 20-30 = Músicos Nível 3 (caro, 3-4 notas)
// ============================================================

export const ALL_MUSICIANS: MusicianCard[] = [
  // ─── MÚSICOS INICIAIS (level 0) ───────────────────────────────────
  {
    id: 'musico_01',
    name: 'Baterista Iniciante',
    level: 0,
    cost: 3, // Azul = 3
    artistNumber: 1,
    image: '/assets/musicos/frente/cartas musico 1.jpg',
    notes: [
      { color: 'blue', points: 1 },
      { color: 'blue', points: 2 },
    ],
  },
  {
    id: 'musico_02',
    name: 'Guitarrista Iniciante',
    level: 0,
    cost: 1, // Vermelho = 1
    artistNumber: 2,
    image: '/assets/musicos/frente/cartas musico 2.jpg',
    notes: [
      { color: 'red', points: 1 },
    ],
  },
  {
    id: 'musico_03',
    name: 'Trompetista Iniciante',
    level: 0,
    cost: 2, // Amarelo = 2
    artistNumber: 3,
    image: '/assets/musicos/frente/cartas musico 3.jpg',
    notes: [
      { color: 'yellow', points: 2 },
    ],
  },
  {
    id: 'musico_04',
    name: 'Contrabaixista Iniciante',
    level: 0,
    cost: 4, // Roxo = 4
    artistNumber: 4,
    image: '/assets/musicos/frente/cartas musico 4.jpg',
    notes: [
      { color: 'wild', points: 1 },  // slot vazio (aceita qualquer cor)
      { color: 'purple', points: 2 },
    ],
  },

  // ─── MÚSICOS NÍVEL 1 ─────────────────────────────────────────────
  {
    id: 'musico_05',
    name: 'Pianista Moderno',
    level: 1,
    cost: 4,
    artistNumber: 5,
    image: '/assets/musicos/frente/cartas musico 5.jpg',
    notes: [
      { color: 'wild', points: 0 },
      { color: 'wild', points: 1 },
      { color: 'wild', points: 1 },
    ],
    specialRule: {
      type: 'different_colors',
      description: 'Todos Diferentes: cada nota deve ser de cor diferente (ícone ≠)',
    },
  },
  {
    id: 'musico_06',
    name: 'Baterista do Jazz',
    level: 1,
    cost: 5,
    artistNumber: 6,
    image: '/assets/musicos/frente/cartas musico 6.jpg',
    notes: [
      { color: 'wild', points: 0 },
      { color: 'wild', points: 4 },
    ],
    specialRule: {
      type: 'same_color',
      description: 'Todos Iguais: todas as notas devem ser da mesma cor (ícone =)',
    },
  },
  {
    id: 'musico_07',
    name: 'Organista Clássico',
    level: 1,
    cost: 5,
    artistNumber: 7,
    image: '/assets/musicos/frente/cartas musico 7.jpg',
    notes: [
      { color: 'wild', points: 0 },
      { color: 'purple', points: 3 },
    ],
  },
  {
    id: 'musico_08',
    name: 'Guitarristas Rock',
    level: 1,
    cost: 5,
    artistNumber: 8,
    image: '/assets/musicos/frente/cartas musico 8.jpg',
    notes: [
      { color: 'wild', points: 0 },
      { color: 'yellow', points: 3 },
    ],
  },
  {
    id: 'musico_09',
    name: 'Maestro Percussionista',
    level: 1,
    cost: 5,
    artistNumber: 9,
    image: '/assets/musicos/frente/cartas musico 9.jpg',
    notes: [
      { color: 'wild', points: 0 },
      { color: 'red', points: 3 },
    ],
  },
  {
    id: 'musico_10',
    name: 'Clarinetista Rinoceronte',
    level: 1,
    cost: 5,
    artistNumber: 10,
    image: '/assets/musicos/frente/cartas musico 10.jpg',
    notes: [
      { color: 'wild', points: 0 },
      { color: 'blue', points: 3 },
    ],
  },

  // ─── MÚSICOS NÍVEL 2 ─────────────────────────────────────────────
  {
    id: 'musico_11',
    name: 'Baladuqueira Ukulele',
    level: 2,
    cost: 6,
    artistNumber: 11,
    image: '/assets/musicos/frente/cartas musico 11.jpg',
    notes: [
      { color: 'blue', points: 2 },
      { color: 'yellow', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_12',
    name: 'Pianista do Clube Verde',
    level: 2,
    cost: 6,
    artistNumber: 12,
    image: '/assets/musicos/frente/cartas musico 12.jpg',
    notes: [
      { color: 'red', points: 2 },
      { color: 'purple', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_13',
    name: 'Timbaleiro do Conservatório',
    level: 2,
    cost: 6,
    artistNumber: 13,
    image: '/assets/musicos/frente/cartas musico 13.jpg',
    notes: [
      { color: 'blue', points: 2 },
      { color: 'red', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_14',
    name: 'Sitarista',
    level: 2,
    cost: 6,
    artistNumber: 14,
    image: '/assets/musicos/frente/cartas musico 14.jpg',
    notes: [
      { color: 'yellow', points: 2 },
      { color: 'purple', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_15',
    name: 'Músico de Estrada',
    level: 2,
    cost: 6,
    artistNumber: 15,
    image: '/assets/musicos/frente/cartas musico 15.jpg',
    notes: [
      { color: 'yellow', points: 3 },
      { color: 'red', points: 2 },
    ],
    // Sem regra especial, fundo claro (não tem barras de repeat nem ícone)
  },
  // Carta 16 = no arquivo como 17_2.jpg (trombone, background colorido, azul+roxo)
  {
    id: 'musico_16',
    name: 'Trombonista Colorido',
    level: 2,
    cost: 6,
    artistNumber: 16,
    image: '/assets/musicos/frente/cartas musico 17_2.jpg',
    notes: [
      { color: 'blue', points: 3 },
      { color: 'purple', points: 2 },
    ],
  },
  // Carta 17 = no arquivo como 17_1.jpg (saxofonista, background vermelho, vermelho+azul)
  {
    id: 'musico_17',
    name: 'Saxofonista Red',
    level: 2,
    cost: 6,
    artistNumber: 17,
    image: '/assets/musicos/frente/cartas musico 17_1.jpg',
    notes: [
      { color: 'red', points: 3 },
      { color: 'blue', points: 2 },
    ],
  },
  {
    id: 'musico_18',
    name: 'Contrabaixista Elegante',
    level: 2,
    cost: 6,
    artistNumber: 18,
    image: '/assets/musicos/frente/cartas musico 18.jpg',
    notes: [
      { color: 'purple', points: 3 },
      { color: 'yellow', points: 2 },
    ],
  },
  {
    id: 'musico_19',
    name: 'Saxofonista Estudioso',
    level: 2,
    cost: 6,
    artistNumber: 19,
    image: '/assets/musicos/frente/cartas musico 19.jpg',
    notes: [
      { color: 'wild', points: 1 },
      { color: 'wild', points: 1 },
      { color: 'wild', points: 2 },
    ],
    specialRule: {
      type: 'different_colors',
      description: 'Todos Diferentes: cada nota deve ser de cor diferente (ícone ≠)',
    },
  },

  // ─── MÚSICOS NÍVEL 3 ─────────────────────────────────────────────
  {
    id: 'musico_20',
    name: 'Maestro Extravagante',
    level: 3,
    cost: 7,
    artistNumber: 20,
    image: '/assets/musicos/frente/cartas musico 20.jpg',
    notes: [
      { color: 'wild', points: 1 },
      { color: 'wild', points: 3 },
      { color: 'wild', points: 2 },
    ],
    specialRule: {
      type: 'same_color',
      description: 'Todos Iguais: todas as notas devem ser da mesma cor (ícone =)',
    },
  },
  {
    id: 'musico_21',
    name: 'Guitarrista Sombrio',
    level: 3,
    cost: 8,
    artistNumber: 21,
    image: '/assets/musicos/frente/cartas musico 21.jpg',
    notes: [
      { color: 'blue', points: 3 },
      { color: 'wild', points: 1 },
      { color: 'blue', points: 3 },
    ],
    // Background azul, sem ícone especial = notas azul + wild + azul
  },
  {
    id: 'musico_22',
    name: 'Tubista',
    level: 3,
    cost: 8,
    artistNumber: 22,
    image: '/assets/musicos/frente/cartas musico 22.jpg',
    notes: [
      { color: 'red', points: 3 },
      { color: 'wild', points: 1 },
      { color: 'red', points: 3 },
    ],
  },
  {
    id: 'musico_23',
    name: 'Violoncelista Vermelho',
    level: 3,
    cost: 8,
    artistNumber: 23,
    image: '/assets/musicos/frente/cartas musico 23.jpg',
    notes: [
      { color: 'yellow', points: 3 },
      { color: 'wild', points: 1 },
      { color: 'yellow', points: 3 },
    ],
  },
  {
    id: 'musico_24',
    name: 'Pianista Impressionista',
    level: 3,
    cost: 8,
    artistNumber: 24,
    image: '/assets/musicos/frente/cartas musico 24.jpg',
    notes: [
      { color: 'purple', points: 3 },
      { color: 'wild', points: 1 },
      { color: 'purple', points: 3 },
    ],
  },
  {
    id: 'musico_25',
    name: 'Pianista Virtuoso',
    level: 3,
    cost: 9,
    artistNumber: 25,
    image: '/assets/musicos/frente/cartas musico 25.jpg',
    notes: [
      { color: 'wild', points: 1 },
      { color: 'wild', points: 2 },
      { color: 'wild', points: 3 },
      { color: 'wild', points: 3 },
    ],
    specialRule: {
      type: 'different_colors',
      description: 'Todos Diferentes: cada nota deve ser de cor diferente (ícone ≠)',
    },
  },
  {
    id: 'musico_26',
    name: 'Baterista Octópus',
    level: 3,
    cost: 9,
    artistNumber: 26,
    image: '/assets/musicos/frente/cartas musico 26.jpg',
    notes: [
      { color: 'blue', points: 3 },
      { color: 'blue', points: 2 },
      { color: 'purple', points: 3 },
      { color: 'purple', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_27',
    name: 'Trompetista Veterano',
    level: 3,
    cost: 9,
    artistNumber: 27,
    image: '/assets/musicos/frente/cartas musico 27.jpg',
    notes: [
      { color: 'red', points: 3 },
      { color: 'red', points: 2 },
      { color: 'yellow', points: 3 },
      { color: 'yellow', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_28',
    name: 'Contrabaixista do Jazz',
    level: 3,
    cost: 9,
    artistNumber: 28,
    image: '/assets/musicos/frente/cartas musico 28.jpg',
    notes: [
      { color: 'blue', points: 3 },
      { color: 'blue', points: 2 },
      { color: 'red', points: 3 },
      { color: 'red', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_29',
    name: 'Violonista Clássico',
    level: 3,
    cost: 9,
    artistNumber: 29,
    image: '/assets/musicos/frente/cartas musico 29.jpg',
    notes: [
      { color: 'purple', points: 3 },
      { color: 'purple', points: 2 },
      { color: 'yellow', points: 3 },
      { color: 'yellow', points: 2 },
    ],
    specialRule: {
      type: 'right_to_left',
      description: 'Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação.',
    },
  },
  {
    id: 'musico_30',
    name: 'O Lenda',
    level: 3,
    cost: 10,
    artistNumber: 30,
    image: '/assets/musicos/frente/cartas musico 30.jpg',
    notes: [
      { color: 'wild', points: 1 },
      { color: 'wild', points: 3 },
      { color: 'wild', points: 3 },
      { color: 'wild', points: 3 },
    ],
    specialRule: {
      type: 'same_color',
      description: 'Todos Iguais: todas as notas devem ser da mesma cor (ícone =)',
    },
  },
];

// Cartas iniciais dadas no setup
export const INITIAL_MUSICIANS = ALL_MUSICIANS.filter(m => m.level === 0);

// Deck de nível 1 (embaralhado no início)
export const LEVEL1_MUSICIANS = ALL_MUSICIANS.filter(m => m.level === 1);

// Deck de nível 2 
export const LEVEL2_MUSICIANS = ALL_MUSICIANS.filter(m => m.level === 2);

// Deck de nível 3
export const LEVEL3_MUSICIANS = ALL_MUSICIANS.filter(m => m.level === 3);
