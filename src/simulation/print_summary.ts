import { runAllSimulations } from './run_simulation';

const games = runAllSimulations();

console.log('# 🎲 RELATÓRIO DE SIMULAÇÃO DE 3 PARTIDAS (3 JOGADORES - 6 RODADAS)\n');

games.forEach((game, gIdx) => {
  console.log(`\n======================================================`);
  console.log(`### 🏆 PARTIDA ${gIdx + 1}`);
  console.log(`======================================================\n`);

  console.log(`#### 📊 Evolução Rodada a Rodada:\n`);
  console.log(`| Rodada | Evento Ativo | 1º Jogador | Jogador | Local/Clube | Show Pts / Sucesso | Moedas | Renome | Habilidade | Músicos | Discos | Pontos Acum. |`);
  console.log(`|:---:|:---|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|`);

  game.rounds.forEach(r => {
    r.playersRoundEnd.forEach((p, pIdx) => {
      const roundLabel = pIdx === 0 ? `**R${r.round}**` : '';
      const eventLabel = pIdx === 0 ? (r.event ? `🎭 ${r.event}` : '*(Nenhum)*') : '';
      const firstLabel = pIdx === 0 ? r.firstPlayer.split(' ')[0] : '';
      const successBadge = p.gigSuccess ? '✅ SIM' : '❌ NÃO';
      console.log(`| ${roundLabel} | ${eventLabel} | ${firstLabel} | **${p.name}** | ${p.clubVisited} | ${p.gigPoints} pts (${successBadge}) | 💰 ${p.coins} | ⭐ ${p.renown} | 🎓 ${p.skill} | 🎵 ${p.musiciansCount} | 💿 ${p.discsCount} | 🏆 **${p.score}** |`);
    });
  });

  console.log(`\n#### 🏁 Classificação Final da Partida ${gIdx + 1}:\n`);
  console.log(`| Posição | Jogador | Pontuação Final | Moedas | Renome | Habilidade | Músicos na Banda | Recursos Adquiridos | Discos | Tamanho do Saco |`);
  console.log(`|:---:|:---|:---:|:---:|:---:|:---:|:---|:---|:---:|:---:|`);

  game.finalRanking.forEach(r => {
    const medal = r.rank === 1 ? '🥇 1º' : r.rank === 2 ? '🥈 2º' : '🥉 3º';
    const musStr = r.musicians.map(m => `${m.name} (Nv${m.level})`).join(', ') || 'Nenhum';
    const resStr = r.resources.map(rc => `${rc.name} (${rc.vp} VP)`).join(', ') || 'Nenhum';
    console.log(`| ${medal} | **${r.name}** | **${r.finalScore} pts** | 💰 ${r.coins} | ⭐ ${r.renown} | 🎓 ${r.skill} | ${musStr} | ${resStr} | 💿 ${r.discs} | 🎲 ${r.bagSize} cubos |`);
  });

  console.log(`\n**Vencedor:** 👑 **${game.winner}**\n`);
});
