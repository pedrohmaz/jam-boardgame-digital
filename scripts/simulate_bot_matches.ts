import * as fs from 'fs';
import * as path from 'path';
import { GameEngine } from '../src/engine/gameEngine';
import { processBotStep } from '../src/engine/botAI';
import type { GameState, PlayerColor } from '../src/types/game';

interface MatchStats {
  matchId: number;
  playerCount: number;
  rounds: number;
  steps: number;
  isCompleted: boolean;
  winner: { id: string; name: string; score: number } | null;
  players: {
    name: string;
    finalScore: number;
    coins: number;
    renown: number;
    skill: number;
    musiciansCount: number;
    discsRecorded: number;
    resourcesCount: number;
    stylesCount: number;
    gigsCount: number;
    gigsSuccessRate: number;
  }[];
  logs: string[];
}

function runSingleMatch(matchId: number, numPlayers: number): MatchStats {
  const colors: PlayerColor[] = ['orange', 'pink', 'green', 'brown'].slice(0, numPlayers) as PlayerColor[];
  const playerNames = colors.map((c, i) => `Bot ${i + 1} (${c})`);
  const isBots = colors.map(() => true);
  const botDifficulties = colors.map(() => 'medium' as const);

  let state: GameState = GameEngine.createInitialState({
    playerNames,
    playerColors: colors,
    isBots,
    botDifficulties,
  });

  let steps = 0;
  const maxSteps = 2500;
  const matchLogs: string[] = [`=== INÍCIO DA PARTIDA #${matchId} (${numPlayers} JOGADORES) ===`];

  while (!state.isGameOver && steps < maxSteps) {
    const prevLogLength = state.log.length;
    const nextState = processBotStep(state);
    
    // Captura novos logs gerados neste passo
    if (nextState.log.length > prevLogLength) {
      for (let i = prevLogLength; i < nextState.log.length; i++) {
        matchLogs.push(`[R${nextState.round}|F:${nextState.phase}] ${nextState.log[i]}`);
      }
    }

    if (nextState === state) {
      // Se o estado não avançou, verifica se está na fase de dia
      if (nextState.phase === 'day') {
        const p = nextState.players[nextState.currentPlayerIndex];
        if (p?.isBot) {
          matchLogs.push(`[AVISO] Bot não agiu, forçando passTurn.`);
          state = GameEngine.passTurn(nextState);
        } else {
          break;
        }
      } else {
        break;
      }
    } else {
      state = nextState;
    }

    steps++;
  }

  const isCompleted = state.isGameOver;
  matchLogs.push(`=== FIM DA PARTIDA #${matchId} (${isCompleted ? 'CONCLUÍDA COM SUCESSO' : 'INTERROMPIDA POR LIMITE DE PASSOS'}) ===`);

  const playersStats = state.players.map(p => {
    const totalGigs = p.gigs.length;
    const successfulGigs = p.gigs.filter(g => g.success).length;
    const gigsSuccessRate = totalGigs > 0 ? (successfulGigs / totalGigs) * 100 : 0;

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
      gigsSuccessRate: Math.round(gigsSuccessRate),
    };
  });

  const winnerPlayer = typeof state.winner === 'string'
    ? state.players.find(p => p.id === state.winner)
    : (state.winner as any);

  const winner = winnerPlayer ? {
    id: winnerPlayer.id,
    name: winnerPlayer.name,
    score: winnerPlayer.score,
  } : null;

  return {
    matchId,
    playerCount: numPlayers,
    rounds: state.round,
    steps,
    isCompleted,
    winner,
    players: playersStats,
    logs: matchLogs,
  };
}

