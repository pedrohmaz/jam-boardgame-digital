import * as fs from "fs";
import * as path from "path";
//#region src/types/game.ts
var SKILL_STEPS_VALUES = [
	2,
	3,
	3,
	4,
	4,
	5,
	5,
	6,
	6,
	6,
	7
];
var SKILL_STEPS_LABELS = [
	"2",
	"3",
	"3·",
	"4",
	"4·",
	"5",
	"5·",
	"6",
	"6·",
	"6··",
	"7"
];
//#endregion
//#region src/types/board.ts
var BOARD_LOCATIONS = [
	{
		id: "casa",
		index: 0,
		name: "Casa",
		icon: "🏠",
		color: "#7f8c8d",
		description: "Ponto de partida da rodada e espera após esgotar o tempo.",
		mainActionDescription: "Ponto inicial da rodada",
		bonusDescription: "Sem bônus",
		isStartOnly: true
	},
	{
		id: "radio",
		index: 1,
		name: "Rádio",
		icon: "📻",
		color: "#e67e22",
		description: "Divulgação em massa: toque um disco gravado (-1 nível) para ganhar +1 Renome.",
		mainActionDescription: "Toque 1 disco gravado (-1 nível) para ganhar +1 Renome",
		bonusDescription: "Ficha de Divulgação (+30 público no próximo show)"
	},
	{
		id: "gravadora",
		index: 2,
		name: "Gravadora",
		icon: "💿",
		color: "#c0392b",
		description: "Gravação de discos de vinil a partir de partituras (custa 4 moedas).",
		mainActionDescription: "Grave uma partitura em Disco de Vinil por 4 moedas",
		bonusDescription: "Desconto de 1 moeda na gravação (custa 3 moedas)"
	},
	{
		id: "conservatorio",
		index: 3,
		name: "Conservatório",
		icon: "🏛️",
		color: "#3498db",
		description: "Estudo musical: Ganhe 1 passo de Habilidade OU Componha uma Música do nível da sua Habilidade.",
		mainActionDescription: "Ganhe Habilidade OU Componha Música (opção de +1 nível gastando 1 Inspiração)",
		bonusDescription: "Escolha 1 entre os 2 cubos disponíveis no Conservatório"
	},
	{
		id: "lojas",
		index: 4,
		name: "Lojas",
		icon: "🏪",
		color: "#d4ac0d",
		description: "Compra de múltiplos recursos da estante e até 1 cubo por turno.",
		mainActionDescription: "Compre cartas de recurso e até 1 cubo por 2 moedas",
		bonusDescription: "Desconto de 1 moeda nas cartas de recursos ou venda de disco"
	},
	{
		id: "ruas",
		index: 5,
		name: "Ruas",
		icon: "🎻",
		color: "#9b59b6",
		description: "Contratação de 1 novo músico para sua banda.",
		mainActionDescription: "Contrate 1 músico pagando seu custo em moedas",
		bonusDescription: "Ganhe +1 ficha de Inspiração"
	},
	{
		id: "parque",
		index: 6,
		name: "Parque",
		icon: "🌳",
		color: "#27ae60",
		description: "Apresentação livre ao ar livre. Sem taxa de visitação.",
		mainActionDescription: "Ganhe moedas = Renome (+2 moedas se estiver sozinho no Parque)",
		bonusDescription: "Sem bônus de setas"
	}
];
var CLUBS = [
	{
		id: "mosca_frita",
		name: "Mosca Frita",
		icon: "🪰",
		minRenown: 0,
		maxCapacity: 30,
		successThreshold: 0,
		isUnlimited: true,
		rewardDescription: "Clube livre (máx 30 público, meta 0 pts)"
	},
	{
		id: "toca_do_gargalo",
		name: "Toca do Gargalo",
		icon: "🍾",
		minRenown: 1,
		maxCapacity: 40,
		successThreshold: 0,
		isUnlimited: false,
		rewardDescription: "Requer Renome 1+ (máx 40 público, meta 0 pts)"
	},
	{
		id: "broccolis",
		name: "Broccoli's",
		icon: "🥦",
		minRenown: 2,
		maxCapacity: 50,
		successThreshold: 3,
		isUnlimited: false,
		rewardDescription: "Requer Renome 2+ (máx 50 público, meta 3 pts)"
	},
	{
		id: "o_flamingo",
		name: "O Flamingo",
		icon: "🦩",
		minRenown: 2,
		maxCapacity: 70,
		successThreshold: 5,
		isUnlimited: false,
		rewardDescription: "Requer Renome 2+ (máx 70 público, meta 5 pts)"
	},
	{
		id: "blue_haven",
		name: "Blue Haven",
		icon: "🎷",
		minRenown: 3,
		maxCapacity: 90,
		successThreshold: 7,
		isUnlimited: false,
		rewardDescription: "Requer Renome 3+ (máx 90 público, meta 7 pts)"
	},
	{
		id: "graham_bell_hall",
		name: "Graham Bell Hall",
		icon: "🎩",
		minRenown: 4,
		maxCapacity: 120,
		successThreshold: 9,
		isUnlimited: true,
		rewardDescription: "O templo do jazz! Requer Renome 4 (máx 120 público, meta 9 pts)"
	}
];
var INITIAL_CLUB_REWARDS = {
	mosca_frita: [
		{
			id: "mf_ren_1",
			label: "+1 Renome",
			type: "renown",
			amount: 1,
			description: "Avance 1 nível na trilha de Renome",
			claimedByPlayerId: null
		},
		{
			id: "mf_ren_2",
			label: "+1 Renome",
			type: "renown",
			amount: 1,
			description: "Avance 1 nível na trilha de Renome",
			claimedByPlayerId: null
		},
		{
			id: "mf_skill_1",
			label: "+1 Habilidade",
			type: "skill",
			amount: 1,
			description: "Avance 1 passo na trilha de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "mf_skill_2",
			label: "+1 Habilidade",
			type: "skill",
			amount: 1,
			description: "Avance 1 passo na trilha de Habilidade",
			claimedByPlayerId: null
		}
	],
	toca_do_gargalo: [
		{
			id: "tg_ren_1",
			label: "+1 Renome",
			type: "renown",
			amount: 1,
			description: "Avance 1 nível na trilha de Renome",
			claimedByPlayerId: null
		},
		{
			id: "tg_ren_2",
			label: "+1 Renome",
			type: "renown",
			amount: 1,
			description: "Avance 1 nível na trilha de Renome",
			claimedByPlayerId: null
		},
		{
			id: "tg_skill_1",
			label: "+1 Habilidade",
			type: "skill",
			amount: 1,
			description: "Avance 1 passo na trilha de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "tg_coin_3",
			label: "+3 Moedas",
			type: "coins",
			amount: 3,
			description: "Ganhe 3 moedas de cachê",
			claimedByPlayerId: null
		}
	],
	broccolis: [
		{
			id: "br_ren_skill_1",
			label: "+1 Renome & +1 Habilidade",
			type: "compound",
			items: [{
				type: "renown",
				amount: 1
			}, {
				type: "skill",
				amount: 1
			}],
			description: "Avance 1 Renome e 1 passo de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "br_ren_skill_2",
			label: "+1 Renome & +1 Habilidade",
			type: "compound",
			items: [{
				type: "renown",
				amount: 1
			}, {
				type: "skill",
				amount: 1
			}],
			description: "Avance 1 Renome e 1 passo de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "br_ren_coin_2",
			label: "+1 Renome & +2 Moedas",
			type: "compound",
			items: [{
				type: "renown",
				amount: 1
			}, {
				type: "coins",
				amount: 2
			}],
			description: "Avance 1 Renome e ganhe 2 moedas",
			claimedByPlayerId: null
		},
		{
			id: "br_skill_coin_2",
			label: "+1 Habilidade & +2 Moedas",
			type: "compound",
			items: [{
				type: "skill",
				amount: 1
			}, {
				type: "coins",
				amount: 2
			}],
			description: "Avance 1 passo de Habilidade e ganhe 2 moedas",
			claimedByPlayerId: null
		}
	],
	o_flamingo: [
		{
			id: "fl_ren_2",
			label: "+2 Renome",
			type: "renown",
			amount: 2,
			description: "Avance 2 níveis na trilha de Renome",
			claimedByPlayerId: null
		},
		{
			id: "fl_ren_skill_1",
			label: "+1 Renome & +1 Habilidade",
			type: "compound",
			items: [{
				type: "renown",
				amount: 1
			}, {
				type: "skill",
				amount: 1
			}],
			description: "Avance 1 Renome e 1 passo de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "fl_ren_skill_2",
			label: "+1 Renome & +1 Habilidade",
			type: "compound",
			items: [{
				type: "renown",
				amount: 1
			}, {
				type: "skill",
				amount: 1
			}],
			description: "Avance 1 Renome e 1 passo de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "fl_vp_2",
			label: "+2 Pontos",
			type: "vp",
			amount: 2,
			description: "Ganhe 2 Pontos de Vitória",
			claimedByPlayerId: null
		}
	],
	blue_haven: [
		{
			id: "bh_ren_skill_1",
			label: "+1 Renome & +1 Habilidade",
			type: "compound",
			items: [{
				type: "renown",
				amount: 1
			}, {
				type: "skill",
				amount: 1
			}],
			description: "Avance 1 Renome e 1 passo de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "bh_ren_skill_2",
			label: "+1 Renome & +1 Habilidade",
			type: "compound",
			items: [{
				type: "renown",
				amount: 1
			}, {
				type: "skill",
				amount: 1
			}],
			description: "Avance 1 Renome e 1 passo de Habilidade",
			claimedByPlayerId: null
		},
		{
			id: "bh_vp_3",
			label: "+3 Pontos",
			type: "vp",
			amount: 3,
			description: "Ganhe 3 Pontos de Vitória",
			claimedByPlayerId: null
		},
		{
			id: "bh_vp_2",
			label: "+2 Pontos",
			type: "vp",
			amount: 2,
			description: "Ganhe 2 Pontos de Vitória",
			claimedByPlayerId: null
		}
	],
	graham_bell_hall: [
		{
			id: "gb_vp_4_1",
			label: "+4 Pontos",
			type: "vp",
			amount: 4,
			description: "Ganhe 4 Pontos de Vitória",
			claimedByPlayerId: null
		},
		{
			id: "gb_vp_4_2",
			label: "+4 Pontos",
			type: "vp",
			amount: 4,
			description: "Ganhe 4 Pontos de Vitória",
			claimedByPlayerId: null
		},
		{
			id: "gb_vp_3",
			label: "+3 Pontos",
			type: "vp",
			amount: 3,
			description: "Ganhe 3 Pontos de Vitória",
			claimedByPlayerId: null
		},
		{
			id: "gb_vp_2",
			label: "+2 Pontos",
			type: "vp",
			amount: 2,
			description: "Ganhe 2 Pontos de Vitória",
			claimedByPlayerId: null
		}
	]
};
//#endregion
//#region src/data/musicians.ts
var ALL_MUSICIANS$1 = [
	{
		id: "musico_01",
		name: "Baterista Iniciante",
		level: 0,
		cost: 3,
		artistNumber: 1,
		image: "/assets/musicos/frente/cartas musico 1.jpg",
		notes: [{
			color: "blue",
			points: 1
		}, {
			color: "blue",
			points: 2
		}]
	},
	{
		id: "musico_02",
		name: "Guitarrista Iniciante",
		level: 0,
		cost: 1,
		artistNumber: 2,
		image: "/assets/musicos/frente/cartas musico 2.jpg",
		notes: [{
			color: "red",
			points: 1
		}]
	},
	{
		id: "musico_03",
		name: "Trompetista Iniciante",
		level: 0,
		cost: 2,
		artistNumber: 3,
		image: "/assets/musicos/frente/cartas musico 3.jpg",
		notes: [{
			color: "yellow",
			points: 2
		}]
	},
	{
		id: "musico_04",
		name: "Contrabaixista Iniciante",
		level: 0,
		cost: 4,
		artistNumber: 4,
		image: "/assets/musicos/frente/cartas musico 4.jpg",
		notes: [{
			color: "wild",
			points: 1
		}, {
			color: "purple",
			points: 2
		}]
	},
	{
		id: "musico_05",
		name: "Pianista Moderno",
		level: 1,
		cost: 4,
		artistNumber: 5,
		image: "/assets/musicos/frente/cartas musico 5.jpg",
		notes: [
			{
				color: "wild",
				points: 0
			},
			{
				color: "wild",
				points: 1
			},
			{
				color: "wild",
				points: 1
			}
		],
		specialRule: {
			type: "different_colors",
			description: "Todos Diferentes: cada nota deve ser de cor diferente (ícone ≠)"
		}
	},
	{
		id: "musico_06",
		name: "Baterista do Jazz",
		level: 1,
		cost: 5,
		artistNumber: 6,
		image: "/assets/musicos/frente/cartas musico 6.jpg",
		notes: [{
			color: "wild",
			points: 0
		}, {
			color: "wild",
			points: 4
		}],
		specialRule: {
			type: "same_color",
			description: "Todos Iguais: todas as notas devem ser da mesma cor (ícone =)"
		}
	},
	{
		id: "musico_07",
		name: "Organista Clássico",
		level: 1,
		cost: 5,
		artistNumber: 7,
		image: "/assets/musicos/frente/cartas musico 7.jpg",
		notes: [{
			color: "wild",
			points: 0
		}, {
			color: "purple",
			points: 3
		}]
	},
	{
		id: "musico_08",
		name: "Guitarristas Rock",
		level: 1,
		cost: 5,
		artistNumber: 8,
		image: "/assets/musicos/frente/cartas musico 8.jpg",
		notes: [{
			color: "wild",
			points: 0
		}, {
			color: "yellow",
			points: 3
		}]
	},
	{
		id: "musico_09",
		name: "Maestro Percussionista",
		level: 1,
		cost: 5,
		artistNumber: 9,
		image: "/assets/musicos/frente/cartas musico 9.jpg",
		notes: [{
			color: "wild",
			points: 0
		}, {
			color: "red",
			points: 3
		}]
	},
	{
		id: "musico_10",
		name: "Clarinetista Rinoceronte",
		level: 1,
		cost: 5,
		artistNumber: 10,
		image: "/assets/musicos/frente/cartas musico 10.jpg",
		notes: [{
			color: "wild",
			points: 0
		}, {
			color: "blue",
			points: 3
		}]
	},
	{
		id: "musico_11",
		name: "Baladuqueira Ukulele",
		level: 2,
		cost: 6,
		artistNumber: 11,
		image: "/assets/musicos/frente/cartas musico 11.jpg",
		notes: [{
			color: "blue",
			points: 2
		}, {
			color: "yellow",
			points: 2
		}],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_12",
		name: "Pianista do Clube Verde",
		level: 2,
		cost: 6,
		artistNumber: 12,
		image: "/assets/musicos/frente/cartas musico 12.jpg",
		notes: [{
			color: "red",
			points: 2
		}, {
			color: "purple",
			points: 2
		}],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_13",
		name: "Timbaleiro do Conservatório",
		level: 2,
		cost: 6,
		artistNumber: 13,
		image: "/assets/musicos/frente/cartas musico 13.jpg",
		notes: [{
			color: "blue",
			points: 2
		}, {
			color: "red",
			points: 2
		}],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_14",
		name: "Sitarista",
		level: 2,
		cost: 6,
		artistNumber: 14,
		image: "/assets/musicos/frente/cartas musico 14.jpg",
		notes: [{
			color: "yellow",
			points: 2
		}, {
			color: "purple",
			points: 2
		}],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_15",
		name: "Músico de Estrada",
		level: 2,
		cost: 6,
		artistNumber: 15,
		image: "/assets/musicos/frente/cartas musico 15.jpg",
		notes: [{
			color: "yellow",
			points: 3
		}, {
			color: "red",
			points: 2
		}]
	},
	{
		id: "musico_16",
		name: "Trombonista Colorido",
		level: 2,
		cost: 6,
		artistNumber: 16,
		image: "/assets/musicos/frente/cartas musico 17_2.jpg",
		notes: [{
			color: "blue",
			points: 3
		}, {
			color: "purple",
			points: 2
		}]
	},
	{
		id: "musico_17",
		name: "Saxofonista Red",
		level: 2,
		cost: 6,
		artistNumber: 17,
		image: "/assets/musicos/frente/cartas musico 17_1.jpg",
		notes: [{
			color: "red",
			points: 3
		}, {
			color: "blue",
			points: 2
		}]
	},
	{
		id: "musico_18",
		name: "Contrabaixista Elegante",
		level: 2,
		cost: 6,
		artistNumber: 18,
		image: "/assets/musicos/frente/cartas musico 18.jpg",
		notes: [{
			color: "purple",
			points: 3
		}, {
			color: "yellow",
			points: 2
		}]
	},
	{
		id: "musico_19",
		name: "Saxofonista Estudioso",
		level: 2,
		cost: 6,
		artistNumber: 19,
		image: "/assets/musicos/frente/cartas musico 19.jpg",
		notes: [
			{
				color: "wild",
				points: 1
			},
			{
				color: "wild",
				points: 1
			},
			{
				color: "wild",
				points: 2
			}
		],
		specialRule: {
			type: "different_colors",
			description: "Todos Diferentes: cada nota deve ser de cor diferente (ícone ≠)"
		}
	},
	{
		id: "musico_20",
		name: "Maestro Extravagante",
		level: 3,
		cost: 7,
		artistNumber: 20,
		image: "/assets/musicos/frente/cartas musico 20.jpg",
		notes: [
			{
				color: "wild",
				points: 1
			},
			{
				color: "wild",
				points: 3
			},
			{
				color: "wild",
				points: 2
			}
		],
		specialRule: {
			type: "same_color",
			description: "Todos Iguais: todas as notas devem ser da mesma cor (ícone =)"
		}
	},
	{
		id: "musico_21",
		name: "Guitarrista Sombrio",
		level: 3,
		cost: 8,
		artistNumber: 21,
		image: "/assets/musicos/frente/cartas musico 21.jpg",
		notes: [
			{
				color: "blue",
				points: 3
			},
			{
				color: "wild",
				points: 1
			},
			{
				color: "blue",
				points: 3
			}
		]
	},
	{
		id: "musico_22",
		name: "Tubista",
		level: 3,
		cost: 8,
		artistNumber: 22,
		image: "/assets/musicos/frente/cartas musico 22.jpg",
		notes: [
			{
				color: "red",
				points: 3
			},
			{
				color: "wild",
				points: 1
			},
			{
				color: "red",
				points: 3
			}
		]
	},
	{
		id: "musico_23",
		name: "Violoncelista Vermelho",
		level: 3,
		cost: 8,
		artistNumber: 23,
		image: "/assets/musicos/frente/cartas musico 23.jpg",
		notes: [
			{
				color: "yellow",
				points: 3
			},
			{
				color: "wild",
				points: 1
			},
			{
				color: "yellow",
				points: 3
			}
		]
	},
	{
		id: "musico_24",
		name: "Pianista Impressionista",
		level: 3,
		cost: 8,
		artistNumber: 24,
		image: "/assets/musicos/frente/cartas musico 24.jpg",
		notes: [
			{
				color: "purple",
				points: 3
			},
			{
				color: "wild",
				points: 1
			},
			{
				color: "purple",
				points: 3
			}
		]
	},
	{
		id: "musico_25",
		name: "Pianista Virtuoso",
		level: 3,
		cost: 9,
		artistNumber: 25,
		image: "/assets/musicos/frente/cartas musico 25.jpg",
		notes: [
			{
				color: "wild",
				points: 1
			},
			{
				color: "wild",
				points: 2
			},
			{
				color: "wild",
				points: 3
			},
			{
				color: "wild",
				points: 3
			}
		],
		specialRule: {
			type: "different_colors",
			description: "Todos Diferentes: cada nota deve ser de cor diferente (ícone ≠)"
		}
	},
	{
		id: "musico_26",
		name: "Baterista Octópus",
		level: 3,
		cost: 9,
		artistNumber: 26,
		image: "/assets/musicos/frente/cartas musico 26.jpg",
		notes: [
			{
				color: "blue",
				points: 3
			},
			{
				color: "blue",
				points: 2
			},
			{
				color: "purple",
				points: 3
			},
			{
				color: "purple",
				points: 2
			}
		],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_27",
		name: "Trompetista Veterano",
		level: 3,
		cost: 9,
		artistNumber: 27,
		image: "/assets/musicos/frente/cartas musico 27.jpg",
		notes: [
			{
				color: "red",
				points: 3
			},
			{
				color: "red",
				points: 2
			},
			{
				color: "yellow",
				points: 3
			},
			{
				color: "yellow",
				points: 2
			}
		],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_28",
		name: "Contrabaixista do Jazz",
		level: 3,
		cost: 9,
		artistNumber: 28,
		image: "/assets/musicos/frente/cartas musico 28.jpg",
		notes: [
			{
				color: "blue",
				points: 3
			},
			{
				color: "blue",
				points: 2
			},
			{
				color: "red",
				points: 3
			},
			{
				color: "red",
				points: 2
			}
		],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_29",
		name: "Violonista Clássico",
		level: 3,
		cost: 9,
		artistNumber: 29,
		image: "/assets/musicos/frente/cartas musico 29.jpg",
		notes: [
			{
				color: "purple",
				points: 3
			},
			{
				color: "purple",
				points: 2
			},
			{
				color: "yellow",
				points: 3
			},
			{
				color: "yellow",
				points: 2
			}
		],
		specialRule: {
			type: "right_to_left",
			description: "Da Direita para Esquerda: você pode alocar cubos da esquerda para a direita ou da direita para a esquerda. O primeiro cubo colocado define o sentido nesta apresentação."
		}
	},
	{
		id: "musico_30",
		name: "O Lenda",
		level: 3,
		cost: 10,
		artistNumber: 30,
		image: "/assets/musicos/frente/cartas musico 30.jpg",
		notes: [
			{
				color: "wild",
				points: 1
			},
			{
				color: "wild",
				points: 3
			},
			{
				color: "wild",
				points: 3
			},
			{
				color: "wild",
				points: 3
			}
		],
		specialRule: {
			type: "same_color",
			description: "Todos Iguais: todas as notas devem ser da mesma cor (ícone =)"
		}
	}
];
ALL_MUSICIANS$1.filter((m) => m.level === 0);
var LEVEL1_MUSICIANS = ALL_MUSICIANS$1.filter((m) => m.level === 1);
var LEVEL2_MUSICIANS = ALL_MUSICIANS$1.filter((m) => m.level === 2);
var LEVEL3_MUSICIANS = ALL_MUSICIANS$1.filter((m) => m.level === 3);
//#endregion
//#region src/data/styles_events.ts
var ALL_STYLES = [
	{
		id: "estilo_01",
		name: "Improvisação",
		image: "/assets/estilo/cartas de estilo-01.png",
		description: "Quando retirar um cubo em uma apresentação, você pode devolvê-lo para o saco e retirar um cubo novamente.",
		timing: "during_draw",
		effectType: "redraw_once_per_cube"
	},
	{
		id: "estilo_02",
		name: "Flexibilidade",
		image: "/assets/estilo/cartas de estilo-02.png",
		description: "Você pode alocar um dos cubos comprados a qualquer momento da apresentação.",
		timing: "during_draw",
		effectType: "place_cube_anytime"
	},
	{
		id: "estilo_03",
		name: "Cubo Branco Coringa",
		image: "/assets/estilo/cartas de estilo-03.png",
		description: "Você pode usar um de seus cubos brancos como sendo de qualquer cor em uma apresentação.",
		timing: "before_scoring",
		effectType: "white_as_wild"
	},
	{
		id: "estilo_04",
		name: "Cachê Extra",
		image: "/assets/estilo/cartas de estilo-04.png",
		description: "Ganhe 2 moedas extras nas apresentações (3 moedas na quinta e sexta rodadas). Ignore o limite de público quando ganhar estas moedas.",
		timing: "passive",
		effectType: "bonus_coins_presentation"
	},
	{
		id: "estilo_05",
		name: "Inspiração Tática",
		image: "/assets/estilo/cartas de estilo-05.png",
		description: "Você pode gastar sua inspiração para retirar um cubo extra a qualquer momento da apresentação (O limite de uma inspiração ainda vale.)",
		timing: "during_draw",
		effectType: "inspire_extra_draw_anytime"
	},
	{
		id: "estilo_06",
		name: "Minimalismo",
		image: "/assets/estilo/cartas de estilo-06.png",
		description: "O valor de objetivo das suas apresentações é reduzido em 1.",
		timing: "passive",
		effectType: "reduce_success_threshold"
	},
	{
		id: "estilo_07",
		name: "Composição Bônus",
		image: "/assets/estilo/cartas de estilo-07.png",
		description: "No final da apresentação, ganhe uma ficha de composição do nível de sua habilidade -1 (min. 2).",
		timing: "after_draw",
		effectType: "gain_composition_after_gig"
	},
	{
		id: "estilo_08",
		name: "Da Direita para Esquerda",
		image: "/assets/estilo/cartas de estilo-08.png",
		description: "Você pode alocar os cubos da esquerda para a direita em uma de suas cartas de músico (Ganhe todos os pontos de notas com um cubo, normalmente).",
		timing: "before_scoring",
		effectType: "fill_right_to_left"
	},
	{
		id: "estilo_09",
		name: "Seleção do Saco Principal",
		image: "/assets/estilo/cartas de estilo-09.png",
		description: "No começo de uma apresentação, você pode escolher um cubo do saco principal e colocá-lo no seu.",
		timing: "before_scoring",
		effectType: "draw_from_main_bag"
	},
	{
		id: "estilo_10",
		name: "Pureza",
		image: "/assets/estilo/cartas de estilo-10.png",
		description: "A primeira vez que retirar um cubo branco em uma apresentação, devolva-o para o saco e compre um cubo novamente.",
		timing: "during_draw",
		effectType: "first_white_redraw"
	},
	{
		id: "estilo_11",
		name: "Prêmio Cobiçado",
		image: "/assets/estilo/cartas de estilo-11.png",
		description: "Você pode ganhar um prêmio de apresentação que já foi ganho anteriormente.",
		timing: "passive",
		effectType: "claim_taken_reward"
	}
];
var ALL_EVENTS = [
	{
		id: "evento_01",
		name: "Dia Chuvoso",
		image: "/assets/evento/Cartas de Evento-01.png",
		description: "Ganhe a metade de moedas que ganharia (arredondado para cima) ao usar a ação do parque.",
		trigger: "action_phase",
		effectType: "park_half_coins"
	},
	{
		id: "evento_02",
		name: "Escolhas Estéticas",
		image: "/assets/evento/Cartas de Evento-02.png",
		description: "Quando este evento entra em jogo, cada jogador pode eliminar um cubo (não branco) de seu saco.",
		trigger: "round_start",
		effectType: "remove_nonwhite_cube"
	},
	{
		id: "evento_03",
		name: "Cada um na Sua!",
		image: "/assets/evento/Cartas de Evento-03.png",
		description: "Nesta rodada, os jogadores precisam gastar um tempo extra (além de todos os custos normais) para entrar em um espaço com outros jogadores (menos no espaço do parque).",
		trigger: "action_phase",
		effectType: "extra_time_shared_space"
	},
	{
		id: "evento_04",
		name: "Patrocínio",
		image: "/assets/evento/Cartas de Evento-04.png",
		description: "Quando este evento entra em jogo, cada jogador escolhe uma das opções: Ganhar 5 moedas; Ganhar 1 renome; Ganhar 1 habilidade.",
		trigger: "round_start",
		effectType: "sponsorship_choice"
	},
	{
		id: "evento_05",
		name: "Workshop",
		image: "/assets/evento/Cartas de Evento-05.png",
		description: "Quando realizarem o bônus do conservatório, os jogadores podem escolher qualquer cubo do saco principal, ao invés do espaço de cubos do conservatório.",
		trigger: "action_phase",
		effectType: "conservatorio_choose_any_cube"
	},
	{
		id: "evento_06",
		name: "Trabalho no Estúdio",
		image: "/assets/evento/Cartas de Evento-06.png",
		description: "Nesta rodada, os jogadores podem usar o espaço da Gravadora para gravar um disco como se tivessem uma composição de nível igual a sua habilidade, pagando o valor normal e utilizando o bônus, se possível (Apenas uma vez por jogador).",
		trigger: "action_phase",
		effectType: "gravadora_skill_level_record"
	},
	{
		id: "evento_07",
		name: "Acertando o Aluguel",
		image: "/assets/evento/Cartas de Evento-07.png",
		description: "No final da rodada, todos os jogadores devem pagar moedas igual a metade de seus níveis de renome (arredondado para cima). Se não puderem, os jogadores pagam a mesma quantia em pontos.",
		trigger: "round_end",
		effectType: "pay_renown_half_coins"
	},
	{
		id: "evento_08",
		name: "Jam Session!",
		image: "/assets/evento/Cartas de Evento-08.png",
		description: "Os jogadores podem trocar um cubo de seus sacos por um cubo de outro jogador (máx: duas vezes).",
		trigger: "round_start",
		effectType: "swap_cubes_with_player"
	},
	{
		id: "evento_09",
		name: "Semana de Negócios",
		image: "/assets/evento/Cartas de Evento-09.png",
		description: "Enquanto este evento estiver ativo, os jogadores podem pagar uma moeda sempre que quiserem realizar o bônus do espaço em que entraram, mesmo que estejam no sentido contrário ao das setas.",
		trigger: "action_phase",
		effectType: "buy_bonus_any_direction"
	},
	{
		id: "evento_10",
		name: "Vias Interditadas",
		image: "/assets/evento/Cartas de Evento-10.png",
		description: "Coloque os dados no espaço do Parque. Nesta rodada, o sentido das setas é invertido e todas as regras e efeitos devem ser cumpridos levando isso em consideração.",
		trigger: "round_start",
		effectType: "invert_arrow_direction"
	}
];
//#endregion
//#region src/data/resources.ts
var ALL_RESOURCES = [
	{
		id: "recurso_01",
		name: "Roupa Chique",
		cost: 3,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_01.jpg",
		description: "Ganhe 1 Renome.",
		cardType: "personal",
		effectType: "gain_renown",
		effectValue: 1,
		timing: "immediate"
	},
	{
		id: "recurso_02",
		name: "Coleção de Discos",
		cost: 5,
		victoryPoints: 1,
		image: "/assets/recursos/frente/recursos_02.jpg",
		description: "Ganhe uma ficha de inspiração no início de cada rodada.",
		cardType: "personal",
		effectType: "inspiration_each_round",
		timing: "passive"
	},
	{
		id: "recurso_03",
		name: "Caderno de Composição",
		cost: 4,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_03.jpg",
		description: "Suas composições têm um nível a mais quando são compostas.",
		cardType: "personal",
		effectType: "composition_bonus_level",
		effectValue: 1,
		timing: "passive"
	},
	{
		id: "recurso_04",
		name: "Roadie",
		cost: 7,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_04.jpg",
		description: "Seu dado começa as rodadas no valor 6. Esta carta custa 5 se for comprada a partir da 4ª rodada.",
		cardType: "personal",
		effectType: "die_starts_at_6",
		timing: "passive",
		specialCost: {
			fromRound: 4,
			cost: 5
		}
	},
	{
		id: "recurso_05",
		name: "Caixa de Som",
		cost: 4,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_05.jpg",
		description: "Ganhe 1 moeda quando usar a ação do parque.",
		cardType: "personal",
		effectType: "coin_on_park_action",
		effectValue: 1,
		timing: "triggered"
	},
	{
		id: "recurso_06",
		name: "Toca Discos",
		cost: 4,
		victoryPoints: 1,
		image: "/assets/recursos/frente/recursos_06.jpg",
		description: "Quando ganhar um nível de Habilidade, você pode escolher a cor do cubo ao invés de retirar um aleatoriamente (sem gastar Inspiração).",
		cardType: "personal",
		effectType: "choose_cube_color_on_skill_gain",
		timing: "triggered"
	},
	{
		id: "recurso_07",
		name: "Empresário",
		cost: 4,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_07.jpg",
		description: "Você não precisa pagar moedas aos outros jogadores para entrar em um local ocupado.",
		cardType: "personal",
		effectType: "no_entry_fee",
		timing: "passive",
		playerCountCost: {
			2: 4,
			3: 5,
			4: 6
		}
	},
	{
		id: "recurso_08",
		name: "Sensei",
		cost: 7,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_08.jpg",
		description: "Tire um cubo extra em uma apresentação.",
		cardType: "personal",
		effectType: "extra_draw_in_gig",
		effectValue: 1,
		timing: "passive"
	},
	{
		id: "recurso_09",
		name: "Sala de Ensaio",
		cost: 5,
		victoryPoints: 1,
		image: "/assets/recursos/frente/recursos_09.jpg",
		description: "Você pode ter 4 cartas de Músico simultaneamente.",
		cardType: "personal",
		effectType: "musician_hand_size_4",
		effectValue: 4,
		timing: "passive"
	},
	{
		id: "recurso_10",
		name: "Livro Misterioso",
		cost: 3,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_10.jpg",
		description: "Ganhe Habilidade.",
		cardType: "personal",
		effectType: "gain_skill",
		effectValue: 1,
		timing: "immediate"
	},
	{
		id: "recurso_11",
		name: "Chapéu Estiloso",
		cost: 8,
		victoryPoints: 1,
		image: "/assets/recursos/frente/recursos_11.jpg",
		description: "Escolha um estilo do baralho e coloque-o virado para baixo, próximo a suas cartas. Quando for ganhar um Estilo, você pode escolher este e virá-lo para cima. Se você já tem dois Estilos quando comprar esta carta, você pode trocar um deles por qualquer outro do baralho imediatamente.",
		cardType: "personal",
		effectType: "reserve_style_card",
		timing: "immediate"
	},
	{
		id: "recurso_12",
		name: "Cupons",
		cost: 5,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_12.jpg",
		description: "Você sempre pode realizar o bônus de um local quando anda no sentido contrário ao das setas.",
		cardType: "personal",
		effectType: "bonus_reverse_direction",
		timing: "passive"
	},
	{
		id: "recurso_13",
		name: "Baralho de Cartas",
		cost: 8,
		victoryPoints: 1,
		image: "/assets/recursos/frente/recursos_13.jpg",
		description: "Sempre que for ganhar uma ficha de Inspiração, você pode ganhar 2 pontos no lugar (mesmo se já tiver 3 fichas de Inspiração).",
		cardType: "personal",
		effectType: "inspiration_to_points",
		effectValue: 2,
		timing: "triggered"
	},
	{
		id: "recurso_14",
		name: "Bicicleta",
		cost: 2,
		victoryPoints: 1,
		image: "/assets/recursos/frente/recursos_14.jpg",
		description: "Quando um jogador precisar lhe pagar uma moeda, você pode recusar e ganhar um tempo no lugar. (limite: 1 vez por rodada)",
		cardType: "personal",
		effectType: "refuse_coin_gain_time",
		timing: "triggered",
		playerCountCost: {
			2: 2,
			3: 3,
			4: 4
		}
	},
	{
		id: "recurso_15",
		name: "Luthier",
		cost: 2,
		victoryPoints: 1,
		image: "/assets/recursos/frente/recursos_15.jpg",
		description: "Escolha uma carta de instrumento do baralho de recursos. Você pode comprá-la imediatamente. Reembaralhe o baralho de recursos.",
		cardType: "personal",
		effectType: "choose_instrument_card",
		timing: "immediate"
	},
	{
		id: "recurso_16",
		name: "Instrumento Lendário",
		cost: 8,
		victoryPoints: 6,
		image: "/assets/recursos/frente/recursos_16.jpg",
		description: "Vale 6 pontos de vitória no fim da partida.",
		cardType: "instrument",
		effectType: "victory_points_only",
		timing: "end_game"
	},
	{
		id: "recurso_17",
		name: "Piano",
		cost: 4,
		victoryPoints: 3,
		image: "/assets/recursos/frente/recursos_17.jpg",
		description: "Vale 3 pontos de vitória no fim da partida.",
		cardType: "instrument",
		effectType: "victory_points_only",
		timing: "end_game"
	},
	{
		id: "recurso_18",
		name: "Bateria",
		cost: 6,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_18.jpg",
		description: "Ganhe 1 ponto no fim da partida por cada prêmio de apresentação recebido nos clubes (o prêmio universal de 1 ponto não conta).",
		cardType: "instrument",
		effectType: "points_per_gig_achievement",
		effectValue: 1,
		timing: "end_game"
	},
	{
		id: "recurso_19",
		name: "Baixo",
		cost: 6,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_19.jpg",
		description: "Cada músico da sua banda confere pontos no fim da partida igual a seu nível (1, 2 ou 3 pontos).",
		cardType: "instrument",
		effectType: "points_per_musician_level",
		timing: "end_game"
	},
	{
		id: "recurso_20",
		name: "Guitarra",
		cost: 6,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_20.jpg",
		description: "Ganhe pontos no fim da partida igual a seu nível numérico de habilidade.",
		cardType: "instrument",
		effectType: "points_equal_skill_level",
		timing: "end_game"
	},
	{
		id: "recurso_21",
		name: "Sax",
		cost: 6,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_21.jpg",
		description: "Pontos por cubos brancos no saco no fim da partida: 3 cubos = 0 pts, 2 cubos = 2 pts, 1 cubo = 4 pts, 0 cubos = 6 pts.",
		cardType: "instrument",
		effectType: "points_based_on_white_cubes",
		timing: "end_game"
	},
	{
		id: "recurso_22",
		name: "Trompete",
		cost: 6,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_22.jpg",
		description: "Ganhe 1 ponto no fim da partida por carta de recurso possuída (incluindo esta carta e outros instrumentos).",
		cardType: "instrument",
		effectType: "points_per_resource",
		effectValue: 1,
		timing: "end_game"
	},
	{
		id: "recurso_23",
		name: "Gaita",
		cost: 6,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_23.jpg",
		description: "Ganhe pontos no fim da partida igual à quantidade da cor não-branca de cubos que tiver em maior número em seu saco.",
		cardType: "instrument",
		effectType: "points_per_chosen_color_cube",
		effectValue: 1,
		timing: "end_game"
	},
	{
		id: "recurso_24",
		name: "Trombone",
		cost: 6,
		victoryPoints: 0,
		image: "/assets/recursos/frente/recursos_24.jpg",
		description: "Ganhe 2 pontos no fim da partida para cada disco que gravou.",
		cardType: "instrument",
		effectType: "points_per_disc",
		effectValue: 2,
		timing: "end_game"
	}
];
var ALL_OBJECTIVES = [
	{
		id: "objetivo_01",
		name: "Objetivo 1",
		image: "/assets/objetivo/cartas de objetivo-01.png",
		goals: [
			{
				description: "2 músicos contratados",
				type: "musicians",
				value: 2
			},
			{
				description: "15 pontos de vitória",
				type: "score",
				value: 15
			},
			{
				description: "6 de renome",
				type: "renown",
				value: 6
			}
		]
	},
	{
		id: "objetivo_02",
		name: "Objetivo 2",
		image: "/assets/objetivo/cartas de objetivo-02.png",
		goals: [
			{
				description: "3 de renome",
				type: "renown",
				value: 3
			},
			{
				description: "16 moedas",
				type: "coins",
				value: 16
			},
			{
				description: "20 pontos de vitória",
				type: "score",
				value: 20
			}
		]
	},
	{
		id: "objetivo_03",
		name: "Objetivo 3",
		image: "/assets/objetivo/cartas de objetivo-03.png",
		goals: [
			{
				description: "3 cartas de recurso",
				type: "resources",
				value: 3
			},
			{
				description: "3 discos gravados",
				type: "discs",
				value: 3
			},
			{
				description: "6 cubos de uma mesma cor no saco",
				type: "cubes_same_color",
				value: 6
			}
		]
	},
	{
		id: "objetivo_04",
		name: "Objetivo 4",
		image: "/assets/objetivo/cartas de objetivo-04.png",
		goals: [
			{
				description: "1 disco gravado",
				type: "discs",
				value: 1
			},
			{
				description: "3 músicos contratados",
				type: "musicians",
				value: 3
			},
			{
				description: "6 de habilidade",
				type: "skill",
				value: 6
			}
		]
	},
	{
		id: "objetivo_05",
		name: "Objetivo 5",
		image: "/assets/objetivo/cartas de objetivo-05.png",
		goals: [
			{
				description: "4 de habilidade",
				type: "skill",
				value: 4
			},
			{
				description: "Eliminar 2 cubos brancos do saco",
				type: "eliminated_white_cubes",
				value: 2
			},
			{
				description: "20 moedas",
				type: "coins",
				value: 20
			}
		]
	}
];
//#endregion
//#region src/engine/gameEngine.ts
function shuffle(array) {
	const a = [...array];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
function rollDie() {
	return Math.floor(Math.random() * 6) + 1;
}
/**
* Rola o Dado Neutro (1 a 6). Se informado a posição atual, garante que o resultado é diferente (não repete o mesmo local).
*/
function rollNeutralDie(currentPosition) {
	let newPos;
	do
		newPos = Math.floor(Math.random() * 6) + 1;
	while (newPos === currentPosition);
	return newPos;
}
/**
* Em partidas para 2 jogadores, quando o jogador realiza a ação do espaço em que o Dado Neutro se encontra,
* o dado neutro é rolado e movido para um novo espaço (sem repetir o local atual).
*/
function maybeTriggerNeutralDieReroll(state, actionLocationIndex) {
	const currentDie = state.neutralDie;
	if (state.players.length !== 2 || !currentDie) return { neutralDie: state.neutralDie };
	if (currentDie.position !== actionLocationIndex) return { neutralDie: currentDie };
	const newPos = rollNeutralDie(currentDie.position);
	const locName = BOARD_LOCATIONS.find((l) => l.index === newPos)?.name || `Local ${newPos}`;
	const oldLocName = BOARD_LOCATIONS.find((l) => l.index === currentDie.position)?.name || `Local ${currentDie.position}`;
	return {
		neutralDie: {
			...currentDie,
			position: newPos,
			value: newPos
		},
		logMessage: `🎲 Dado Neutro (${currentDie.color}): ação realizada em ${oldLocName} ➔ Dado Neutro rolou ${newPos} e moveu-se para ${locName}!`
	};
}
function drawRandom(array) {
	if (array.length === 0) return null;
	const idx = Math.floor(Math.random() * array.length);
	return {
		item: array[idx],
		remaining: [...array.slice(0, idx), ...array.slice(idx + 1)]
	};
}
var INITIAL_TURN_ACTION_STATE = {
	selectedLocation: null,
	hasActedThisTurn: false,
	isShoppingInLojas: false,
	hasBoughtCubeThisTurn: false,
	hasSoldDiscThisTurn: false,
	lojasBonusChoice: null
};
function createInitialState(options) {
	const numPlayers = options.playerNames.length;
	if (numPlayers < 1 || numPlayers > 4) throw new Error("JAM suporta 1-4 jogadores.");
	const shuffledLevel3 = shuffle(LEVEL3_MUSICIANS);
	const shuffledLevel2 = shuffle(LEVEL2_MUSICIANS);
	const fullMusiciansDeck = [
		...shuffle(LEVEL1_MUSICIANS),
		...shuffledLevel2,
		...shuffledLevel3
	];
	const personalResources = ALL_RESOURCES.filter((r) => r.cardType === "personal");
	const instrumentResources = ALL_RESOURCES.filter((r) => r.cardType === "instrument");
	const shuffledPersonal = shuffle(personalResources);
	const initialMarketResources = shuffledPersonal.slice(0, 4);
	const remainingResourcesDeck = shuffle([...shuffledPersonal.slice(4), ...instrumentResources]);
	const shuffledObjectives = shuffle(ALL_OBJECTIVES);
	const availableStyles = shuffle(ALL_STYLES);
	const shuffledEvents = shuffle(ALL_EVENTS);
	const eventsByRound = {};
	for (let r = 2; r <= 6; r++) {
		const ev = shuffledEvents[r - 2];
		if (ev) eventsByRound[r] = ev.id;
	}
	const initialMainBag = {
		red: 6,
		blue: 6,
		yellow: 6,
		purple: 6,
		white: 0
	};
	const availableBagColors = [];
	Object.entries(initialMainBag).forEach(([c, count]) => {
		for (let i = 0; i < count; i++) availableBagColors.push(c);
	});
	const cons1 = drawRandom(availableBagColors);
	const cube1 = cons1 ? cons1.item : "red";
	if (cons1 && cube1 in initialMainBag) initialMainBag[cube1]--;
	const cons2 = drawRandom(availableBagColors.filter((c) => c !== cube1));
	const cube2 = cons2 ? cons2.item : cube1 === "red" ? "blue" : "red";
	if (cube2 in initialMainBag) initialMainBag[cube2]--;
	const conservatorioCubes = [cube1, cube2];
	const availableStartingMusicians = ALL_MUSICIANS$1.slice(0, 4);
	const draftPlayerIndices = Array.from({ length: numPlayers }, (_, i) => numPlayers - 1 - i);
	const players = shuffle(options.playerNames.map((name, i) => ({
		name,
		color: options.playerColors[i] || "gray",
		isBot: options.isBots ? !!options.isBots[i] : false,
		botDifficulty: options.botDifficulties ? options.botDifficulties[i] || "medium" : "medium"
	}))).map((cfg, i) => {
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
			bag: [
				"white",
				"white",
				"white",
				"red",
				"purple",
				"blue",
				"yellow"
			],
			musicians: [],
			resources: [],
			styles: [],
			objective: shuffledObjectives[i] ? {
				...shuffledObjectives[i],
				completedGoals: [
					false,
					false,
					false
				]
			} : null,
			compositions: [{
				id: `comp_init_${i}`,
				level: 1,
				isRecorded: false
			}],
			discs: [],
			totalDiscsRecorded: 0,
			gigs: [],
			boardPosition: 0,
			hasRoadie: false,
			hasPublicityToken: false,
			hasFinishedDay: false,
			chosenClub: null,
			maxMusicians: 3,
			reservedStyle: null
		};
	});
	const market = {
		musicians: fullMusiciansDeck.slice(0, 4),
		resources: initialMarketResources,
		styles: availableStyles.slice(0, 3)
	};
	let neutralDie = null;
	const neutralDieLogs = [];
	if (numPlayers === 2) {
		const allColors = [
			"orange",
			"pink",
			"green",
			"brown",
			"gray"
		];
		const usedColors = options.playerColors && options.playerColors.length > 0 ? options.playerColors : players.map((p) => p.color);
		const unusedColors = allColors.filter((c) => !usedColors.includes(c));
		const neutralColor = unusedColors.length > 0 ? unusedColors[Math.floor(Math.random() * unusedColors.length)] : "gray";
		const initialPos = rollNeutralDie();
		neutralDie = {
			color: neutralColor,
			position: initialPos,
			value: initialPos
		};
		const locName = BOARD_LOCATIONS.find((l) => l.index === initialPos)?.name || `Local ${initialPos}`;
		neutralDieLogs.push(`🎲 Setup (2 Jogadores): Dado Neutro [cor: ${neutralColor}] rolou ${initialPos} ➔ posicionado em ${locName}!`);
	}
	return {
		phase: "day",
		round: 1,
		maxRounds: 6,
		currentPlayerIndex: 0,
		players,
		market,
		decks: {
			musicians: fullMusiciansDeck.slice(4),
			resources: remainingResourcesDeck,
			styles: availableStyles.slice(3),
			events: shuffledEvents
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
			`Vez de ${players[draftPlayerIndices[0]].name} escolher seu músico inicial.`
		],
		winner: null,
		isGameOver: false
	};
}
function selectStartingMusician(state, musicianId) {
	if (!state.isInitialDraftActive || !state.draftPlayerIndices || state.draftPlayerIndices.length === 0) return state;
	const currentDraftPlayerIdx = state.draftPlayerIndices[0];
	const player = state.players[currentDraftPlayerIdx];
	const availableMusicians = state.availableStartingMusicians || [];
	const chosenMusician = availableMusicians.find((m) => m.id === musicianId);
	if (!player || !chosenMusician) return state;
	const cost = chosenMusician.cost || 0;
	const updatedPlayer = {
		...player,
		coins: Math.max(0, player.coins - cost),
		musicians: [{
			...chosenMusician,
			filledNotes: []
		}]
	};
	const updatedPlayers = state.players.map((p, i) => i === currentDraftPlayerIdx ? updatedPlayer : p);
	const remainingAvailable = availableMusicians.filter((m) => m.id !== musicianId);
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
			...isDraftComplete ? ["─── Draft Inicial de Músicos Concluído! ───", `Rodada 1: Fase de Dia! Vez de ${updatedPlayers[0].name}. Selecione um local no mapa para se mover antes de agir!`] : [`Vez de ${updatedPlayers[nextDraftQueue[0]].name} escolher seu músico inicial.`]
		]
	};
}
function calculateMovement(player, targetPos, allPlayers, isReverseArrows = false, neutralDie) {
	const currentPos = player.boardPosition;
	if (targetPos === currentPos) return {
		timeCost: 0,
		isForward: false,
		isReachable: false,
		visitingFee: 0,
		playersAtTarget: [],
		reason: "O movimento é obrigatório. Selecione outro local para onde se mover."
	};
	if (targetPos === 0) return {
		timeCost: 0,
		isForward: false,
		isReachable: false,
		visitingFee: 0,
		playersAtTarget: [],
		reason: "A Casa é apenas o ponto de partida da rodada."
	};
	if (targetPos < 1 || targetPos > 6) return {
		timeCost: 0,
		isForward: false,
		isReachable: false,
		visitingFee: 0,
		playersAtTarget: [],
		reason: "Posição inválida."
	};
	let timeCost = 1;
	let isForward = true;
	if (isReverseArrows) {
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
	} else if (currentPos === 0) {
		timeCost = 1;
		isForward = true;
	} else if (targetPos > currentPos) {
		timeCost = 1;
		isForward = true;
	} else {
		timeCost = 2;
		isForward = false;
	}
	const otherPlayersAtTarget = allPlayers.filter((p) => p.id !== player.id && p.boardPosition === targetPos && p.chosenClub === null && p.boardPosition >= 0);
	const hasNeutralDieAtTarget = !!(neutralDie && neutralDie.position === targetPos);
	const hasEmpresario = player.resources.some((r) => r.effectType === "no_entry_fee");
	const visitingFee = targetPos !== 6 && !hasEmpresario ? otherPlayersAtTarget.length + (hasNeutralDieAtTarget ? 1 : 0) : 0;
	const hasEnoughTime = player.timeMarker >= timeCost;
	const hasEnoughCoins = player.coins >= visitingFee;
	const isReachable = hasEnoughTime && hasEnoughCoins;
	let reason;
	if (!hasEnoughTime) reason = `Tempo insuficiente (precisa de ${timeCost} tempo, tem ${player.timeMarker}).`;
	else if (!hasEnoughCoins) reason = `Moedas insuficientes para pagar a taxa de visitação (${visitingFee} moeda(s) necessárias, tem ${player.coins}).`;
	return {
		timeCost,
		isForward,
		isReachable,
		visitingFee,
		playersAtTarget: otherPlayersAtTarget,
		hasNeutralDieAtTarget,
		reason
	};
}
/**
* Helper para conceder Inspiração a um jogador, aplicando o efeito do Recurso 13 (Baralho de Cartas):
* - Se o jogador possuir o Baralho de Cartas (recurso_13 / inspiration_to_points):
*   - Se já tiver 3 fichas de inspiração (máximo) OU preferir pontos, ganha automaticamente +2 VP por ficha.
*   - Se tiver menos de 3 fichas, ganha a inspiração normalmente.
*/
function applyInspirationGain(player, amount = 1) {
	const hasBaralhoDeCartas = player.resources.some((r) => r.id === "recurso_13" || r.effectType === "inspiration_to_points");
	let currentInsp = player.inspiration;
	let currentScore = player.score;
	let gainedInsp = 0;
	let gainedVP = 0;
	const logs = [];
	for (let i = 0; i < amount; i++) if (hasBaralhoDeCartas && currentInsp >= 3) {
		currentScore += 2;
		gainedVP += 2;
		logs.push(`+2 Pontos de Vitória (Baralho de Cartas: limite de Inspiração atingido)`);
	} else if (currentInsp < 3) {
		currentInsp += 1;
		gainedInsp += 1;
		logs.push(`+1 Inspiração (${currentInsp}/3)`);
	} else logs.push(`(limite de 3 Inspirações atingido)`);
	return {
		updatedPlayer: {
			...player,
			inspiration: currentInsp,
			score: currentScore
		},
		gainedInspiration: gainedInsp,
		gainedVP,
		logMessage: logs.join(", ")
	};
}
function selectTargetLocation(state, targetPosition) {
	if (state.turnActionState.hasActedThisTurn) return state;
	const player = state.players[state.currentPlayerIndex];
	const isInvertArrows = state.currentEvent?.effectType === "invert_arrow_direction";
	if (!calculateMovement(player, targetPosition, state.players, isInvertArrows, state.neutralDie).isReachable) return state;
	return {
		...state,
		turnActionState: {
			...state.turnActionState,
			selectedLocation: targetPosition
		}
	};
}
function applyMovement(state, targetPos) {
	const player = state.players[state.currentPlayerIndex];
	if (player.boardPosition === targetPos) return {
		state,
		isForward: state.turnActionState.isForwardMovementInLojas ?? false
	};
	const isInvertArrows = state.currentEvent?.effectType === "invert_arrow_direction";
	const moveInfo = calculateMovement(player, targetPos, state.players, isInvertArrows, state.neutralDie);
	const canAffordAllFees = player.coins >= moveInfo.visitingFee;
	const bicicletaOwner = state.players.filter((p, i) => i !== state.currentPlayerIndex && p.boardPosition === targetPos).find((p) => p.resources.some((r) => r.id === "recurso_14" || r.effectType === "refuse_coin_gain_time") && !p.hasUsedBicicletaThisRound);
	let pendingBicicletaDecision = null;
	if (bicicletaOwner && targetPos !== 6 && canAffordAllFees) pendingBicicletaDecision = {
		ownerPlayerId: bicicletaOwner.id,
		ownerPlayerIndex: state.players.findIndex((p) => p.id === bicicletaOwner.id),
		visitingPlayerId: player.id,
		visitingPlayerIndex: state.currentPlayerIndex,
		targetLocation: targetPos,
		originalVisitingFee: moveInfo.visitingFee
	};
	const updatedPlayers = state.players.map((p, i) => {
		if (i === state.currentPlayerIndex) {
			const remainingTime = p.timeMarker - moveInfo.timeCost;
			const isOutOfTime = remainingTime < 1;
			const feeToPayNow = bicicletaOwner ? Math.max(0, moveInfo.visitingFee - 1) : moveInfo.visitingFee;
			return {
				...p,
				boardPosition: isOutOfTime ? 0 : targetPos,
				timeMarker: remainingTime,
				coins: canAffordAllFees ? p.coins - feeToPayNow : p.coins,
				score: canAffordAllFees ? p.score : Math.max(0, p.score - 1),
				hasFinishedDay: isOutOfTime ? true : p.hasFinishedDay
			};
		}
		if (canAffordAllFees && moveInfo.visitingFee > 0 && p.boardPosition === targetPos) {
			if (bicicletaOwner && p.id === bicicletaOwner.id) return p;
			return {
				...p,
				coins: p.coins + 1
			};
		}
		return p;
	});
	const locName = BOARD_LOCATIONS.find((l) => l.index === targetPos)?.name || `Local ${targetPos}`;
	let feeMsg = "";
	if (moveInfo.visitingFee > 0) {
		if (canAffordAllFees) {
			const neutralNote = moveInfo.hasNeutralDieAtTarget ? " (inclui 1 moeda ao banco pelo Dado Neutro)" : "";
			feeMsg = ` (pagou ${moveInfo.visitingFee} moeda(s) de taxa${neutralNote})`;
		} else feeMsg = ` (moedas insuficientes para a taxa: não gastou moedas e perdeu 1 VP!)`;
	}
	const outOfTimeMsg = player.timeMarker - moveInfo.timeCost < 1 ? " [Tempo esgotado: peão retornou à Casa e aguarda a noite!]" : "";
	const hasCupons = player.resources.some((r) => r.effectType === "bonus_reverse_direction");
	const isForwardEffective = moveInfo.isForward || hasCupons;
	return {
		state: {
			...state,
			players: updatedPlayers,
			pendingBicicletaDecision: pendingBicicletaDecision || state.pendingBicicletaDecision || null,
			turnActionState: {
				...state.turnActionState,
				isForwardMovementInLojas: targetPos === 4 ? isForwardEffective : void 0
			},
			log: [...state.log, `${player.name} deslocou-se para ${locName} [-${moveInfo.timeCost} tempo${feeMsg}]${outOfTimeMsg}${hasCupons && !moveInfo.isForward ? " [Cupons: bônus ativado mesmo no sentido inverso!]" : ""}.`]
		},
		isForward: isForwardEffective
	};
}
/**
* 1: RÁDIO — Divulgação e Entrevistas.
* O jogador opta por:
* - 'play_disc': Tocar um disco gravado (-1 nível) para ganhar +1 Renome (exige possuir disco gravado).
* - 'publicity': Ganhar a Ficha de Divulgação (+30 público no próximo show).
* - Bônus das setas (isForward): Faz as DUAS ações!
*/
function performRadioAction(state, chosenDiscId, chosenOption) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já realizou sua ação neste turno."
	};
	const targetPos = state.turnActionState.selectedLocation;
	if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) return {
		newState: state,
		success: false,
		message: "O movimento é obrigatório. Selecione a Rádio no mapa antes de agir."
	};
	if (targetPos !== 1) return {
		newState: state,
		success: false,
		message: "Selecione a Rádio primeiro."
	};
	const { state: movedState, isForward } = applyMovement(state, 1);
	const player = movedState.players[movedState.currentPlayerIndex];
	let willPlayDisc = false;
	let willGainPublicity = false;
	if (isForward) {
		willPlayDisc = player.discs.length > 0;
		willGainPublicity = true;
	} else if (chosenOption === "play_disc") {
		if (player.discs.length === 0) return {
			newState: state,
			success: false,
			message: "Você precisa de pelo menos 1 Disco de Vinil gravado para tocar na Rádio."
		};
		willPlayDisc = true;
	} else willGainPublicity = true;
	let updatedDiscs = [...player.discs];
	let newRenown = player.renown;
	let logText = "";
	if (willPlayDisc && player.discs.length > 0) {
		const discToPlay = chosenDiscId ? player.discs.find((d) => d.id === chosenDiscId) || player.discs[0] : player.discs[0];
		const newDiscLevel = discToPlay.level - 1;
		updatedDiscs = player.discs.filter((d) => d.id !== discToPlay.id);
		if (newDiscLevel > 0) updatedDiscs = [...updatedDiscs, {
			...discToPlay,
			level: newDiscLevel
		}];
		newRenown = Math.min(10, player.renown + 1);
		const discStatus = newDiscLevel > 0 ? `disco Nv${discToPlay.level} passou a Nv${newDiscLevel}` : `disco Nv${discToPlay.level} foi totalmente executado (descartado)`;
		logText += `tocou música na Rádio (${discStatus}) e ganhou +1 Renome (${newRenown}/10)`;
	}
	if (willGainPublicity) logText += (logText.length > 0 ? " E " : "") + "ganhou a Ficha de Divulgação (+30 público no próximo show)";
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...p,
		renown: newRenown,
		discs: updatedDiscs,
		hasPublicityToken: willGainPublicity ? true : p.hasPublicityToken
	} : p);
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 1);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 1,
				hasActedThisTurn: true
			},
			log: [
				...movedState.log,
				`${player.name} ${logText} na Rádio${isForward ? " [Bônus: ambas as ações ativadas!]" : ""}.`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `Ação na Rádio realizada com sucesso!`
	};
}
/**
* 2: CONSERVATÓRIO — OPÇÃO A: Ganhar Habilidade.
*/
function performConservatorioGainSkill(state, options, legacyChosenMainBagColor) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já realizou sua ação neste turno."
	};
	const targetPos = state.turnActionState.selectedLocation;
	if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) return {
		newState: state,
		success: false,
		message: "O movimento é obrigatório. Selecione o Conservatório no mapa antes de agir."
	};
	if (targetPos !== 3) return {
		newState: state,
		success: false,
		message: "Selecione o Conservatório primeiro."
	};
	const opts = typeof options === "object" && options !== null ? options : {
		chosenConservatorioCubeIndex: typeof options === "number" ? options : void 0,
		chosenWorkshopColor: legacyChosenMainBagColor,
		skillUpSpendInspiration: false,
		skillUpChosenColor: void 0,
		recycleConservatorioCubes: false
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
	let pendingCubeChoice = null;
	if (isNumericLevelUp) pendingCubeChoice = {
		playerId: player.id,
		playerIndex: movedState.currentPlayerIndex,
		reason: "skill_level_up",
		title: "Aumento de Nível de Habilidade!",
		description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
		newSkillLevel: newSkill
	};
	let bonusCube = null;
	let bonusCustomText = "";
	const isWorkshop = movedState.currentEvent?.id === "evento_05" || movedState.currentEvent?.effectType === "conservatorio_choose_any_cube" || movedState.currentEvent?.effectType === "conservatorio_choose_from_bag";
	if (isForward) {
		if (opts.recycleConservatorioCubes) {
			updatedConservatorioCubes.forEach((c) => {
				if (c in updatedMainBag) updatedMainBag[c]++;
			});
			const newConsCubes = [];
			for (let k = 0; k < 2; k++) {
				const mainBagColors = [];
				Object.entries(updatedMainBag).forEach(([c, count]) => {
					if (c !== "white") for (let i = 0; i < count; i++) mainBagColors.push(c);
				});
				const drawn = drawRandom(mainBagColors);
				if (drawn) {
					newConsCubes.push(drawn.item);
					if (drawn.item in updatedMainBag) updatedMainBag[drawn.item]--;
				}
			}
			updatedConservatorioCubes = newConsCubes;
			bonusCustomText = " e optou por não pegar cubo, reciclando os 2 cubos do Conservatório";
		} else if (isWorkshop && opts.chosenWorkshopColor && (updatedMainBag[opts.chosenWorkshopColor] || 0) > 0) {
			bonusCube = opts.chosenWorkshopColor;
			updatedMainBag[opts.chosenWorkshopColor]--;
			bonusCustomText = ` e escolheu 1 cubo ${opts.chosenWorkshopColor} do Saco Principal (Evento Workshop)`;
		} else if (opts.chosenConservatorioCubeIndex !== void 0 && updatedConservatorioCubes[opts.chosenConservatorioCubeIndex]) {
			bonusCube = updatedConservatorioCubes[opts.chosenConservatorioCubeIndex];
			const mainBagColors = [];
			Object.entries(updatedMainBag).forEach(([c, count]) => {
				if (c !== "white") for (let i = 0; i < count; i++) mainBagColors.push(c);
			});
			const drawn = drawRandom(mainBagColors);
			if (drawn) {
				updatedConservatorioCubes[opts.chosenConservatorioCubeIndex] = drawn.item;
				if (drawn.item in updatedMainBag) updatedMainBag[drawn.item]--;
			}
			bonusCustomText = ` e escolheu 1 cubo ${bonusCube} do Conservatório`;
		}
	}
	const gainedCubes = [];
	if (bonusCube) gainedCubes.push(bonusCube);
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...p,
		skillStepIndex: nextStepIndex,
		skill: newSkill,
		bag: gainedCubes.length > 0 ? [...p.bag, ...gainedCubes] : p.bag
	} : p);
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 3);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			conservatorioCubes: updatedConservatorioCubes,
			mainBag: updatedMainBag,
			pendingCubeChoice: pendingCubeChoice || movedState.pendingCubeChoice || null,
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 3,
				hasActedThisTurn: true
			},
			log: [
				...movedState.log,
				`${player.name} estudou no Conservatório: avançou para o passo ${stepLabel} (Habilidade ${newSkill})${bonusCustomText}.`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `Habilidade avançada para o passo ${stepLabel}!`
	};
}
/**
* 2: CONSERVATÓRIO — OPÇÃO B: Compor Música.
*/
function performConservatorioCompose(state, spendInspiration, chosenConservatorioCubeIndex, chosenMainBagColor, recycleConservatorioCubes) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já realizou sua ação neste turno."
	};
	const targetPos = state.turnActionState.selectedLocation;
	if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) return {
		newState: state,
		success: false,
		message: "O movimento é obrigatório. Selecione o Conservatório no mapa antes de agir."
	};
	if (targetPos !== 3) return {
		newState: state,
		success: false,
		message: "Selecione o Conservatório primeiro."
	};
	if (spendInspiration && state.players[state.currentPlayerIndex].inspiration < 1) return {
		newState: state,
		success: false,
		message: "Fichas de Inspiração insuficientes."
	};
	const { state: movedState, isForward } = applyMovement(state, 3);
	const player = movedState.players[movedState.currentPlayerIndex];
	const hasCadernoComposicao = player.resources.some((r) => r.id === "recurso_03" || r.effectType === "composition_bonus_level");
	const cadernoBonus = hasCadernoComposicao ? 1 : 0;
	const bonusLevel = spendInspiration && player.inspiration >= 1 ? 1 : 0;
	const compLevel = player.skill + cadernoBonus + bonusLevel;
	const newComp = {
		id: `comp_${Date.now()}`,
		level: compLevel,
		isRecorded: false
	};
	let cubeGained = null;
	let updatedConservatorioCubes = [...movedState.conservatorioCubes];
	let updatedMainBag = { ...movedState.mainBag };
	let bonusCustomText = "";
	const isWorkshop = movedState.currentEvent?.id === "evento_05" || movedState.currentEvent?.effectType === "conservatorio_choose_any_cube" || movedState.currentEvent?.effectType === "conservatorio_choose_from_bag";
	if (isForward) {
		if (recycleConservatorioCubes) {
			updatedConservatorioCubes.forEach((c) => {
				if (c in updatedMainBag) updatedMainBag[c]++;
			});
			const newConsCubes = [];
			for (let k = 0; k < 2; k++) {
				const mainBagColors = [];
				Object.entries(updatedMainBag).forEach(([c, count]) => {
					if (c !== "white") for (let i = 0; i < count; i++) mainBagColors.push(c);
				});
				const drawn = drawRandom(mainBagColors);
				if (drawn) {
					newConsCubes.push(drawn.item);
					if (drawn.item in updatedMainBag) updatedMainBag[drawn.item]--;
				}
			}
			updatedConservatorioCubes = newConsCubes;
			bonusCustomText = " e optou por não pegar cubo, reciclando os 2 cubos do Conservatório";
		} else if (isWorkshop && chosenMainBagColor && (updatedMainBag[chosenMainBagColor] || 0) > 0) {
			cubeGained = chosenMainBagColor;
			updatedMainBag[chosenMainBagColor]--;
			bonusCustomText = ` e pegou 1 cubo ${chosenMainBagColor} diretamente do Saco Principal (Evento Workshop)`;
		} else if (chosenConservatorioCubeIndex !== void 0 && updatedConservatorioCubes[chosenConservatorioCubeIndex]) {
			cubeGained = updatedConservatorioCubes[chosenConservatorioCubeIndex];
			const mainBagColors = [];
			Object.entries(updatedMainBag).forEach(([c, count]) => {
				if (c !== "white") for (let i = 0; i < count; i++) mainBagColors.push(c);
			});
			const drawn = drawRandom(mainBagColors);
			if (drawn) {
				updatedConservatorioCubes[chosenConservatorioCubeIndex] = drawn.item;
				if (drawn.item in updatedMainBag) updatedMainBag[drawn.item]--;
			}
			bonusCustomText = ` e pegou 1 cubo ${cubeGained} do Conservatório`;
		}
	}
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...p,
		inspiration: p.inspiration - (bonusLevel > 0 ? 1 : 0),
		compositions: [...p.compositions, newComp],
		bag: cubeGained ? [...p.bag, cubeGained] : p.bag
	} : p);
	const inspText = bonusLevel > 0 ? " [gastou 1 Inspiração para +1 nível!]" : "";
	const cadernoText = hasCadernoComposicao ? " [Caderno de Composição: +1 nível]" : "";
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 3);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			conservatorioCubes: updatedConservatorioCubes,
			mainBag: updatedMainBag,
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 3,
				hasActedThisTurn: true
			},
			log: [
				...movedState.log,
				`${player.name} compôs uma Partitura Nível ${compLevel}${cadernoText}${inspText}${bonusCustomText}.`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `Partitura Nível ${compLevel} composta!${cadernoText}${inspText}`
	};
}
/**
* 3: RUAS — Contratar Músico do mercado de 4 slots.
* Custo: Moedas indicadas na carta.
* Bônus das setas: +1 Inspiração!
*/
function performRuasHireMusician(state, slotIndex, replacedMusicianId) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já realizou sua ação neste turno."
	};
	const targetPos = state.turnActionState.selectedLocation;
	if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) return {
		newState: state,
		success: false,
		message: "O movimento é obrigatório. Selecione as Ruas no mapa antes de agir."
	};
	if (targetPos !== 5) return {
		newState: state,
		success: false,
		message: "Selecione as Ruas primeiro."
	};
	const musician = state.market.musicians[slotIndex];
	if (!musician) return {
		newState: state,
		success: false,
		message: "Slot vazio (músico já contratado nesta rodada)."
	};
	const { state: movedState, isForward } = applyMovement(state, 5);
	const player = movedState.players[movedState.currentPlayerIndex];
	const actualCost = musician.cost;
	if (player.coins < actualCost) return {
		newState: state,
		success: false,
		message: `Moedas insuficientes (custa ${actualCost} moedas).`
	};
	const maxMusicians = (player.maxMusicians || 3) >= 4 || player.resources.some((r) => r.id === "recurso_09" || r.effectType === "musician_hand_size_4") ? 4 : 3;
	const isBandFull = player.musicians.length >= maxMusicians;
	if (isBandFull && !replacedMusicianId) return {
		newState: state,
		success: false,
		message: `Banda cheia (${player.musicians.length}/${maxMusicians}). Escolha qual músico substituir ou descarte o novo músico.`
	};
	const updatedMarketMusicians = [...movedState.market.musicians];
	updatedMarketMusicians[slotIndex] = null;
	const newMusicianEntry = {
		...musician,
		filledNotes: []
	};
	let playerAfterInspiration = player;
	let bonusText = "";
	if (isForward) {
		const { updatedPlayer: pWithInsp, logMessage: inspLog } = applyInspirationGain(player, 1);
		playerAfterInspiration = pWithInsp;
		bonusText = ` [Bônus das Ruas: ${inspLog}]`;
	}
	let updatedMusicians = [...playerAfterInspiration.musicians];
	let replaceText = "";
	if (isBandFull && replacedMusicianId) {
		if (replacedMusicianId === "discard_new") replaceText = " (e optou por descartar o músico recém-comprado)";
		else {
			const replaced = playerAfterInspiration.musicians.find((m) => m.id === replacedMusicianId);
			updatedMusicians = playerAfterInspiration.musicians.filter((m) => m.id !== replacedMusicianId);
			updatedMusicians.push(newMusicianEntry);
			replaceText = replaced ? ` (substituindo ${replaced.name})` : "";
		}
	} else updatedMusicians.push(newMusicianEntry);
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...playerAfterInspiration,
		coins: playerAfterInspiration.coins - actualCost,
		musicians: updatedMusicians
	} : p);
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 5);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			market: {
				...movedState.market,
				musicians: updatedMarketMusicians
			},
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 5,
				hasActedThisTurn: true
			},
			log: [
				...movedState.log,
				`${player.name} contratou ${musician.name} (Nível ${musician.level}) por ${actualCost} moedas nas Ruas${replaceText}${bonusText}.`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `${musician.name} contratado para a banda!${replaceText}${bonusText}`
	};
}
/**
* 4: GRAVADORA — Gravar Disco de Vinil a partir de Composição.
* Custo: 4 moedas (3 moedas com o bônus das setas - desconto de 1 moeda).
*/
function performGravadoraRecordDisc(state, compositionId) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já realizou sua ação neste turno."
	};
	const targetPos = state.turnActionState.selectedLocation;
	if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) return {
		newState: state,
		success: false,
		message: "O movimento é obrigatório. Selecione a Gravadora no mapa antes de agir."
	};
	if (targetPos !== 2) return {
		newState: state,
		success: false,
		message: "Selecione a Gravadora primeiro."
	};
	const currentPlayer = state.players[state.currentPlayerIndex];
	if (currentPlayer.compositions.length === 0) return {
		newState: state,
		success: false,
		message: "Você não tem partituras para gravar. Vá ao Conservatório compor uma música primeiro."
	};
	const isInvertArrows = state.currentEvent?.effectType === "invert_arrow_direction";
	const moveInfo = calculateMovement(currentPlayer, 2, state.players, isInvertArrows, state.neutralDie);
	const recordingCost = moveInfo.isForward ? 3 : 4;
	if (currentPlayer.coins < recordingCost + moveInfo.visitingFee) return {
		newState: state,
		success: false,
		message: `Moedas insuficientes. Gravar o disco custa ${recordingCost} moedas${moveInfo.visitingFee > 0 ? ` + ${moveInfo.visitingFee} de taxa` : ""}.`
	};
	const { state: movedState, isForward } = applyMovement(state, 2);
	const player = movedState.players[movedState.currentPlayerIndex];
	const compToRecord = compositionId ? player.compositions.find((c) => c.id === compositionId) || player.compositions[0] : player.compositions[0];
	const updatedCompositions = player.compositions.filter((c) => c.id !== compToRecord.id);
	const newDisc = {
		...compToRecord,
		isRecorded: true
	};
	const instantVP = compToRecord.level >= 7 ? 3 : compToRecord.level >= 4 ? 2 : 1;
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...p,
		coins: p.coins - recordingCost,
		compositions: updatedCompositions,
		discs: [...p.discs, newDisc],
		score: p.score + instantVP,
		totalDiscsRecorded: (p.totalDiscsRecorded ?? 0) + 1
	} : p);
	const discountMsg = isForward ? " (com 1 moeda de desconto do bônus)" : "";
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 2);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 2,
				hasActedThisTurn: true
			},
			log: [
				...movedState.log,
				`${player.name} gravou a Partitura Nível ${compToRecord.level} em Disco de Vinil por ${recordingCost} moedas na Gravadora (+${instantVP} Pontos de Vitória)${discountMsg}.`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `Disco Nível ${compToRecord.level} gravado por ${recordingCost} moedas (+${instantVP} Pontos de Vitória)!`
	};
}
/**
* 5: LOJAS — Comprar Recurso (múltiplas compras permitidas sem limite!).
*/
function performLojasBuyResource(state, slotIndex) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já encerrou suas compras neste turno."
	};
	const isAlreadyAtLojas = state.players[state.currentPlayerIndex].boardPosition === 4;
	const isSelectedLojas = state.turnActionState.selectedLocation === 4;
	if (!isAlreadyAtLojas && !isSelectedLojas) return {
		newState: state,
		success: false,
		message: "Selecione as Lojas no mapa primeiro."
	};
	const { state: movedState, isForward } = applyMovement(state, 4);
	const player = movedState.players[movedState.currentPlayerIndex];
	const resource = movedState.market.resources[slotIndex];
	if (!resource) return {
		newState: state,
		success: false,
		message: "Slot vazio (já comprado nesta rodada)."
	};
	let baseCost = resource.cost;
	if (resource.specialCost && movedState.round >= resource.specialCost.fromRound) baseCost = resource.specialCost.cost;
	if (resource.playerCountCost) {
		const numPlayers = movedState.players.length;
		baseCost = resource.playerCountCost[numPlayers] ?? resource.cost;
	}
	const slotDiscount = slotIndex === 3 ? 1 : 0;
	const hasSoldDisc = movedState.turnActionState.hasSoldDiscThisTurn || movedState.turnActionState.lojasBonusChoice === "sell_disc";
	const bonusDiscount = isForward && !hasSoldDisc ? 1 : 0;
	const totalDiscount = slotDiscount + bonusDiscount;
	const finalCost = Math.max(0, baseCost - totalDiscount);
	if (player.coins < finalCost) return {
		newState: state,
		success: false,
		message: `Moedas insuficientes (custa ${finalCost} moedas).`
	};
	const updatedMarketResources = [...movedState.market.resources];
	updatedMarketResources[slotIndex] = null;
	let updatedPlayer = {
		...player,
		coins: player.coins - finalCost,
		resources: [...player.resources, resource]
	};
	let pendingSkillCubeChoice = null;
	let pendingLuthierChoice = null;
	switch (resource.effectType) {
		case "gain_renown":
			updatedPlayer = {
				...updatedPlayer,
				renown: Math.min(10, updatedPlayer.renown + (resource.effectValue ?? 1))
			};
			break;
		case "gain_skill": {
			const oldSkill = SKILL_STEPS_VALUES[player.skillStepIndex ?? 0];
			const nextSkillIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (player.skillStepIndex ?? 0) + 1);
			const newSkill = SKILL_STEPS_VALUES[nextSkillIndex];
			const isNumericSkillUp = newSkill > oldSkill;
			updatedPlayer = {
				...updatedPlayer,
				skillStepIndex: nextSkillIndex,
				skill: newSkill
			};
			if (isNumericSkillUp) pendingSkillCubeChoice = {
				playerId: player.id,
				playerIndex: movedState.currentPlayerIndex,
				reason: "skill_level_up",
				title: "Livro Misterioso: Aumento de Habilidade!",
				description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
				newSkillLevel: newSkill
			};
			break;
		}
		case "musician_hand_size_4":
			updatedPlayer = {
				...updatedPlayer,
				maxMusicians: 4
			};
			break;
		case "die_starts_at_6":
			updatedPlayer = {
				...updatedPlayer,
				hasRoadie: true
			};
			break;
		case "choose_instrument_card": {
			const availableInstruments = [...movedState.decks.resources.filter((r) => r.cardType === "instrument"), ...(movedState.decks.discardedResources || []).filter((r) => r.cardType === "instrument")];
			if (availableInstruments.length > 0) pendingLuthierChoice = {
				playerId: player.id,
				playerIndex: movedState.currentPlayerIndex,
				availableInstruments
			};
			break;
		}
	}
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? updatedPlayer : p);
	const discountDetails = totalDiscount > 0 ? ` (desconto: -${totalDiscount} moedas${slotDiscount > 0 ? " [Último Espaço]" : ""}${bonusDiscount > 0 ? " [Bônus de Movimento]" : ""})` : "";
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 4);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			neutralDie: updatedNeutralDie,
			pendingCubeChoice: pendingSkillCubeChoice || movedState.pendingCubeChoice || null,
			pendingLuthierChoice: pendingLuthierChoice || movedState.pendingLuthierChoice || null,
			market: {
				...movedState.market,
				resources: updatedMarketResources
			},
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 4,
				isShoppingInLojas: true,
				lojasBonusChoice: hasSoldDisc ? "sell_disc" : isForward ? "discount" : null,
				hasActedThisTurn: false
			},
			log: [
				...movedState.log,
				`${player.name} comprou ${resource.name} por ${finalCost} moedas nas Lojas${discountDetails}.`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `${resource.name} adquirido!`
	};
}
/**
* Resolução da escolha de instrumento pelo Luthier (Recurso 15).
*/
function resolvePendingLuthierChoice(state, chosenInstrumentId) {
	const pending = state.pendingLuthierChoice;
	if (!pending) return {
		newState: state,
		success: false,
		message: "Nenhuma escolha de Luthier pendente."
	};
	const player = state.players[pending.playerIndex];
	if (!player) return {
		newState: state,
		success: false,
		message: "Jogador não encontrado."
	};
	let updatedPlayer = { ...player };
	let updatedDecks = { ...state.decks };
	let logText = "";
	if (chosenInstrumentId) {
		const instrument = [...state.decks.resources.filter((r) => r.cardType === "instrument"), ...(state.decks.discardedResources || []).filter((r) => r.cardType === "instrument")].find((r) => r.id === chosenInstrumentId);
		if (instrument && player.coins >= instrument.cost) {
			updatedPlayer.coins -= instrument.cost;
			updatedPlayer.resources = [...updatedPlayer.resources, instrument];
			const newDeckRes = state.decks.resources.filter((r) => r.id !== chosenInstrumentId);
			const newDiscRes = (state.decks.discardedResources || []).filter((r) => r.id !== chosenInstrumentId);
			updatedDecks.resources = shuffle(newDeckRes);
			updatedDecks.discardedResources = newDiscRes;
			logText = `${player.name} usou o Luthier e comprou ${instrument.name} pelo valor de face (${instrument.cost} moedas). Baralho de recursos reembaralhado!`;
		} else logText = `${player.name} optou por não comprar nenhum instrumento com o Luthier.`;
	} else logText = `${player.name} optou por não comprar nenhum instrumento com o Luthier.`;
	const updatedPlayers = state.players.map((p, i) => i === pending.playerIndex ? updatedPlayer : p);
	return {
		newState: checkPlayerObjectives({
			...state,
			players: updatedPlayers,
			decks: updatedDecks,
			pendingLuthierChoice: null,
			log: [...state.log, logText]
		}),
		success: true,
		message: logText
	};
}
/**
* Resolução da decisão de taxa da Bicicleta (Recurso 14).
*/
function resolveBicicletaDecision(state, waiveFee) {
	const pending = state.pendingBicicletaDecision;
	if (!pending) return {
		newState: state,
		success: false,
		message: "Nenhuma decisão de Bicicleta pendente."
	};
	const owner = state.players[pending.ownerPlayerIndex];
	const visiting = state.players[pending.visitingPlayerIndex];
	if (!owner || !visiting) return {
		newState: state,
		success: false,
		message: "Jogadores não encontrados."
	};
	let updatedOwner = { ...owner };
	let updatedVisiting = { ...visiting };
	let logText = "";
	if (waiveFee && !owner.hasUsedBicicletaThisRound) {
		updatedOwner.timeMarker = Math.min(6, updatedOwner.timeMarker + 1);
		updatedOwner.hasUsedBicicletaThisRound = true;
		logText = `🚲 ${owner.name} usou a Bicicleta: recusou a moeda de ${visiting.name} e ganhou +1 Tempo! (${visiting.name} economizou 1 moeda).`;
	} else {
		updatedVisiting.coins = Math.max(0, updatedVisiting.coins - 1);
		updatedOwner.coins = updatedOwner.coins + 1;
		logText = `${owner.name} optou por receber 1 moeda de taxa de ${visiting.name}.`;
	}
	const updatedPlayers = state.players.map((p, i) => {
		if (i === pending.ownerPlayerIndex) return updatedOwner;
		if (i === pending.visitingPlayerIndex) return updatedVisiting;
		return p;
	});
	return {
		newState: checkPlayerObjectives({
			...state,
			players: updatedPlayers,
			pendingBicicletaDecision: null,
			log: [...state.log, logText]
		}),
		success: true,
		message: logText
	};
}
/**
* 5: LOJAS — Vender Disco de Vinil (Opção alternativa ao desconto de 1 moeda no bônus de movimento).
* Ganha moedas iguais ao nível do disco e reduz o nível do disco em 1 (descarta se for para nível 0).
*/
function performLojasSellDisc(state, discId) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já encerrou suas ações nas Lojas neste turno."
	};
	if (state.turnActionState.hasSoldDiscThisTurn) return {
		newState: state,
		success: false,
		message: "Você já vendeu um disco neste turno."
	};
	const isAlreadyAtLojas = state.players[state.currentPlayerIndex].boardPosition === 4;
	const isSelectedLojas = state.turnActionState.selectedLocation === 4;
	if (!isAlreadyAtLojas && !isSelectedLojas) return {
		newState: state,
		success: false,
		message: "Selecione as Lojas primeiro."
	};
	const { state: movedState, isForward } = state.turnActionState.isShoppingInLojas ? {
		state,
		isForward: state.turnActionState.isForwardMovementInLojas ?? false
	} : applyMovement(state, 4);
	const player = movedState.players[movedState.currentPlayerIndex];
	if (!isForward) return {
		newState: state,
		success: false,
		message: "Vender discos é uma opção exclusiva do bônus de movimento com as setas para as Lojas."
	};
	const disc = player.discs.find((d) => d.id === discId);
	if (!disc) return {
		newState: state,
		success: false,
		message: "Disco não encontrado."
	};
	const coinsGained = disc.level;
	const newDiscLevel = disc.level - 1;
	const updatedDiscs = player.discs.map((d) => d.id === discId ? newDiscLevel > 0 ? {
		...d,
		level: newDiscLevel
	} : null : d).filter((d) => d !== null);
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...p,
		coins: p.coins + coinsGained,
		discs: updatedDiscs
	} : p);
	const discStatusText = newDiscLevel > 0 ? `(o disco agora é Nível ${newDiscLevel})` : `(o nível chegou a 0, disco descartado)`;
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 4);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 4,
				isShoppingInLojas: true,
				isForwardMovementInLojas: true,
				hasSoldDiscThisTurn: true,
				lojasBonusChoice: "sell_disc",
				hasActedThisTurn: false
			},
			log: [
				...movedState.log,
				`${player.name} vendeu um Disco Nível ${disc.level} nas Lojas por ${coinsGained} moedas ${discStatusText} [Bônus de Movimento das Lojas].`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `Disco Nível ${disc.level} vendido por ${coinsGained} moedas! ${discStatusText}`
	};
}
/**
* 5: LOJAS — Define a escolha explícita do bônus de movimento ('discount' ou 'sell_disc').
*/
function setLojasBonusChoice(state, choice) {
	const currentPlayer = state.players[state.currentPlayerIndex];
	const isAlreadyAtLojas = currentPlayer.boardPosition === 4;
	const isSelectedLojas = state.turnActionState.selectedLocation === 4;
	if (!isAlreadyAtLojas && !isSelectedLojas) return {
		newState: state,
		success: false,
		message: "Selecione as Lojas primeiro."
	};
	const { state: movedState, isForward } = state.turnActionState.isShoppingInLojas ? {
		state,
		isForward: state.turnActionState.isForwardMovementInLojas ?? false
	} : applyMovement(state, 4);
	if (!isForward) return {
		newState: state,
		success: false,
		message: "Bônus indisponível para movimento contra as setas."
	};
	return {
		newState: {
			...movedState,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 4,
				isShoppingInLojas: true,
				isForwardMovementInLojas: true,
				lojasBonusChoice: choice,
				hasActedThisTurn: false
			},
			log: [...movedState.log, `${currentPlayer.name} escolheu ${choice === "discount" ? "Desconto de 1 Moeda" : "Vender Disco"} como Bônus das Lojas.`]
		},
		success: true,
		message: `Bônus selecionado: ${choice === "discount" ? "Desconto de 1 Moeda em compras" : "Vender Disco"}.`
	};
}
/**
* 5: LOJAS — Efeito Imediato do Chapéu Estiloso (recurso_11):
* Reserva 1 estilo virado para baixo OU substitui 1 estilo ativo se já possuir 2.
*/
function performChapeuEstilosoChoose(state, chosenStyleId, replacedStyleId) {
	const player = state.players[state.currentPlayerIndex];
	const chosenStyle = [...state.decks.styles, ...state.market.styles].find((s) => s.id === chosenStyleId);
	if (!chosenStyle) return {
		newState: state,
		success: false,
		message: "Estilo não encontrado."
	};
	const remainingDeckStyles = state.decks.styles.filter((s) => s.id !== chosenStyleId);
	const remainingMarketStyles = state.market.styles.filter((s) => s.id !== chosenStyleId);
	let updatedStyles = [...player.styles];
	let updatedReservedStyle = player.reservedStyle;
	let logMessage = "";
	if (replacedStyleId) {
		const replaced = player.styles.find((s) => s.id === replacedStyleId);
		updatedStyles = player.styles.map((s) => s.id === replacedStyleId ? chosenStyle : s);
		if (replaced) remainingDeckStyles.push(replaced);
		logMessage = `${player.name} trocou o estilo ${replaced?.name} por ${chosenStyle.name} com o Chapéu Estiloso.`;
	} else {
		updatedReservedStyle = chosenStyle;
		logMessage = `${player.name} reservou o estilo ${chosenStyle.name} (virado para baixo) com o Chapéu Estiloso.`;
	}
	const updatedPlayers = state.players.map((p, i) => i === state.currentPlayerIndex ? {
		...p,
		styles: updatedStyles,
		reservedStyle: updatedReservedStyle
	} : p);
	return {
		newState: checkPlayerObjectives({
			...state,
			players: updatedPlayers,
			decks: {
				...state.decks,
				styles: remainingDeckStyles
			},
			market: {
				...state.market,
				styles: remainingMarketStyles
			},
			log: [...state.log, logMessage]
		}),
		success: true,
		message: logMessage
	};
}
/**
* Reclamar Prêmio de Apresentação de um Clube ao atingir a meta de sucesso.
*/
function claimClubReward(state, clubId, rewardId, gainedStyleCardId, targetPlayerId, disabledRewardId) {
	const playerIndex = targetPlayerId ? state.players.findIndex((p) => p.id === targetPlayerId) : state.currentPlayerIndex;
	const actualIndex = playerIndex !== -1 ? playerIndex : state.currentPlayerIndex;
	const player = state.players[actualIndex];
	const clubRewards = state.clubRewards[clubId] || [];
	const hasPremioCobicado = player.styles.some((s) => s.effectType === "claim_taken_reward" || s.id === "estilo_11");
	let updatedClubRewards = [...clubRewards];
	const chosenReward = updatedClubRewards.find((r) => r.id === rewardId);
	const isAlways1VP = rewardId === "always_1_vp" || rewardId === "fallback_vp";
	let updatedPlayer = { ...player };
	let logText = "";
	let updatedMainBag = { ...state.mainBag };
	let pendingRewardCubeChoice = null;
	if (isAlways1VP) {
		updatedPlayer.score += 1;
		logText = `escolheu ganhar +1 Ponto de Vitória de prêmio`;
	} else if (chosenReward) {
		if (chosenReward.claimedByPlayerId && !hasPremioCobicado) return {
			newState: state,
			success: false,
			message: "Este prêmio já foi reclamado por outro jogador."
		};
		updatedClubRewards = updatedClubRewards.map((r) => r.id === rewardId ? {
			...r,
			claimedByPlayerId: player.id,
			claimedRound: state.round
		} : r);
		if (hasPremioCobicado && disabledRewardId && disabledRewardId !== rewardId) updatedClubRewards = updatedClubRewards.map((r) => r.id === disabledRewardId && !r.claimedByPlayerId ? {
			...r,
			claimedByPlayerId: player.id,
			claimedRound: state.round
		} : r);
		const applyItem = (type, amount) => {
			if (type === "coins") updatedPlayer.coins += amount;
			else if (type === "renown") updatedPlayer.renown = Math.min(10, updatedPlayer.renown + amount);
			else if (type === "inspiration") {
				const { updatedPlayer: pWithInsp } = applyInspirationGain(updatedPlayer, amount);
				updatedPlayer = pWithInsp;
			} else if (type === "vp") updatedPlayer.score += amount;
			else if (type === "skill") {
				const oldSkill = SKILL_STEPS_VALUES[updatedPlayer.skillStepIndex ?? 0];
				const nextSkillIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (updatedPlayer.skillStepIndex ?? 0) + amount);
				const newSkill = SKILL_STEPS_VALUES[nextSkillIndex];
				const isNumericSkillUp = newSkill > oldSkill;
				updatedPlayer.skillStepIndex = nextSkillIndex;
				updatedPlayer.skill = newSkill;
				if (isNumericSkillUp) pendingRewardCubeChoice = {
					playerId: player.id,
					playerIndex: actualIndex,
					reason: "skill_level_up",
					title: "Prêmio do Clube: Aumento de Habilidade!",
					description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
					newSkillLevel: newSkill
				};
			}
		};
		if (chosenReward.type === "compound" && chosenReward.items) {
			chosenReward.items.forEach((item) => applyItem(item.type, item.amount));
			logText = `reclamou o prêmio [${chosenReward.label}]${disabledRewardId ? " (e desabilitou 1 slot com Prêmio Cobiçado)" : ""}`;
		} else {
			applyItem(chosenReward.type, chosenReward.amount ?? 1);
			logText = `reclamou o prêmio [${chosenReward.label}]${disabledRewardId ? " (e desabilitou 1 slot com Prêmio Cobiçado)" : ""}`;
		}
		if (chosenReward.type === "style") {
			if (gainedStyleCardId) {
				const styleFromDeck = state.decks.styles.find((s) => s.id === gainedStyleCardId) || state.market.styles.find((s) => s.id === gainedStyleCardId);
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
	const updatedPlayers = state.players.map((p, i) => i === actualIndex ? updatedPlayer : p);
	const clubObj = CLUBS.find((c) => c.id === clubId);
	const clubName = clubObj ? clubObj.name : clubId;
	return {
		newState: checkPlayerObjectives({
			...state,
			players: updatedPlayers,
			mainBag: updatedMainBag,
			pendingCubeChoice: pendingRewardCubeChoice || state.pendingCubeChoice || null,
			clubRewards: {
				...state.clubRewards,
				[clubId]: updatedClubRewards
			},
			log: [...state.log, `${player.name} ${logText} no show do clube ${clubName}!`]
		}),
		success: true,
		message: `Prêmio resgatado!`
	};
}
function performLojasBuyCube(state, chosenColor) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já encerrou suas compras neste turno."
	};
	if (state.turnActionState.hasBoughtCubeThisTurn) return {
		newState: state,
		success: false,
		message: "Limite atingido: você só pode comprar 1 cubo por turno nas Lojas."
	};
	const isAlreadyAtLojas = state.players[state.currentPlayerIndex].boardPosition === 4;
	const isSelectedLojas = state.turnActionState.selectedLocation === 4;
	if (!isAlreadyAtLojas && !isSelectedLojas) return {
		newState: state,
		success: false,
		message: "Selecione as Lojas primeiro."
	};
	const { state: movedState } = applyMovement(state, 4);
	const player = movedState.players[movedState.currentPlayerIndex];
	if (player.coins < 2) return {
		newState: state,
		success: false,
		message: "Moedas insuficientes (custa 2 moedas por cubo)."
	};
	const availableCount = movedState.mainBag[chosenColor] || 0;
	if (availableCount < 1) return {
		newState: state,
		success: false,
		message: `Não há cubos ${chosenColor} disponíveis no saco principal.`
	};
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...p,
		coins: p.coins - 2,
		bag: [...p.bag, chosenColor]
	} : p);
	const updatedMainBag = {
		...movedState.mainBag,
		[chosenColor]: availableCount - 1
	};
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 4);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			mainBag: updatedMainBag,
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 4,
				isShoppingInLojas: true,
				hasBoughtCubeThisTurn: true,
				hasActedThisTurn: false
			},
			log: [
				...movedState.log,
				`${player.name} comprou 1 cubo ${chosenColor} do Saco Principal por 2 moedas nas Lojas.`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `1 cubo ${chosenColor} comprado e adicionado ao seu saco!`
	};
}
function performLojasFinishShopping(state) {
	const { state: movedState } = state.turnActionState.isShoppingInLojas ? { state } : applyMovement(state, 4);
	const player = movedState.players[movedState.currentPlayerIndex];
	return checkPlayerObjectives({
		...movedState,
		turnActionState: {
			...movedState.turnActionState,
			selectedLocation: 4,
			isShoppingInLojas: false,
			hasActedThisTurn: true
		},
		log: [...movedState.log, `${player.name} concluiu suas compras nas Lojas.`]
	});
}
function performParqueAction(state) {
	if (state.turnActionState.hasActedThisTurn) return {
		newState: state,
		success: false,
		message: "Você já realizou sua ação neste turno."
	};
	const targetPos = state.turnActionState.selectedLocation;
	if (targetPos === null || targetPos === state.players[state.currentPlayerIndex].boardPosition) return {
		newState: state,
		success: false,
		message: "O movimento é obrigatório. Selecione o Parque no mapa antes de agir."
	};
	if (targetPos !== 6) return {
		newState: state,
		success: false,
		message: "Selecione o Parque primeiro."
	};
	const { state: movedState, isForward: _ } = applyMovement(state, 6);
	const player = movedState.players[movedState.currentPlayerIndex];
	const otherPlayersInPark = movedState.players.filter((p, i) => i !== movedState.currentPlayerIndex && p.boardPosition === 6);
	const hasNeutralDieInPark = !!(movedState.neutralDie && movedState.neutralDie.position === 6);
	const isAloneInPark = otherPlayersInPark.length === 0 && !hasNeutralDieInPark;
	const baseCoins = player.renown;
	const totalCoinsGained = baseCoins + (isAloneInPark ? 2 : 0);
	const updatedPlayers = movedState.players.map((p, i) => i === movedState.currentPlayerIndex ? {
		...p,
		coins: p.coins + totalCoinsGained
	} : p);
	const bonusText = isAloneInPark ? " (+2 moedas de bônus por estar sozinho no Parque!)" : "";
	const { neutralDie: updatedNeutralDie, logMessage: neutralDieLog } = maybeTriggerNeutralDieReroll(movedState, 6);
	return {
		newState: checkPlayerObjectives({
			...movedState,
			players: updatedPlayers,
			neutralDie: updatedNeutralDie,
			turnActionState: {
				...movedState.turnActionState,
				selectedLocation: 6,
				hasActedThisTurn: true
			},
			log: [
				...movedState.log,
				`${player.name} tocou no Parque e arrecadou ${totalCoinsGained} moedas (${baseCoins} pelo Renome${bonusText}).`,
				...neutralDieLog ? [neutralDieLog] : []
			]
		}),
		success: true,
		message: `Apresentação no Parque: +${totalCoinsGained} moedas!${bonusText}`
	};
}
function goToClub(state, clubId) {
	const player = state.players[state.currentPlayerIndex];
	if (player.chosenClub !== null) return {
		newState: state,
		success: false,
		message: "Você já escolheu seu clube para esta rodada."
	};
	if (state.phase === "day" && state.turnActionState.hasActedThisTurn && !player.hasFinishedDay && player.timeMarker >= 1) return {
		newState: state,
		success: false,
		message: "Você já realizou uma ação neste turno. Passe a vez primeiro."
	};
	const club = CLUBS.find((c) => c.id === clubId);
	if (!club) return {
		newState: state,
		success: false,
		message: "Clube inválido."
	};
	if (player.renown < club.minRenown) return {
		newState: state,
		success: false,
		message: `Requer Renome ${club.minRenown}+ (seu renome é ${player.renown}).`
	};
	if (!club.isUnlimited) {
		const maxCapacity = state.players.length === 2 ? 1 : 2;
		if (state.players.filter((p) => p.id !== player.id && p.chosenClub === clubId).length >= maxCapacity) return {
			newState: state,
			success: false,
			message: `O clube ${club.name} já atingiu o limite de ${maxCapacity} jogador(es) nesta rodada.`
		};
	}
	const bonusInspiration = state.phase === "day" && player.timeMarker >= 1 && player.boardPosition !== 0 ? 1 : 0;
	const updatedPlayers = state.players.map((p, i) => i === state.currentPlayerIndex ? {
		...p,
		hasFinishedDay: true,
		chosenClub: clubId,
		boardPosition: -1,
		inspiration: Math.min(3, p.inspiration + bonusInspiration)
	} : p);
	const bonusMsg = bonusInspiration > 0 ? " [sobrou tempo: ganhou +1 Inspiração!]" : "";
	return {
		newState: checkPhaseTransition(checkPlayerObjectives({
			...state,
			players: updatedPlayers,
			turnActionState: {
				...state.turnActionState,
				hasActedThisTurn: true
			},
			log: [...state.log, `${player.name} foi para o clube ${club.name}!${bonusMsg}`]
		})),
		success: true,
		message: `Você foi para ${club.name}!${bonusMsg}`
	};
}
function drawFromBag(bag, count) {
	const tempBag = [...bag];
	const drawn = [];
	for (let i = 0; i < count && tempBag.length > 0; i++) {
		const result = drawRandom(tempBag);
		if (result) {
			drawn.push(result.item);
			tempBag.splice(tempBag.indexOf(result.item), 1);
		}
	}
	return drawn;
}
function performNightGig(state, musicianAssignments, options) {
	const player = state.players[state.currentPlayerIndex];
	const club = CLUBS.find((c) => c.id === player.chosenClub) || CLUBS[0];
	const hasWhiteAsWild = player.styles.some((s) => s.effectType === "white_as_wild");
	let totalPoints = 0;
	if (options?.pointsGained !== void 0) totalPoints = options.pointsGained;
	else player.musicians.forEach((musician) => {
		const assignedColors = musicianAssignments[musician.id];
		if (!assignedColors || assignedColors.length === 0) return;
		musician.notes.forEach((note, idx) => {
			const assignedColor = assignedColors[idx];
			if (!assignedColor) return;
			if (assignedColor === "white" && !hasWhiteAsWild) return;
			if (note.color === "wild" || note.color === assignedColor || hasWhiteAsWild && assignedColor === "white") totalPoints += note.points;
		});
	});
	const bonusCoinsFromStyle = player.styles.some((s) => s.effectType === "bonus_coins_presentation" || s.id === "estilo_04") ? state.round >= 5 ? 3 : 2 : 0;
	const hasReduceThresholdStyle = player.styles.some((s) => s.effectType === "reduce_success_threshold" || s.id === "estilo_06");
	const effectiveSuccessThreshold = club ? Math.max(1, club.successThreshold - (hasReduceThresholdStyle ? 1 : 0)) : 0;
	const baseAudience = player.renown * 10 + (player.hasPublicityToken ? 30 : 0);
	const finalAudience = options?.audience !== void 0 ? options.audience : Math.min(club.maxCapacity, Math.max(10, baseAudience));
	const coinsGained = (options?.coinsGained !== void 0 ? options.coinsGained : Math.floor(finalAudience / 10)) + (options?.coinsGained !== void 0 ? 0 : bonusCoinsFromStyle);
	const gigSuccess = options?.success !== void 0 ? options.success : totalPoints >= effectiveSuccessThreshold;
	const updatedBag = [...player.bag];
	let updatedMainBag = { ...state.mainBag };
	let inspirationSpent = 0;
	let mainBagStyleLog = "";
	if (options?.chosenMainBagCube && (updatedMainBag[options.chosenMainBagCube] || 0) > 0) {
		const chosenC = options.chosenMainBagCube;
		updatedMainBag[chosenC]--;
		updatedBag.push(chosenC);
		mainBagStyleLog = ` [Seleção do Saco Principal: pegou 1 cubo ${chosenC}]`;
	}
	if (options?.extraDrawInspirationUsed) inspirationSpent += 1;
	if (options?.eliminatedCube) {
		inspirationSpent += 1;
		const elimIdx = updatedBag.indexOf(options.eliminatedCube);
		if (elimIdx !== -1) updatedBag.splice(elimIdx, 1);
	}
	const hasGainCompAfterGig = player.styles.some((s) => s.effectType === "gain_composition_after_gig" || s.id === "estilo_07");
	let updatedCompositions = [...player.compositions];
	let extraCompLog = "";
	if (hasGainCompAfterGig) {
		const extraCompLevel = Math.max(2, player.skill - 1);
		const extraCompToken = {
			id: `comp_gig_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
			level: extraCompLevel,
			isRecorded: false
		};
		updatedCompositions.push(extraCompToken);
		extraCompLog = ` [Composição Bônus: ganhou Partitura Nível ${extraCompLevel}]`;
	}
	const resetMusicians = player.musicians.map((m) => ({
		...m,
		filledNotes: []
	}));
	const gigRecord = {
		round: state.round,
		clubId: club.id,
		points: totalPoints,
		coins: coinsGained,
		audience: finalAudience,
		success: gigSuccess
	};
	const updatedPlayers = state.players.map((p, i) => i === state.currentPlayerIndex ? {
		...p,
		score: p.score + totalPoints,
		coins: p.coins + coinsGained,
		inspiration: Math.max(0, p.inspiration - inspirationSpent),
		musicians: resetMusicians,
		bag: updatedBag,
		compositions: updatedCompositions,
		hasPublicityToken: false,
		gigs: [...p.gigs, gigRecord]
	} : p);
	const nextNightIndex = state.nightPresentationPlayerIndex + 1;
	const playersWithShows = updatedPlayers.filter((p) => p.chosenClub !== null);
	const allShowsCompleted = nextNightIndex >= playersWithShows.length;
	let newState = {
		...state,
		players: updatedPlayers,
		mainBag: updatedMainBag,
		nightPresentationPlayerIndex: nextNightIndex,
		log: [...state.log, `${player.name} tocou em ${club.name}: ${finalAudience} pessoas, +${totalPoints} pts, +${coinsGained} moedas${gigSuccess ? " [Meta alcançada!]" : ""}${options?.eliminatedCube ? ` [Eliminou 1 cubo ${options.eliminatedCube}]` : ""}${extraCompLog}${mainBagStyleLog}${bonusCoinsFromStyle > 0 ? ` [Cachê Extra: +${bonusCoinsFromStyle} moedas]` : ""}${hasReduceThresholdStyle ? ` [Minimalismo: Meta ${effectiveSuccessThreshold} pts]` : ""}.`]
	};
	if (allShowsCompleted) newState = startNewRound(newState);
	else {
		const nextShowPlayer = playersWithShows[nextNightIndex];
		if (nextShowPlayer) {
			const nextShowPlayerIdx = newState.players.findIndex((p) => p.id === nextShowPlayer.id);
			newState.currentPlayerIndex = nextShowPlayerIdx;
		}
	}
	newState = checkPlayerObjectives(newState);
	return {
		newState,
		pointsGained: totalPoints,
		coinsGained,
		audience: finalAudience,
		success: gigSuccess
	};
}
function replenishMusiciansRiver(marketMusicians, musiciansDeck) {
	const newMusicians = [...marketMusicians];
	let remainingDeck = [...musiciansDeck];
	for (let i = 0; i < 4; i++) if (newMusicians[i] === null && remainingDeck.length > 0) {
		newMusicians[i] = remainingDeck[0];
		remainingDeck = remainingDeck.slice(1);
	}
	return {
		newMusicians,
		remainingDeck
	};
}
function replenishResourceRiver(marketResources, resourceDeck) {
	const existingCards = marketResources.filter((c) => c !== null);
	let newDeck = [...resourceDeck];
	const newRiver = [
		null,
		null,
		null,
		null
	];
	let writeIdx = 3;
	for (let i = existingCards.length - 1; i >= 0 && writeIdx >= 0; i--) {
		newRiver[writeIdx] = existingCards[i];
		writeIdx--;
	}
	for (let idx = 0; idx < 4; idx++) if (newRiver[idx] === null && newDeck.length > 0) {
		newRiver[idx] = newDeck[0];
		newDeck = newDeck.slice(1);
	}
	return {
		newRiver,
		remainingDeck: newDeck
	};
}
function nextTurn(state) {
	const player = state.players[state.currentPlayerIndex];
	if (!state.turnActionState.hasActedThisTurn && !player.hasFinishedDay && player.timeMarker >= 1) return state;
	const updatedPlayers = state.players.map((p, i) => {
		if (i === state.currentPlayerIndex && p.timeMarker < 1) return {
			...p,
			boardPosition: 0,
			hasFinishedDay: true
		};
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
	return checkPhaseTransition(checkPlayerObjectives({
		...state,
		players: updatedPlayers,
		currentPlayerIndex: nextIdx,
		market: {
			...state.market,
			resources: newRiver,
			musicians: newMusicians
		},
		decks: {
			...state.decks,
			resources: remainingResourcesDeck,
			musicians: remainingMusiciansDeck
		},
		turnActionState: { ...INITIAL_TURN_ACTION_STATE },
		log: [...state.log, `Vez de ${updatedPlayers[nextIdx].name}. Selecione um local no mapa para se mover antes de agir!`]
	}));
}
function checkPhaseTransition(state) {
	if (state.phase === "day") {
		if (!state.players.every((p) => p.hasFinishedDay || p.timeMarker < 1)) return state;
		const playersAtCasa = state.players.map((p) => p.chosenClub === null ? {
			...p,
			boardPosition: 0,
			hasFinishedDay: true
		} : p);
		const playersNeedingClub = playersAtCasa.filter((p) => p.chosenClub === null);
		if (playersNeedingClub.length > 0) {
			const firstNeedingIndex = playersAtCasa.findIndex((p) => p.id === playersNeedingClub[0].id);
			return {
				...state,
				phase: "club_selection",
				players: playersAtCasa,
				currentPlayerIndex: firstNeedingIndex,
				turnActionState: { ...INITIAL_TURN_ACTION_STATE },
				log: [
					...state.log,
					"─── Todos encerraram as ações na cidade! ───",
					`Fase de Escolha de Clubes: ${playersNeedingClub[0].name} escolhe em qual clube tocar esta noite.`
				]
			};
		}
	}
	if (state.phase === "club_selection") {
		const playersNeedingClub = state.players.filter((p) => p.chosenClub === null);
		if (playersNeedingClub.length > 0) {
			const nextNeedingIndex = state.players.findIndex((p) => p.id === playersNeedingClub[0].id);
			return {
				...state,
				currentPlayerIndex: nextNeedingIndex,
				log: [...state.log, `Fase de Escolha de Clubes: vez de ${state.players[nextNeedingIndex].name} escolher um clube.`]
			};
		}
	}
	const playersWithClub = state.players.filter((p) => p.chosenClub !== null);
	if (playersWithClub.length === 0) return startNewRound({
		...state,
		phase: "night",
		log: [...state.log, "─── Fase da Noite: Nenhum show agendado nesta rodada. ───"]
	});
	const firstShowPlayerIndex = state.players.findIndex((p) => p.id === playersWithClub[0].id);
	return {
		...state,
		phase: "night",
		currentPlayerIndex: firstShowPlayerIndex,
		nightPresentationPlayerIndex: 0,
		turnActionState: { ...INITIAL_TURN_ACTION_STATE },
		log: [
			...state.log,
			"─── FASE DA NOITE: Apresentações nos Clubes! ───",
			`Primeiro show: ${playersWithClub[0].name} no clube ${CLUBS.find((c) => c.id === playersWithClub[0].chosenClub)?.name}.`
		]
	};
}
function startNewRound(state) {
	const prevRound = state.round;
	const newRound = state.round + 1;
	if (newRound > state.maxRounds) return endGame(state);
	const eventId = state.eventsByRound[newRound];
	const currentEvent = eventId ? ALL_EVENTS.find((e) => e.id === eventId) ?? null : null;
	const isInvertArrowsEvent = currentEvent?.effectType === "invert_arrow_direction";
	const startPosition = isInvertArrowsEvent ? 6 : 0;
	const inspirationGainLogs = [];
	const updatedPlayers = state.players.map((p) => {
		const hasRoadie = p.hasRoadie || p.resources.some((r) => r.id === "recurso_04" || r.effectType === "die_starts_at_6");
		const hasColecao = p.resources.some((r) => r.id === "recurso_02" || r.effectType === "inspiration_each_round");
		const hasSalaEnsaio = p.maxMusicians >= 4 || p.resources.some((r) => r.id === "recurso_09" || r.effectType === "musician_hand_size_4");
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
			maxMusicians: hasSalaEnsaio ? 4 : p.maxMusicians || 3,
			hasFinishedDay: false,
			chosenClub: null,
			hasUsedBicicletaThisRound: false
		};
	});
	const startPositionText = isInvertArrowsEvent ? "Evento Vias Interditadas: Todos os jogadores iniciam no Parque (6) com as setas invertidas!" : "Todos os jogadores retornam à Casa com seus dados reiniciados (5 tempos).";
	const startingPlayerIndex = (newRound - 1) % state.players.length;
	let updatedConservatorioCubes = [...state.conservatorioCubes];
	let updatedMainBag = { ...state.mainBag };
	let conservatorioCleanupText = "";
	if (updatedConservatorioCubes.length === 2 && updatedConservatorioCubes[0] === updatedConservatorioCubes[1]) {
		updatedConservatorioCubes.forEach((c) => {
			if (c in updatedMainBag) updatedMainBag[c]++;
		});
		const newConsCubes = [];
		for (let k = 0; k < 2; k++) {
			const mainBagColors = [];
			Object.entries(updatedMainBag).forEach(([c, count]) => {
				if (c !== "white") for (let i = 0; i < count; i++) mainBagColors.push(c);
			});
			const drawn = drawRandom(mainBagColors);
			if (drawn) {
				newConsCubes.push(drawn.item);
				if (drawn.item in updatedMainBag) updatedMainBag[drawn.item]--;
			}
		}
		updatedConservatorioCubes = newConsCubes;
		conservatorioCleanupText = "Limpeza: Os 2 cubos iguais do Conservatório foram devolvidos ao saco e 2 novos foram repostos.";
	}
	let discardedMusicians = [...state.decks.discardedMusicians || []];
	let currentDeckMusicians = [...state.decks.musicians];
	const remainingMarketMusicians = [];
	if (state.market.musicians[0]) remainingMarketMusicians.push(state.market.musicians[0]);
	if (state.market.musicians[1]) remainingMarketMusicians.push(state.market.musicians[1]);
	if (state.market.musicians[2]) discardedMusicians.push(state.market.musicians[2]);
	if (state.market.musicians[3]) discardedMusicians.push(state.market.musicians[3]);
	const newMarketMusicians = [...remainingMarketMusicians];
	while (newMarketMusicians.length < 4 && currentDeckMusicians.length > 0) {
		newMarketMusicians.push(currentDeckMusicians[0]);
		currentDeckMusicians = currentDeckMusicians.slice(1);
	}
	while (newMarketMusicians.length < 4) newMarketMusicians.push(null);
	let musiciansPurgeText = "";
	if (prevRound === 2) {
		const purged = currentDeckMusicians.filter((m) => m.level === 1);
		currentDeckMusicians = currentDeckMusicians.filter((m) => m.level !== 1);
		discardedMusicians.push(...purged);
		if (purged.length > 0) musiciansPurgeText = `Limpeza Rodada 2: ${purged.length} músicos de Nível 1 foram descartados do baralho.`;
	} else if (prevRound === 4) {
		const purged = currentDeckMusicians.filter((m) => m.level === 2);
		currentDeckMusicians = currentDeckMusicians.filter((m) => m.level !== 2);
		discardedMusicians.push(...purged);
		if (purged.length > 0) musiciansPurgeText = `Limpeza Rodada 4: ${purged.length} músicos de Nível 2 foram descartados do baralho.`;
	}
	let discardedResources = [...state.decks.discardedResources || []];
	let currentDeckResources = [...state.decks.resources];
	state.market.resources.forEach((r) => {
		if (r) discardedResources.push(r);
	});
	const newMarketResources = [];
	for (let i = 0; i < 4; i++) {
		if (currentDeckResources.length === 0 && discardedResources.length > 0) {
			currentDeckResources = shuffle([...discardedResources]);
			discardedResources = [];
		}
		if (currentDeckResources.length > 0) {
			newMarketResources.push(currentDeckResources[0]);
			currentDeckResources = currentDeckResources.slice(1);
		} else newMarketResources.push(null);
	}
	return {
		...state,
		round: newRound,
		phase: "day",
		currentPlayerIndex: startingPlayerIndex,
		players: updatedPlayers,
		market: {
			...state.market,
			musicians: newMarketMusicians,
			resources: newMarketResources
		},
		decks: {
			...state.decks,
			musicians: currentDeckMusicians,
			discardedMusicians,
			resources: currentDeckResources,
			discardedResources
		},
		conservatorioCubes: updatedConservatorioCubes,
		mainBag: updatedMainBag,
		currentEvent,
		turnActionState: { ...INITIAL_TURN_ACTION_STATE },
		nightPresentationPlayerIndex: 0,
		log: [
			...state.log,
			`─── Fim da Rodada ${prevRound} • Limpeza do Tabuleiro ───`,
			...conservatorioCleanupText ? [conservatorioCleanupText] : [],
			"Mercado de Músicos: 2 cartas descartadas à direita, cartas deslizadas e 2 novas repostas.",
			...musiciansPurgeText ? [musiciansPurgeText] : [],
			"Lojas: Todos os 4 recursos foram descartados e 4 novos recursos foram repostos.",
			`─── Rodada ${newRound}: Fase de Dia ───`,
			startPositionText,
			...inspirationGainLogs,
			`Primeiro jogador da Rodada ${newRound}: ${updatedPlayers[startingPlayerIndex].name}.`,
			...currentEvent ? [`Evento da Rodada: ${currentEvent.name} — ${currentEvent.description}`] : [],
			`Vez de ${updatedPlayers[startingPlayerIndex].name}. Selecione um local no mapa para se mover antes de agir!`
		]
	};
}
function calculateDiscRanking(players) {
	const DISC_POS_POINTS = [
		5,
		3,
		1,
		0,
		0
	];
	const list = players.map((p) => ({
		id: p.id,
		discs: p.totalDiscsRecorded ?? p.discs.length
	}));
	list.sort((a, b) => b.discs - a.discs);
	const result = {};
	let i = 0;
	while (i < list.length) {
		const currentDiscs = list[i].discs;
		let j = i;
		while (j < list.length && list[j].discs === currentDiscs) j++;
		const tieCount = j - i;
		let sumPts = 0;
		for (let k = i; k < j; k++) sumPts += DISC_POS_POINTS[k] ?? 0;
		const ptsEach = Math.floor(sumPts / tieCount);
		const startRank = i + 1;
		const rankLabel = tieCount > 1 ? `${startRank}º-${j}º lugar (${tieCount} empatados)` : `${startRank}º lugar`;
		for (let k = i; k < j; k++) result[list[k].id] = {
			points: ptsEach,
			rankText: `${rankLabel} (${currentDiscs} discos gravados) ➔ +${ptsEach} VP`
		};
		i = j;
	}
	return result;
}
function calculateFinalScores(state) {
	const discRankings = calculateDiscRanking(state.players);
	const breakdowns = state.players.map((player) => {
		let resourcesVP = 0;
		let instrumentBonusVP = 0;
		const resourcesList = [];
		const instrumentsList = [];
		player.resources.forEach((resource) => {
			const isInstrument = resource.cardType === "instrument";
			if (resource.victoryPoints > 0) {
				resourcesVP += resource.victoryPoints;
				if (isInstrument) instrumentsList.push({
					name: resource.name,
					vp: resource.victoryPoints,
					description: `+${resource.victoryPoints} VP impresso no instrumento`
				});
				else resourcesList.push({
					name: resource.name,
					vp: resource.victoryPoints,
					description: `+${resource.victoryPoints} VP impresso no recurso`
				});
			}
			if (resource.timing === "end_game") {
				let cardBonus = 0;
				let bonusDesc = "";
				switch (resource.effectType) {
					case "victory_points_only": break;
					case "points_per_gig_achievement": {
						let claimedClubRewardsCount = 0;
						Object.values(state.clubRewards).forEach((rewardsArray) => {
							rewardsArray.forEach((r) => {
								if (r.claimedByPlayerId === player.id) claimedClubRewardsCount++;
							});
						});
						cardBonus = claimedClubRewardsCount;
						bonusDesc = `${claimedClubRewardsCount} prêmio(s) de apresentação de clube conquistado(s) ➔ +${cardBonus} VP`;
						break;
					}
					case "points_per_musician_level": {
						let pts = 0;
						player.musicians.forEach((m) => {
							pts += m.level || 1;
						});
						cardBonus = pts;
						bonusDesc = `Níveis dos músicos (${player.musicians.map((m) => `Nv${m.level}`).join(", ")}) ➔ +${pts} VP`;
						break;
					}
					case "points_equal_skill_level":
						cardBonus = player.skill;
						bonusDesc = `Habilidade Nível ${player.skill} ➔ +${player.skill} VP`;
						break;
					case "points_based_on_white_cubes": {
						const whiteCount = player.bag.filter((c) => c === "white").length;
						if (whiteCount === 0) cardBonus = 6;
						else if (whiteCount === 1) cardBonus = 4;
						else if (whiteCount === 2) cardBonus = 2;
						else cardBonus = 0;
						bonusDesc = `${whiteCount} cubo(s) branco(s) no saco (${whiteCount === 0 ? "0=6pts" : whiteCount === 1 ? "1=4pts" : whiteCount === 2 ? "2=2pts" : "3=0pts"}) ➔ +${cardBonus} VP`;
						break;
					}
					case "points_per_resource":
						cardBonus = player.resources.length * (resource.effectValue ?? 1);
						bonusDesc = `${player.resources.length} carta(s) de recurso no total ➔ +${cardBonus} VP`;
						break;
					case "points_per_chosen_color_cube": {
						const colorCounts = {};
						player.bag.forEach((c) => {
							if (c !== "white") colorCounts[c] = (colorCounts[c] || 0) + 1;
						});
						const maxCount = Object.keys(colorCounts).length > 0 ? Math.max(...Object.values(colorCounts)) : 0;
						cardBonus = maxCount * (resource.effectValue ?? 1);
						const topColors = Object.entries(colorCounts).filter(([, count]) => count === maxCount).map(([col]) => col);
						bonusDesc = maxCount > 0 ? `Maior grupo não-branco (${maxCount} cubos [${topColors.join("/")}]) ➔ +${cardBonus} VP` : "Nenhum cubo não-branco no saco ➔ 0 VP";
						break;
					}
					case "points_per_disc": {
						const totalD = player.totalDiscsRecorded ?? player.discs.length;
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
						description: bonusDesc
					});
				}
			}
		});
		const discInfo = discRankings[player.id] || {
			points: 0,
			rankText: "0 discos ➔ 0 VP"
		};
		const discsVP = discInfo.points;
		const totalDiscs = player.totalDiscsRecorded ?? player.discs.length;
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
				instrumentsList
			}
		};
	});
	breakdowns.sort((a, b) => b.totalScore - a.totalScore || b.coins - a.coins);
	breakdowns.forEach((b, idx) => {
		b.rank = idx + 1;
	});
	return breakdowns;
}
function endGame(state) {
	const scores = calculateFinalScores(state);
	const updatedPlayers = state.players.map((p) => {
		const sc = scores.find((s) => s.playerId === p.id);
		return {
			...p,
			score: sc ? sc.totalScore : p.score
		};
	});
	const winner = scores[0];
	return {
		...state,
		phase: "end",
		players: updatedPlayers,
		isGameOver: true,
		winner: winner?.playerId || state.players[0].id,
		log: [
			...state.log,
			"─── FIM DE JOGO: PONTUAÇÃO FINAL ───",
			...scores.map((s) => `${s.rank}º: ${s.playerName} - ${s.totalScore} pts (Partida: ${s.gameScore}, Recursos/Inst: ${s.resourcesVP + s.instrumentBonusVP}, Discos: ${s.discsVP}, Renome: ${s.renownVP}, Moedas: ${s.coinsVP}, Insp: ${s.inspirationVP})`),
			`🏆 Vencedor: ${winner?.playerName}!`
		]
	};
}
function applySponsorshipChoice(state, playerIndex, choice) {
	const player = state.players[playerIndex];
	if (!player) return state;
	let updatedPlayer = { ...player };
	let logText = "";
	let updatedMainBag = { ...state.mainBag };
	let pendingSponsorshipCubeChoice = null;
	if (choice === "coins") {
		updatedPlayer.coins += 5;
		logText = `${player.name} escolheu Ganhar 5 Moedas no Evento Patrocínio!`;
	} else if (choice === "renown") {
		updatedPlayer.renown = Math.min(10, player.renown + 1);
		logText = `${player.name} escolheu Ganhar +1 Renome (${updatedPlayer.renown}/10) no Evento Patrocínio!`;
	} else if (choice === "skill") {
		const oldSkill = SKILL_STEPS_VALUES[player.skillStepIndex ?? 0];
		const nextStepIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (player.skillStepIndex ?? 0) + 1);
		const newSkill = SKILL_STEPS_VALUES[nextStepIndex];
		if (newSkill > oldSkill) pendingSponsorshipCubeChoice = {
			playerId: player.id,
			playerIndex,
			reason: "skill_level_up",
			title: "Patrocínio: Aumento de Habilidade!",
			description: `Você avançou para Habilidade Nível ${newSkill}! Ganhe 1 cubo musical para o seu saco.`,
			newSkillLevel: newSkill
		};
		updatedPlayer = {
			...updatedPlayer,
			skillStepIndex: nextStepIndex,
			skill: newSkill
		};
		logText = `${player.name} escolheu Ganhar 1 Habilidade (Passo ${SKILL_STEPS_LABELS[nextStepIndex]}, Nível ${newSkill}) no Evento Patrocínio!`;
	}
	const updatedPlayers = state.players.map((p, i) => i === playerIndex ? updatedPlayer : p);
	return {
		...state,
		players: updatedPlayers,
		mainBag: updatedMainBag,
		pendingCubeChoice: pendingSponsorshipCubeChoice || state.pendingCubeChoice || null,
		log: [...state.log, logText]
	};
}
/**
* Resolve a escolha de cubo do Saco Principal do jogador (CubeSelectionModal).
*/
function resolvePendingCubeChoice(state, choice) {
	const pending = state.pendingCubeChoice;
	if (!pending) return {
		newState: state,
		success: false,
		message: "Nenhuma escolha de cubo pendente."
	};
	const player = state.players[pending.playerIndex] || state.players[state.currentPlayerIndex];
	const hasTocaDiscos = player.resources.some((r) => r.id === "recurso_07" || r.effectType === "choose_cube_on_skill_up");
	let updatedPlayer = { ...player };
	let updatedMainBag = { ...state.mainBag };
	let logText = "";
	if (hasTocaDiscos && choice.chosenColor && (updatedMainBag[choice.chosenColor] || 0) > 0) {
		const c = choice.chosenColor;
		updatedMainBag[c]--;
		updatedPlayer.bag = [...updatedPlayer.bag, c];
		logText = `${player.name} usou o Toca-Discos e escolheu 1 cubo ${c} do Saco Principal!`;
	} else if (choice.spendInspiration && choice.chosenColor && player.inspiration >= 1 && (updatedMainBag[choice.chosenColor] || 0) > 0) {
		const c = choice.chosenColor;
		updatedMainBag[c]--;
		updatedPlayer.inspiration = Math.max(0, updatedPlayer.inspiration - 1);
		updatedPlayer.bag = [...updatedPlayer.bag, c];
		logText = `${player.name} gastou 1 Inspiração e escolheu 1 cubo ${c} do Saco Principal!`;
	} else {
		const mainBagColors = [];
		Object.entries(updatedMainBag).forEach(([c, count]) => {
			if (c !== "white") for (let i = 0; i < count; i++) mainBagColors.push(c);
		});
		const drawn = drawRandom(mainBagColors);
		if (drawn) {
			if (drawn.item in updatedMainBag) updatedMainBag[drawn.item]--;
			updatedPlayer.bag = [...updatedPlayer.bag, drawn.item];
			logText = `${player.name} sorteou 1 cubo ${drawn.item} do Saco Principal!`;
		}
	}
	const updatedPlayers = state.players.map((p, i) => i === pending.playerIndex ? updatedPlayer : p);
	return {
		newState: checkPlayerObjectives({
			...state,
			players: updatedPlayers,
			mainBag: updatedMainBag,
			pendingCubeChoice: null,
			log: [...state.log, logText]
		}),
		success: true,
		message: logText
	};
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
function checkPlayerObjectives(state) {
	let updatedPlayers = [...state.players];
	let updatedDecks = { ...state.decks };
	let logEntries = [];
	const existingQueue = state.pendingStyleChoicesQueue ? [...state.pendingStyleChoicesQueue] : state.pendingStyleChoice ? [state.pendingStyleChoice] : [];
	updatedPlayers = updatedPlayers.map((player, pIdx) => {
		if (!player.objective) return player;
		const completedGoals = player.objective.completedGoals ? [...player.objective.completedGoals] : [
			false,
			false,
			false
		];
		while (completedGoals.length < 3) completedGoals.push(false);
		let completedCount = completedGoals.filter(Boolean).length;
		let newScore = player.score;
		let modified = false;
		player.objective.goals.forEach((goal, gIdx) => {
			if (completedGoals[gIdx]) return;
			let isCompleted = false;
			switch (goal.type) {
				case "musicians":
				case "band_size":
					isCompleted = player.musicians.length >= goal.value;
					break;
				case "score":
				case "points":
					isCompleted = player.score >= goal.value;
					break;
				case "renown":
					isCompleted = player.renown >= goal.value;
					break;
				case "coins":
					isCompleted = player.coins >= goal.value;
					break;
				case "resources":
					isCompleted = player.resources.length >= goal.value;
					break;
				case "discs":
					isCompleted = (player.totalDiscsRecorded ?? player.discs.length) >= goal.value || player.discs.length >= goal.value;
					break;
				case "cubes_same_color": {
					const colorCounts = {};
					player.bag.forEach((c) => {
						if (c !== "white") colorCounts[c] = (colorCounts[c] || 0) + 1;
					});
					isCompleted = Object.values(colorCounts).some((cnt) => cnt >= goal.value);
					break;
				}
				case "skill":
					isCompleted = player.skill >= goal.value;
					break;
				case "eliminated_white_cubes": {
					const whiteRemaining = player.bag.filter((c) => c === "white").length;
					isCompleted = Math.max(0, 3 - whiteRemaining) >= goal.value;
					break;
				}
				case "gigs":
					isCompleted = player.gigs.length >= goal.value;
					break;
				case "musicians_level2plus":
					isCompleted = player.musicians.filter((m) => m.level >= 2).length >= goal.value;
					break;
				case "all_levels":
					isCompleted = player.musicians.some((m) => m.level === 1) && player.musicians.some((m) => m.level === 2) && player.musicians.some((m) => m.level === 3);
					break;
				case "colored_cubes":
					isCompleted = player.bag.filter((c) => c !== "white").length >= goal.value;
					break;
				case "gig_achievements":
					isCompleted = player.gigs.filter((g) => g.success).length >= goal.value;
					break;
				case "disc_level":
					isCompleted = player.discs.some((d) => d.level >= goal.value);
					break;
				case "styles": isCompleted = player.styles.length >= goal.value;
			}
			if (isCompleted) {
				completedGoals[gIdx] = true;
				completedCount++;
				modified = true;
				const rewardVP = gIdx === 0 ? 2 : gIdx === 1 ? 3 : 5;
				newScore += rewardVP;
				const triggersStyle = completedCount === 1 || completedCount === 3;
				if (triggersStyle) {
					let styleDeck = [...updatedDecks.styles];
					const drawn = styleDeck.slice(0, 3);
					styleDeck = styleDeck.slice(3);
					updatedDecks = {
						...updatedDecks,
						styles: styleDeck
					};
					const newChoice = {
						playerId: player.id,
						playerIndex: pIdx,
						goalIndex: gIdx,
						objectiveName: player.objective?.name || "Objetivo",
						rewardVP,
						drawnStyles: drawn
					};
					existingQueue.push(newChoice);
				}
				logEntries.push(`🎯 ${player.name} cumpriu a meta ("${goal.description}") da carta ${player.objective?.name}! Ganhou +${rewardVP} Pontos de Vitória${triggersStyle ? " e 3 cartas de estilo para escolher 1 (Recompensa de Estilo)" : ""}.`);
			}
		});
		if (modified) return {
			...player,
			score: newScore,
			objective: {
				...player.objective,
				completedGoals
			}
		};
		return player;
	});
	return {
		...state,
		players: updatedPlayers,
		decks: updatedDecks,
		pendingStyleChoicesQueue: existingQueue,
		pendingStyleChoice: existingQueue[0] || null,
		log: logEntries.length > 0 ? [...state.log, ...logEntries] : state.log
	};
}
/**
* Resolve a escolha de carta de estilo do jogador ao cumprir um objetivo.
*/
function resolvePendingStyleChoice(state, chosenStyleId) {
	const queue = state.pendingStyleChoicesQueue ? [...state.pendingStyleChoicesQueue] : state.pendingStyleChoice ? [state.pendingStyleChoice] : [];
	if (queue.length === 0) return {
		newState: state,
		success: false,
		message: "Nenhuma escolha de estilo pendente."
	};
	const currentPending = queue[0];
	const player = state.players[currentPending.playerIndex];
	if (!player) return {
		newState: state,
		success: false,
		message: "Jogador não encontrado."
	};
	const chosenStyle = currentPending.drawnStyles.find((s) => s.id === chosenStyleId) || currentPending.drawnStyles[0];
	if (!chosenStyle) return {
		newState: state,
		success: false,
		message: "Estilo não encontrado."
	};
	const shuffledRemaining = shuffle(currentPending.drawnStyles.filter((s) => s.id !== chosenStyle.id));
	const updatedStyleDeck = [...state.decks.styles, ...shuffledRemaining];
	const updatedPlayers = state.players.map((p, i) => i === currentPending.playerIndex ? {
		...p,
		styles: [...p.styles, chosenStyle]
	} : p);
	const updatedQueue = queue.slice(1);
	const logMsg = `✨ ${player.name} escolheu a carta de estilo ${chosenStyle.name}!`;
	let newState = {
		...state,
		players: updatedPlayers,
		decks: {
			...state.decks,
			styles: updatedStyleDeck
		},
		pendingStyleChoicesQueue: updatedQueue,
		pendingStyleChoice: updatedQueue[0] || null,
		log: [...state.log, logMsg]
	};
	newState = checkPlayerObjectives(newState);
	return {
		newState,
		success: true,
		message: logMsg
	};
}
function getBotAction(state) {
	const player = state.players[state.currentPlayerIndex];
	if (state.turnActionState.hasActedThisTurn || player.hasFinishedDay) return { action: "pass" };
	if (player.boardPosition === 0 || player.timeMarker >= 2) return { action: "park" };
	return { action: "pass" };
}
var GameEngine = {
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
	drawFromBag
};
//#endregion
//#region src/engine/botAI.ts
/**
* Encontra o melhor slot para alocar um cubo colorido na banda do bot.
*/
function findBestSlotForCube(musicians, cube, musicianDirections = {}, canUseWhiteAsWild = false) {
	if (cube === "white" && !canUseWhiteAsWild) return null;
	let bestSlot = null;
	let maxScore = -1;
	for (const m of musicians) {
		const filled = m.filledNotes || [];
		const dir = musicianDirections[m.id] || "ltr";
		let candidateIndex = -1;
		if (dir === "ltr") {
			for (let i = 0; i < m.notes.length; i++) if (!filled[i]) {
				candidateIndex = i;
				break;
			}
		} else for (let i = m.notes.length - 1; i >= 0; i--) if (!filled[i]) {
			candidateIndex = i;
			break;
		}
		if (candidateIndex !== -1 && candidateIndex < m.notes.length) {
			const targetNote = m.notes[candidateIndex];
			if (targetNote.color === "wild" || targetNote.color === cube || cube === "white" && canUseWhiteAsWild) {
				const points = targetNote.points;
				if (points > maxScore) {
					maxScore = points;
					bestSlot = {
						musicianId: m.id,
						noteIndex: candidateIndex,
						scoreGained: points
					};
				}
			}
		}
	}
	return bestSlot;
}
function simulateGig(player, club, iterations = 80) {
	const hasSensei = player.resources.some((r) => r.id === "recurso_08" || r.effectType === "extra_draw_in_gig");
	const hasReduceThreshold = player.styles.some((s) => s.id === "estilo_06" || s.effectType === "reduce_success_threshold");
	const hasWhiteAsWild = player.styles.some((s) => s.id === "estilo_03" || s.effectType === "white_as_wild");
	const effectiveThreshold = hasReduceThreshold ? Math.max(1, club.successThreshold - 1) : club.successThreshold;
	const spendInsp = player.inspiration >= 1 && player.skill < 4;
	const drawCount = player.skill + (hasSensei ? 1 : 0) + (spendInsp ? 1 : 0);
	let successCount = 0;
	let totalPointsAccum = 0;
	for (let it = 0; it < iterations; it++) {
		const drawnCubes = [...player.bag].sort(() => Math.random() - .5).slice(0, drawCount);
		const mockMusicians = player.musicians.map((m) => ({
			...m,
			filledNotes: []
		}));
		let gigPoints = 0;
		let whiteWildUsedInSim = false;
		for (const cube of drawnCubes) {
			const canUseWhite = hasWhiteAsWild && !whiteWildUsedInSim;
			if (cube === "white" && !canUseWhite) continue;
			const best = findBestSlotForCube(mockMusicians, cube, {}, canUseWhite);
			if (best) {
				if (cube === "white") whiteWildUsedInSim = true;
				const targetM = mockMusicians.find((m) => m.id === best.musicianId);
				if (targetM) {
					if (!targetM.filledNotes) targetM.filledNotes = [];
					targetM.filledNotes[best.noteIndex] = cube;
					gigPoints += best.scoreGained;
				}
			}
		}
		if (gigPoints >= effectiveThreshold) successCount++;
		totalPointsAccum += gigPoints;
	}
	const audience = player.renown * 10 + (player.hasPublicityToken ? 30 : 0);
	const actualAudience = Math.min(club.maxCapacity, audience);
	const coins = actualAudience / 10;
	return {
		averagePoints: totalPointsAccum / iterations,
		successProbability: successCount / iterations,
		expectedAudience: actualAudience,
		expectedCoins: coins
	};
}
function botChooseBestClub(state, botIndex) {
	const bot = state.players[botIndex];
	if (!bot) return "mosca_frita";
	const eligibleClubs = CLUBS.filter((club) => {
		if (bot.renown < club.minRenown) return false;
		if (!club.isUnlimited) {
			const maxCap = state.players.length === 2 ? 1 : 2;
			if (state.players.filter((p) => p.id !== bot.id && p.chosenClub === club.id).length >= maxCap) return false;
		}
		return true;
	});
	if (eligibleClubs.length === 0) return "mosca_frita";
	let bestClubId = eligibleClubs[0].id;
	let bestExpectedValue = -999;
	for (const club of eligibleClubs) {
		const sim = simulateGig(bot, club, 80);
		const rewardValue = (state.clubRewards[club.id] || []).filter((r) => !r.claimedByPlayerId).length > 0 ? 3.5 : 1;
		const expectedValue = sim.successProbability * (club.successThreshold + rewardValue) + sim.expectedCoins * .4 + (sim.averagePoints >= club.successThreshold ? 2 : -1);
		if (expectedValue > bestExpectedValue) {
			bestExpectedValue = expectedValue;
			bestClubId = club.id;
		}
	}
	return bestClubId;
}
function evaluateObjectiveSynergy(bot, actionType) {
	if (!bot.objective || !bot.objective.goals) return 0;
	const completed = bot.objective.completedGoals || [
		false,
		false,
		false
	];
	let bonus = 0;
	bot.objective.goals.forEach((goal, gIdx) => {
		if (completed[gIdx]) return;
		const goalWeight = gIdx === 2 ? 3.5 : gIdx === 1 ? 2.5 : 1.8;
		switch (goal.type) {
			case "renown":
				if (actionType === "radio" || actionType === "parque") {
					const needed = Math.max(1, goal.value - bot.renown);
					bonus += goalWeight * (1 / needed);
				}
				break;
			case "discs": {
				const currentDiscs = bot.totalDiscsRecorded ?? bot.discs.length;
				const needed = Math.max(1, goal.value - currentDiscs);
				if (actionType === "record_disc") bonus += goalWeight * (1.5 / needed);
				else if (actionType === "conservatorio_compose") bonus += goalWeight * (.8 / needed);
				break;
			}
			case "skill":
				if (actionType === "conservatorio_skill") {
					const needed = Math.max(1, goal.value - bot.skill);
					bonus += goalWeight * (1.2 / needed);
				}
				break;
			case "musicians":
			case "band_size":
			case "musicians_level2plus":
			case "all_levels":
				if (actionType === "ruas_hire") bonus += goalWeight * 1;
				break;
			case "resources":
				if (actionType === "lojas_buy_resource") {
					const needed = Math.max(1, goal.value - bot.resources.length);
					bonus += goalWeight * (1 / needed);
				}
				break;
			case "coins": if (actionType === "parque") {
				const needed = Math.max(1, goal.value - bot.coins);
				bonus += goalWeight * (1 / Math.max(1, needed / 3));
			}
		}
	});
	return bonus;
}
function projectInstrumentVP(bot, state, resource) {
	let vp = resource.victoryPoints || 0;
	switch (resource.effectType) {
		case "victory_points_only": break;
		case "points_per_gig_achievement": {
			let claimedCount = 0;
			Object.values(state.clubRewards).forEach((arr) => {
				arr.forEach((r) => {
					if (r.claimedByPlayerId === bot.id) claimedCount++;
				});
			});
			vp += claimedCount + 1;
			break;
		}
		case "points_per_musician_level": {
			let pts = 0;
			bot.musicians.forEach((m) => {
				pts += m.level || 1;
			});
			vp += pts;
			break;
		}
		case "points_equal_skill_level":
			vp += bot.skill;
			break;
		case "points_based_on_white_cubes": {
			const whiteCount = bot.bag.filter((c) => c === "white").length;
			vp += whiteCount === 0 ? 6 : whiteCount === 1 ? 4 : whiteCount === 2 ? 2 : 0;
			break;
		}
		case "points_per_resource":
			vp += (bot.resources.length + 1) * (resource.effectValue ?? 1);
			break;
		case "points_per_chosen_color_cube": {
			const colorCounts = {};
			bot.bag.forEach((c) => {
				if (c !== "white") colorCounts[c] = (colorCounts[c] || 0) + 1;
			});
			const maxCount = Object.keys(colorCounts).length > 0 ? Math.max(...Object.values(colorCounts)) : 0;
			vp += maxCount * (resource.effectValue ?? 1);
			break;
		}
		case "points_per_disc": {
			const totalD = (bot.totalDiscsRecorded ?? bot.discs.length) + (bot.compositions.length > 0 ? 1 : 0);
			vp += totalD * (resource.effectValue ?? 2);
			break;
		}
	}
	return vp;
}
function computeBotDayAction(state, botIndex) {
	const bot = state.players[botIndex];
	if (!bot || bot.hasFinishedDay || bot.timeMarker < 1 || state.turnActionState.hasActedThisTurn) return { actionType: "pass" };
	const isInvert = state.currentEvent?.effectType === "invert_arrow_direction";
	let bestDecision = { actionType: "pass" };
	let bestScoreRate = -999;
	if (bot.boardPosition !== 0 && bot.timeMarker <= 3) {
		const bestClubId = botChooseBestClub(state, botIndex);
		const targetClubDef = CLUBS.find((c) => c.id === bestClubId) || CLUBS[0];
		const isClubAlmostFull = state.players.filter((p) => p.chosenClub === bestClubId).length >= targetClubDef.maxCapacity - 1;
		let clubUtility = bot.inspiration < 3 ? 2.2 : .8;
		if (isClubAlmostFull && targetClubDef.maxCapacity <= 2) clubUtility += 1.2;
		const timeCostEquivalent = Math.max(1, bot.timeMarker);
		const clubRate = clubUtility / timeCostEquivalent;
		if (clubRate > bestScoreRate) {
			bestScoreRate = clubRate;
			bestDecision = {
				actionType: "go_to_club",
				actionDetails: {
					type: "club",
					clubId: bestClubId
				}
			};
		}
	}
	for (let loc = 1; loc <= 6; loc++) {
		const moveInfo = GameEngine.calculateMovement(bot, loc, state.players, isInvert, state.neutralDie);
		if (!moveInfo.isReachable) continue;
		const timeCost = Math.max(1, moveInfo.timeCost);
		const fee = moveInfo.visitingFee;
		if (loc === 1 && bot.coins >= fee) {
			const hasDiscs = bot.discs.length > 0;
			let gain = 0;
			if (moveInfo.isForward) gain = (hasDiscs ? 3 : 0) + 2;
			else gain = hasDiscs ? 2.5 : 1.5;
			gain += evaluateObjectiveSynergy(bot, "radio");
			const rate = gain / timeCost;
			if (rate > bestScoreRate) {
				bestScoreRate = rate;
				bestDecision = {
					actionType: "location_action",
					targetLocation: 1,
					actionDetails: {
						type: "radio",
						option: hasDiscs ? "play_disc" : "publicity",
						discId: bot.discs[0]?.id
					}
				};
			}
		}
		if (loc === 2 && bot.compositions.length > 0) {
			const comp = [...bot.compositions].sort((a, b) => b.level - a.level)[0];
			const totalGravadoraCost = (moveInfo.isForward ? 3 : 4) + fee;
			if (bot.coins >= totalGravadoraCost) {
				let discGain = comp.level * 2.5 + (moveInfo.isForward ? 1.5 : 0);
				discGain += evaluateObjectiveSynergy(bot, "record_disc");
				const rate = discGain / timeCost;
				if (rate > bestScoreRate) {
					bestScoreRate = rate;
					bestDecision = {
						actionType: "location_action",
						targetLocation: 2,
						actionDetails: {
							type: "record_disc",
							compositionId: comp.id
						}
					};
				}
			}
		}
		if (loc === 3 && bot.coins >= fee) {
			if (bot.skill < 5) {
				const rate = (3.2 + evaluateObjectiveSynergy(bot, "conservatorio_skill")) / timeCost;
				if (rate > bestScoreRate) {
					bestScoreRate = rate;
					bestDecision = {
						actionType: "location_action",
						targetLocation: 3,
						actionDetails: {
							type: "conservatorio_skill",
							cubeIndex: 0
						}
					};
				}
			} else {
				const rate = (2.8 + evaluateObjectiveSynergy(bot, "conservatorio_compose")) / timeCost;
				if (rate > bestScoreRate) {
					bestScoreRate = rate;
					bestDecision = {
						actionType: "location_action",
						targetLocation: 3,
						actionDetails: {
							type: "conservatorio_compose",
							spendInspiration: bot.inspiration >= 1,
							cubeIndex: 0
						}
					};
				}
			}
		}
		if (loc === 4) {
			const resources = state.market.resources;
			let bestSlot = -1;
			let maxResGain = -1;
			resources.forEach((r, slotIdx) => {
				if (!r) return;
				const slotDisc = slotIdx === 3 ? 1 : 0;
				const bonusDisc = moveInfo.isForward ? 1 : 0;
				let baseCost = r.cost;
				if (r.specialCost && state.round >= r.specialCost.fromRound) baseCost = r.specialCost.cost;
				if (r.playerCountCost) {
					const numPlayers = state.players.length;
					baseCost = r.playerCountCost[numPlayers] ?? r.cost;
				}
				const finalCost = Math.max(0, baseCost - slotDisc - bonusDisc);
				const totalLojasCost = finalCost + fee;
				if (bot.coins >= totalLojasCost) {
					let utility = (r.victoryPoints || 0) * 1.5;
					if (r.cardType === "instrument") utility = projectInstrumentVP(bot, state, r) * 2.2 + (bot.coins >= 8 || state.round >= 4 ? 2.5 : 0);
					if (r.effectType === "gain_skill") utility += 3.5;
					if (r.effectType === "gain_renown") utility += 2.5;
					utility += evaluateObjectiveSynergy(bot, "lojas_buy_resource");
					const net = utility - finalCost * .4;
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
						actionType: "location_action",
						targetLocation: 4,
						actionDetails: {
							type: "lojas_buy_resource",
							slotIndex: bestSlot
						}
					};
				}
			}
		}
		if (loc === 5) {
			const musicians = state.market.musicians;
			let bestMusicianSlot = -1;
			let maxMusicianGain = -1;
			musicians.forEach((m, slotIdx) => {
				if (!m) return;
				const totalMusicianCost = m.cost + fee;
				if (bot.coins >= totalMusicianCost) {
					let gain = m.level * 2 + (m.notes.length >= 3 ? 1.5 : 0) + (moveInfo.isForward ? 1.5 : 0);
					gain += evaluateObjectiveSynergy(bot, "ruas_hire");
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
						actionType: "location_action",
						targetLocation: 5,
						actionDetails: {
							type: "ruas_hire",
							slotIndex: bestMusicianSlot,
							replacedMusicianId: bot.musicians.length >= (bot.maxMusicians || 3) ? bot.musicians[0]?.id : void 0
						}
					};
				}
			}
		}
		if (loc === 6 && bot.boardPosition !== 6) {
			const otherPlayersInPark = state.players.filter((p) => p.id !== bot.id && p.boardPosition === 6);
			const hasNeutralDieAtPark = !!(state.neutralDie && state.neutralDie.position === 6);
			const alone = otherPlayersInPark.length === 0 && !hasNeutralDieAtPark;
			let coinsGained = bot.renown + (alone ? 2 : 0);
			coinsGained += evaluateObjectiveSynergy(bot, "parque");
			const rate = coinsGained * .5 / timeCost;
			if (rate > bestScoreRate) {
				bestScoreRate = rate;
				bestDecision = {
					actionType: "location_action",
					targetLocation: 6,
					actionDetails: { type: "parque" }
				};
			}
		}
	}
	if (bestDecision.actionType === "pass" && bot.boardPosition !== 0 && bot.timeMarker >= 1) return {
		actionType: "go_to_club",
		actionDetails: {
			type: "club",
			clubId: botChooseBestClub(state, botIndex)
		}
	};
	return bestDecision;
}
function executeAutomatedBotGig(state, botPlayerIndex) {
	const bot = state.players[botPlayerIndex];
	if (!bot || !bot.chosenClub) return state;
	const club = CLUBS.find((c) => c.id === bot.chosenClub);
	if (!club) return state;
	const hasSensei = bot.resources.some((r) => r.id === "recurso_08" || r.effectType === "extra_draw_in_gig");
	const hasReduceThreshold = bot.styles.some((s) => s.id === "estilo_06" || s.effectType === "reduce_success_threshold");
	const hasStyle01 = bot.styles.some((s) => s.id === "estilo_01" || s.effectType === "swap_cube_once");
	const hasStyle02 = bot.styles.some((s) => s.id === "estilo_02" || s.effectType === "reserve_cube_once");
	const hasStyle05 = bot.styles.some((s) => s.id === "estilo_05" || s.effectType === "inspire_extra_draw_anytime");
	const effectiveThreshold = hasReduceThreshold ? Math.max(1, club.successThreshold - 1) : club.successThreshold;
	let useExtraDrawInspiration = bot.inspiration >= 1 && bot.skill < 4 || hasStyle05 && bot.inspiration >= 1;
	const drawCount = bot.skill + (hasSensei ? 1 : 0) + (useExtraDrawInspiration && !hasStyle05 ? 1 : 0);
	let chosenMainBagCube = null;
	if (bot.styles.some((s) => s.id === "estilo_09" || s.effectType === "draw_from_main_bag")) {
		const needed = getNeededCubeColors(bot);
		for (const col of needed) if ((state.mainBag[col] || 0) > 0) {
			chosenMainBagCube = col;
			break;
		}
	}
	const shuffled = (chosenMainBagCube ? [...bot.bag, chosenMainBagCube] : [...bot.bag]).sort(() => Math.random() - .5);
	let drawn = shuffled.slice(0, drawCount);
	let remainingBag = shuffled.slice(drawCount);
	if (bot.styles.some((s) => s.id === "estilo_10" || s.effectType === "first_white_redraw")) {
		const firstWhiteIdx = drawn.indexOf("white");
		if (firstWhiteIdx !== -1 && remainingBag.length > 0) {
			const newCube = remainingBag[0];
			remainingBag = [...remainingBag.slice(1), "white"];
			drawn[firstWhiteIdx] = newCube;
		}
	}
	const assignments = {};
	const musicianDirections = {};
	const mutableMusicians = bot.musicians.map((m) => {
		assignments[m.id] = [];
		return {
			...m,
			filledNotes: []
		};
	});
	const hasWhiteAsWild = bot.styles.some((s) => s.id === "estilo_03" || s.effectType === "white_as_wild");
	const unplacedCubes = [];
	let simulatedPoints = 0;
	let whiteWildUsed = false;
	let style01Used = false;
	let reservedCube = null;
	for (let i = 0; i < drawn.length; i++) {
		let cube = drawn[i];
		const canUseWhite = hasWhiteAsWild && !whiteWildUsed;
		if (hasStyle01 && !style01Used && remainingBag.length > 0) {
			if (!(cube !== "white" && findBestSlotForCube(mutableMusicians, cube, musicianDirections, false) !== null) && (!canUseWhite || cube !== "white")) {
				const replacement = remainingBag[0];
				remainingBag = [...remainingBag.slice(1), cube];
				cube = replacement;
				drawn[i] = replacement;
				style01Used = true;
			}
		}
		if (cube === "white" && !canUseWhite) {
			unplacedCubes.push(cube);
			continue;
		}
		const best = findBestSlotForCube(mutableMusicians, cube, musicianDirections, canUseWhite);
		if (best) {
			if (cube === "white") whiteWildUsed = true;
			const targetM = mutableMusicians.find((m) => m.id === best.musicianId);
			if (targetM) {
				if (!targetM.filledNotes) targetM.filledNotes = [];
				targetM.filledNotes[best.noteIndex] = cube;
				if (!assignments[best.musicianId]) assignments[best.musicianId] = [];
				assignments[best.musicianId][best.noteIndex] = cube;
				simulatedPoints += best.scoreGained;
			}
		} else if (hasStyle02 && reservedCube === null && cube !== "white") reservedCube = cube;
		else unplacedCubes.push(cube);
	}
	if (reservedCube) {
		const bestRes = findBestSlotForCube(mutableMusicians, reservedCube, musicianDirections, false);
		if (bestRes) {
			const targetM = mutableMusicians.find((m) => m.id === bestRes.musicianId);
			if (targetM) {
				if (!targetM.filledNotes) targetM.filledNotes = [];
				targetM.filledNotes[bestRes.noteIndex] = reservedCube;
				if (!assignments[bestRes.musicianId]) assignments[bestRes.musicianId] = [];
				assignments[bestRes.musicianId][bestRes.noteIndex] = reservedCube;
				simulatedPoints += bestRes.scoreGained;
			}
		} else unplacedCubes.push(reservedCube);
	}
	if (hasStyle05 && simulatedPoints < effectiveThreshold && bot.inspiration >= 1 && remainingBag.length > 0) {
		useExtraDrawInspiration = true;
		const extraCube = remainingBag[0];
		remainingBag = remainingBag.slice(1);
		const bestExtra = findBestSlotForCube(mutableMusicians, extraCube, musicianDirections, hasWhiteAsWild && !whiteWildUsed);
		if (bestExtra) {
			if (extraCube === "white") whiteWildUsed = true;
			const targetM = mutableMusicians.find((m) => m.id === bestExtra.musicianId);
			if (targetM) {
				if (!targetM.filledNotes) targetM.filledNotes = [];
				targetM.filledNotes[bestExtra.noteIndex] = extraCube;
				if (!assignments[bestExtra.musicianId]) assignments[bestExtra.musicianId] = [];
				assignments[bestExtra.musicianId][bestExtra.noteIndex] = extraCube;
				simulatedPoints += bestExtra.scoreGained;
			}
		} else unplacedCubes.push(extraCube);
	}
	const eliminatedCube = unplacedCubes.includes("white") && bot.inspiration - (useExtraDrawInspiration ? 1 : 0) >= 1 ? "white" : null;
	let stateBeforeShow = state;
	if (simulatedPoints >= effectiveThreshold) {
		const clubRewards = state.clubRewards[bot.chosenClub] || [];
		const hasPremioCobicado = bot.styles.some((s) => s.effectType === "claim_taken_reward" || s.id === "estilo_11");
		const availableRewards = clubRewards.filter((r) => !r.claimedByPlayerId || hasPremioCobicado);
		if (availableRewards.length > 0) {
			const priority = [
				"style",
				"skill",
				"renown",
				"coins",
				"vp"
			];
			const sortedRewards = [...availableRewards].sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type));
			const chosenRewardId = sortedRewards[0].id;
			let disabledRewardId = void 0;
			if (sortedRewards[0].claimedByPlayerId && hasPremioCobicado) disabledRewardId = clubRewards.find((r) => !r.claimedByPlayerId && r.id !== chosenRewardId)?.id;
			stateBeforeShow = GameEngine.claimClubReward(state, bot.chosenClub, chosenRewardId, void 0, bot.id, disabledRewardId).newState;
		}
	}
	return GameEngine.performNightGig(stateBeforeShow, assignments, {
		extraDrawInspirationUsed: useExtraDrawInspiration,
		eliminatedCube,
		chosenMainBagCube
	}).newState;
}
function botChooseStartingMusician(state, botIndex) {
	const bot = state.players[botIndex];
	const available = state.availableStartingMusicians || [];
	if (available.length === 0) return ALL_MUSICIANS[0];
	if (available.length === 1) return available[0];
	let bestMusician = available[0];
	let bestScore = -999;
	available.forEach((m) => {
		let utility = m.notes.reduce((sum, n) => sum + n.points, 0) * 2.5;
		const consCubes = state.conservatorioCubes || [];
		const notesColors = m.notes.map((n) => n.color);
		consCubes.forEach((col) => {
			if (notesColors.includes(col)) utility += 2;
		});
		const wildCount = m.notes.filter((n) => n.color === "wild").length;
		utility += wildCount * 1.8;
		if (bot?.objective?.goals) bot.objective.goals.forEach((g) => {
			if (g.type === "cubes_same_color") {
				if (m.notes.length >= 2 && (m.notes[0].color === m.notes[1]?.color || wildCount > 0)) utility += 2.2;
			}
		});
		const tieBreaker = ((m.artistNumber || 1) * 7 + botIndex * 3) % 5 * .15;
		utility += tieBreaker;
		if (utility > bestScore) {
			bestScore = utility;
			bestMusician = m;
		}
	});
	return bestMusician;
}
/**
* Executa 1 passo atômico do Bot dependendo do estado atual do jogo.
* Retorna o novo estado com garantia estrita de nunca travar a partida.
*/
function processBotStep(state) {
	try {
		if (state.isInitialDraftActive && state.draftPlayerIndices && state.draftPlayerIndices.length > 0) {
			const currentIdx = state.draftPlayerIndices[0];
			if (state.players[currentIdx]?.isBot) {
				const chosenMusician = botChooseStartingMusician(state, currentIdx);
				return GameEngine.selectStartingMusician(state, chosenMusician.id);
			}
			return state;
		}
		if (state.pendingCubeChoice) {
			const pIdx = state.pendingCubeChoice.playerIndex;
			const player = state.players[pIdx];
			if (player?.isBot) {
				const needed = getNeededCubeColors(player);
				let chosenColor = "blue";
				for (const col of needed) if ((state.mainBag[col] || 0) > 0) {
					chosenColor = col;
					break;
				}
				return GameEngine.resolvePendingCubeChoice(state, { chosenColor }).newState;
			}
			return state;
		}
		if (state.pendingStyleChoice) {
			const pIdx = state.pendingStyleChoice.playerIndex;
			if (state.players[pIdx]?.isBot) {
				const chosenStyle = state.pendingStyleChoice.drawnStyles[0];
				return GameEngine.resolvePendingStyleChoice(state, chosenStyle?.id || "").newState;
			}
			return state;
		}
		if (state.pendingLuthierChoice) {
			const pIdx = state.pendingLuthierChoice.playerIndex;
			const player = state.players[pIdx];
			if (player?.isBot) {
				const affordable = state.pendingLuthierChoice.availableInstruments.filter((inst) => player.coins >= inst.cost);
				if (affordable.length > 0 && player.coins >= 8) return GameEngine.resolvePendingLuthierChoice(state, affordable[0].id).newState;
				return GameEngine.resolvePendingLuthierChoice(state, void 0).newState;
			}
			return state;
		}
		if (state.pendingBicicletaDecision) {
			const ownerIdx = state.pendingBicicletaDecision.ownerPlayerIndex;
			const owner = state.players[ownerIdx];
			if (owner?.isBot) {
				const waive = owner.timeMarker <= 3;
				return GameEngine.resolveBicicletaDecision(state, waive).newState;
			}
			return state;
		}
		if (state.phase === "club_selection") {
			const currentIdx = state.currentPlayerIndex;
			const player = state.players[currentIdx];
			if (player?.isBot && player.chosenClub === null) {
				const bestClub = botChooseBestClub(state, currentIdx);
				return GameEngine.goToClub(state, bestClub).newState;
			}
			return state;
		}
		if (state.phase === "night") {
			const showPlayerIdx = state.currentPlayerIndex;
			const player = state.players[showPlayerIdx];
			if (player?.isBot && player.chosenClub) return executeAutomatedBotGig(state, showPlayerIdx);
			return state;
		}
		if (state.phase === "day") {
			const currentIdx = state.currentPlayerIndex;
			const player = state.players[currentIdx];
			if (player?.isBot) {
				if (player.hasFinishedDay || player.timeMarker < 1 || state.turnActionState.hasActedThisTurn) return GameEngine.passTurn(state);
				const decision = computeBotDayAction(state, currentIdx);
				if (decision.actionType === "go_to_club" && decision.actionDetails?.clubId) return GameEngine.goToClub(state, decision.actionDetails.clubId).newState;
				if (decision.actionType === "location_action" && decision.targetLocation && decision.actionDetails) {
					const loc = decision.targetLocation;
					const details = decision.actionDetails;
					let movedState = GameEngine.selectTargetLocation(state, loc);
					let result = null;
					switch (details.type) {
						case "radio":
							result = GameEngine.performRadioAction(movedState, details.discId, details.option);
							break;
						case "record_disc":
							result = GameEngine.performGravadoraRecordDisc(movedState, details.compositionId);
							break;
						case "conservatorio_skill":
							result = GameEngine.performConservatorioGainSkill(movedState, { chosenConservatorioCubeIndex: details.cubeIndex });
							break;
						case "conservatorio_compose":
							result = GameEngine.performConservatorioCompose(movedState, details.spendInspiration, details.cubeIndex);
							break;
						case "lojas_buy_resource": {
							const buyRes = GameEngine.performLojasBuyResource(movedState, details.slotIndex);
							if (buyRes.success) return GameEngine.performLojasFinishShopping(buyRes.newState);
							result = buyRes;
							break;
						}
						case "ruas_hire":
							result = GameEngine.performRuasHireMusician(movedState, details.slotIndex, details.replacedMusicianId);
							break;
						case "parque": result = GameEngine.performParqueAction(movedState);
					}
					if (result) {
						if (result.success) return result.newState;
						else {
							console.error(`[BOT ACTION ERROR] ${player.name} falhou ao tentar executar "${details.type}" no local ${loc}: ${result.message}`, {
								details,
								player
							});
							return {
								...state,
								log: [...state.log, `⚠️ [ERRO DO BOT] ${player.name} tentou ${details.type} no local ${loc}, mas a ação falhou: "${result.message}".`]
							};
						}
					}
				}
				if (!state.turnActionState.hasActedThisTurn && !player.hasFinishedDay && player.timeMarker >= 1) {
					console.error(`[BOT DECISION ERROR] ${player.name} tem tempo (${player.timeMarker}) mas não tomou uma ação válida!`, {
						decision,
						player
					});
					return {
						...state,
						log: [...state.log, `⚠️ [ERRO DO BOT] ${player.name} possui ${player.timeMarker} de tempo mas nenhuma ação válida foi selecionada!`]
					};
				}
				if (state.turnActionState.hasActedThisTurn || player.hasFinishedDay) return GameEngine.passTurn(state);
			}
		}
		return state;
	} catch (err) {
		console.error("Erro na execução do Bot:", err);
		return state;
	}
}
function getNeededCubeColors(player) {
	const needed = {};
	player.musicians.forEach((m) => {
		const filled = m.filledNotes || [];
		m.notes.forEach((n, idx) => {
			if (!filled[idx] && n.color !== "wild") needed[n.color] = (needed[n.color] || 0) + 1;
		});
	});
	const sorted = Object.entries(needed).sort((a, b) => b[1] - a[1]).map(([col]) => col);
	return sorted.length > 0 ? sorted : [
		"blue",
		"red",
		"yellow",
		"purple"
	];
}
//#endregion
//#region scripts/simulate_bot_matches.ts
function runSingleMatch(matchId, numPlayers) {
	const colors = [
		"orange",
		"pink",
		"green",
		"brown"
	].slice(0, numPlayers);
	const playerNames = colors.map((c, i) => `Bot ${i + 1} (${c})`);
	const isBots = colors.map(() => true);
	const botDifficulties = colors.map(() => "medium");
	let state = GameEngine.createInitialState({
		playerNames,
		playerColors: colors,
		isBots,
		botDifficulties
	});
	let steps = 0;
	const maxSteps = 2500;
	const matchLogs = [`=== INÍCIO DA PARTIDA #${matchId} (${numPlayers} JOGADORES) ===`];
	while (!state.isGameOver && steps < maxSteps) {
		const prevLogLength = state.log.length;
		const nextState = processBotStep(state);
		if (nextState.log.length > prevLogLength) for (let i = prevLogLength; i < nextState.log.length; i++) matchLogs.push(`[R${nextState.round}|F:${nextState.phase}] ${nextState.log[i]}`);
		if (nextState === state) {
			if (nextState.phase === "day") {
				if (nextState.players[nextState.currentPlayerIndex]?.isBot) {
					matchLogs.push(`[AVISO] Bot não agiu, forçando passTurn.`);
					state = GameEngine.passTurn(nextState);
				} else break;
			} else break;
		} else state = nextState;
		steps++;
	}
	const isCompleted = state.isGameOver;
	matchLogs.push(`=== FIM DA PARTIDA #${matchId} (${isCompleted ? "CONCLUÍDA COM SUCESSO" : "INTERROMPIDA POR LIMITE DE PASSOS"}) ===`);
	const playersStats = state.players.map((p) => {
		const totalGigs = p.gigs.length;
		const successfulGigs = p.gigs.filter((g) => g.success).length;
		const gigsSuccessRate = totalGigs > 0 ? successfulGigs / totalGigs * 100 : 0;
		return {
			name: p.name,
			finalScore: p.score,
			coins: p.coins,
			renown: p.renown,
			skill: p.skill,
			musiciansCount: p.musicians.length,
			discsRecorded: p.totalDiscsRecorded,
			resourcesCount: p.resources.length,
			stylesCount: p.styles.length,
			gigsCount: totalGigs,
			gigsSuccessRate: Math.round(gigsSuccessRate)
		};
	});
	const winnerPlayer = typeof state.winner === "string" ? state.players.find((p) => p.id === state.winner) : state.winner;
	const winner = winnerPlayer ? {
		id: winnerPlayer.id,
		name: winnerPlayer.name,
		score: winnerPlayer.score
	} : null;
	return {
		matchId,
		playerCount: numPlayers,
		rounds: state.round,
		steps,
		isCompleted,
		winner,
		players: playersStats,
		logs: matchLogs
	};
}
async function runAllMatches() {
	console.log("Iniciando bateria de 45 testes de partidas completas Bot vs Bot...");
	const allMatches = [];
	let currentMatchId = 1;
	console.log("\n--- Rodando 15 partidas para 2 Jogadores ---");
	for (let i = 0; i < 15; i++) {
		const res = runSingleMatch(currentMatchId++, 2);
		allMatches.push(res);
		console.log(`Partida #${res.matchId} (2P): ${res.isCompleted ? "✓ Concluída" : "✗ Falhou"} em ${res.steps} passos. Vencedor: ${res.winner?.name} (${res.winner?.score} pts)`);
	}
	console.log("\n--- Rodando 15 partidas para 3 Jogadores ---");
	for (let i = 0; i < 15; i++) {
		const res = runSingleMatch(currentMatchId++, 3);
		allMatches.push(res);
		console.log(`Partida #${res.matchId} (3P): ${res.isCompleted ? "✓ Concluída" : "✗ Falhou"} em ${res.steps} passos. Vencedor: ${res.winner?.name} (${res.winner?.score} pts)`);
	}
	console.log("\n--- Rodando 15 partidas para 4 Jogadores ---");
	for (let i = 0; i < 15; i++) {
		const res = runSingleMatch(currentMatchId++, 4);
		allMatches.push(res);
		console.log(`Partida #${res.matchId} (4P): ${res.isCompleted ? "✓ Concluída" : "✗ Falhou"} em ${res.steps} passos. Vencedor: ${res.winner?.name} (${res.winner?.score} pts)`);
	}
	const artifactDir = "C:\\Users\\PH\\.gemini\\antigravity\\brain\\1a67573e-2477-44b6-89c0-0dbabb145396";
	const logsFilePath = path.join(artifactDir, "bot_matches_logs.md");
	let logContent = "# Registro Completo de 45 Partidas de Teste: Bot vs Bot (JAM - Board Game Digital)\n\n";
	logContent += `Data de Execução: ${(/* @__PURE__ */ new Date()).toISOString()}\n`;
	logContent += `Total de Partidas: 45 (15 para 2P, 15 para 3P, 15 para 4P)\n\n`;
	allMatches.forEach((m) => {
		logContent += `## Partida #${m.matchId} — ${m.playerCount} Jogadores\n`;
		logContent += `- **Status:** ${m.isCompleted ? "✅ Concluída com Sucesso" : "❌ Falhou"}\n`;
		logContent += `- **Passos Executados:** ${m.steps}\n`;
		logContent += `- **Vencedor:** ${m.winner ? `${m.winner.name} com ${m.winner.score} pontos` : "Empate/Indefinido"}\n`;
		logContent += `- **Desempenho dos Jogadores:**\n`;
		m.players.forEach((p) => {
			logContent += `  - **${p.name}:** ${p.finalScore} pts | ${p.coins} moedas | Renome: ${p.renown} | Hab: ${p.skill} | Músicos: ${p.musiciansCount} | Discos: ${p.discsRecorded} | Recursos: ${p.resourcesCount} | Estilos: ${p.stylesCount} | Shows: ${p.gigsCount} (${p.gigsSuccessRate}% sucesso)\n`;
		});
		logContent += `\n<details><summary>📜 Ver Log Detalhado de Ações (Clique para expandir)</summary>\n\n\`\`\`\n`;
		logContent += m.logs.join("\n");
		logContent += `\n\`\`\`\n</details>\n\n---\n\n`;
	});
	fs.writeFileSync(logsFilePath, logContent, "utf-8");
	console.log(`\nLogs detalhados salvos com sucesso em: ${logsFilePath}`);
	const summaryJsonPath = path.join(artifactDir, "scratch", "simulation_summary.json");
	if (!fs.existsSync(path.dirname(summaryJsonPath))) fs.mkdirSync(path.dirname(summaryJsonPath), { recursive: true });
	const completed2P = allMatches.filter((m) => m.playerCount === 2 && m.isCompleted).length;
	const completed3P = allMatches.filter((m) => m.playerCount === 3 && m.isCompleted).length;
	const completed4P = allMatches.filter((m) => m.playerCount === 4 && m.isCompleted).length;
	const allPlayers2P = allMatches.filter((m) => m.playerCount === 2).flatMap((m) => m.players);
	const allPlayers3P = allMatches.filter((m) => m.playerCount === 3).flatMap((m) => m.players);
	const allPlayers4P = allMatches.filter((m) => m.playerCount === 4).flatMap((m) => m.players);
	const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
	const summary = {
		totalMatches: allMatches.length,
		completedMatches: allMatches.filter((m) => m.isCompleted).length,
		stats2P: {
			completed: completed2P,
			avgScore: avg(allPlayers2P.map((p) => p.finalScore)),
			avgCoins: avg(allPlayers2P.map((p) => p.coins)),
			avgRenown: avg(allPlayers2P.map((p) => p.renown)),
			avgSkill: avg(allPlayers2P.map((p) => p.skill)),
			avgDiscs: avg(allPlayers2P.map((p) => p.discsRecorded)),
			avgGigSuccess: avg(allPlayers2P.map((p) => p.gigsSuccessRate))
		},
		stats3P: {
			completed: completed3P,
			avgScore: avg(allPlayers3P.map((p) => p.finalScore)),
			avgCoins: avg(allPlayers3P.map((p) => p.coins)),
			avgRenown: avg(allPlayers3P.map((p) => p.renown)),
			avgSkill: avg(allPlayers3P.map((p) => p.skill)),
			avgDiscs: avg(allPlayers3P.map((p) => p.discsRecorded)),
			avgGigSuccess: avg(allPlayers3P.map((p) => p.gigsSuccessRate))
		},
		stats4P: {
			completed: completed4P,
			avgScore: avg(allPlayers4P.map((p) => p.finalScore)),
			avgCoins: avg(allPlayers4P.map((p) => p.coins)),
			avgRenown: avg(allPlayers4P.map((p) => p.renown)),
			avgSkill: avg(allPlayers4P.map((p) => p.skill)),
			avgDiscs: avg(allPlayers4P.map((p) => p.discsRecorded)),
			avgGigSuccess: avg(allPlayers4P.map((p) => p.gigsSuccessRate))
		}
	};
	fs.writeFileSync(summaryJsonPath, JSON.stringify(summary, null, 2), "utf-8");
	console.log("Resumo estatístico salvo com sucesso.");
}
runAllMatches().catch((err) => {
	console.error("Erro na simulação:", err);
});
//#endregion
export {};