async function runAllMatches() {
  console.log('Iniciando bateria de 45 testes de partidas completas Bot vs Bot...');

  const allMatches: MatchStats[] = [];
  let currentMatchId = 1;

  // 15 partidas para 2 jogadores
  console.log('\n--- Rodando 15 partidas para 2 Jogadores ---');
  for (let i = 0; i < 15; i++) {
    const res = runSingleMatch(currentMatchId++, 2);
    allMatches.push(res);
    console.log(`Partida #${res.matchId} (2P): ${res.isCompleted ? '✓ Concluída' : '✗ Falhou'} em ${res.steps} passos. Vencedor: ${res.winner?.name} (${res.winner?.score} pts)`);
  }

  // 15 partidas para 3 jogadores
  console.log('\n--- Rodando 15 partidas para 3 Jogadores ---');
  for (let i = 0; i < 15; i++) {
    const res = runSingleMatch(currentMatchId++, 3);
    allMatches.push(res);
    console.log(`Partida #${res.matchId} (3P): ${res.isCompleted ? '✓ Concluída' : '✗ Falhou'} em ${res.steps} passos. Vencedor: ${res.winner?.name} (${res.winner?.score} pts)`);
  }

  // 15 partidas para 4 jogadores
  console.log('\n--- Rodando 15 partidas para 4 Jogadores ---');
  for (let i = 0; i < 15; i++) {
    const res = runSingleMatch(currentMatchId++, 4);
    allMatches.push(res);
    console.log(`Partida #${res.matchId} (4P): ${res.isCompleted ? '✓ Concluída' : '✗ Falhou'} em ${res.steps} passos. Vencedor: ${res.winner?.name} (${res.winner?.score} pts)`);
  }

  // Gera o arquivo de logs detalhados
  const artifactDir = 'C:\\Users\\PH\\.gemini\\antigravity\\brain\\1a67573e-2477-44b6-89c0-0dbabb145396';
  const logsFilePath = path.join(artifactDir, 'bot_matches_logs.md');

  let logContent = '# Registro Completo de 45 Partidas de Teste: Bot vs Bot (JAM - Board Game Digital)\n\n';
  logContent += `Data de Execução: ${new Date().toISOString()}\n`;
  logContent += `Total de Partidas: 45 (15 para 2P, 15 para 3P, 15 para 4P)\n\n`;

  allMatches.forEach(m => {
    logContent += `## Partida #${m.matchId} — ${m.playerCount} Jogadores\n`;
    logContent += `- **Status:** ${m.isCompleted ? '✅ Concluída com Sucesso' : '❌ Falhou'}\n`;
    logContent += `- **Passos Executados:** ${m.steps}\n`;
    logContent += `- **Vencedor:** ${m.winner ? `${m.winner.name} com ${m.winner.score} pontos` : 'Empate/Indefinido'}\n`;
    logContent += `- **Desempenho dos Jogadores:**\n`;
    m.players.forEach(p => {
      logContent += `  - **${p.name}:** ${p.finalScore} pts | ${p.coins} moedas | Renome: ${p.renown} | Hab: ${p.skill} | Músicos: ${p.musiciansCount} | Discos: ${p.discsRecorded} | Recursos: ${p.resourcesCount} | Estilos: ${p.stylesCount} | Shows: ${p.gigsCount} (${p.gigsSuccessRate}% sucesso)\n`;
    });
    logContent += `\n<details><summary>📜 Ver Log Detalhado de Ações (Clique para expandir)</summary>\n\n\`\`\`\n`;
    logContent += m.logs.join('\n');
    logContent += `\n\`\`\`\n</details>\n\n---\n\n`;
  });

  fs.writeFileSync(logsFilePath, logContent, 'utf-8');
  console.log(`\nLogs detalhados salvos com sucesso em: ${logsFilePath}`);

  // Retorna estatísticas agregadas em JSON
  const summaryJsonPath = path.join(artifactDir, 'scratch', 'simulation_summary.json');
  if (!fs.existsSync(path.dirname(summaryJsonPath))) {
    fs.mkdirSync(path.dirname(summaryJsonPath), { recursive: true });
  }

  const completed2P = allMatches.filter(m => m.playerCount === 2 && m.isCompleted).length;
  const completed3P = allMatches.filter(m => m.playerCount === 3 && m.isCompleted).length;
  const completed4P = allMatches.filter(m => m.playerCount === 4 && m.isCompleted).length;

  const allPlayers2P = allMatches.filter(m => m.playerCount === 2).flatMap(m => m.players);
  const allPlayers3P = allMatches.filter(m => m.playerCount === 3).flatMap(m => m.players);
  const allPlayers4P = allMatches.filter(m => m.playerCount === 4).flatMap(m => m.players);

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const summary = {
    totalMatches: allMatches.length,
    completedMatches: allMatches.filter(m => m.isCompleted).length,
    stats2P: {
      completed: completed2P,
      avgScore: avg(allPlayers2P.map(p => p.finalScore)),
      avgCoins: avg(allPlayers2P.map(p => p.coins)),
      avgRenown: avg(allPlayers2P.map(p => p.renown)),
      avgSkill: avg(allPlayers2P.map(p => p.skill)),
      avgDiscs: avg(allPlayers2P.map(p => p.discsRecorded)),
      avgGigSuccess: avg(allPlayers2P.map(p => p.gigsSuccessRate)),
    },
    stats3P: {
      completed: completed3P,
      avgScore: avg(allPlayers3P.map(p => p.finalScore)),
      avgCoins: avg(allPlayers3P.map(p => p.coins)),
      avgRenown: avg(allPlayers3P.map(p => p.renown)),
      avgSkill: avg(allPlayers3P.map(p => p.skill)),
      avgDiscs: avg(allPlayers3P.map(p => p.discsRecorded)),
      avgGigSuccess: avg(allPlayers3P.map(p => p.gigsSuccessRate)),
    },
    stats4P: {
      completed: completed4P,
      avgScore: avg(allPlayers4P.map(p => p.finalScore)),
      avgCoins: avg(allPlayers4P.map(p => p.coins)),
      avgRenown: avg(allPlayers4P.map(p => p.renown)),
      avgSkill: avg(allPlayers4P.map(p => p.skill)),
      avgDiscs: avg(allPlayers4P.map(p => p.discsRecorded)),
      avgGigSuccess: avg(allPlayers4P.map(p => p.gigsSuccessRate)),
    },
  };

  fs.writeFileSync(summaryJsonPath, JSON.stringify(summary, null, 2), 'utf-8');
  console.log('Resumo estatístico salvo com sucesso.');
}

runAllMatches().catch(err => {
  console.error('Erro na simulação:', err);
});
