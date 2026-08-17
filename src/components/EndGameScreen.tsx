import type { GameState } from '../types/game';
import { CoinIcon, PointsIcon } from './common/GameIcons';

interface EndGameScreenProps {
  gameState: GameState;
  onPlayAgain: () => void;
}

export default function EndGameScreen({ gameState, onPlayAgain }: EndGameScreenProps) {
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score || b.coins - a.coins);
  const winner = sortedPlayers[0];

  return (
    <div className="end-screen">
      <div className="end-header">
        <img src="/assets/logo/JAM_logo.png" alt="JAM" className="end-logo" />
        <h1 className="end-title">Fim da Partida!</h1>
        <p className="end-winner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span>🏆 Vencedor: <strong>{winner.name}</strong> com</span>
          <PointsIcon size={18} />
          <span>{winner.score} pontos!</span>
        </p>
      </div>

      <div className="end-scores">
        <h2 className="end-scores-title">Placar Final</h2>
        {sortedPlayers.map((player, i) => (
          <div key={player.id} className={`end-score-row ${i === 0 ? 'winner' : ''}`}>
            <span className="end-rank">{i + 1}º</span>
            <span className="end-player-name">{player.name}</span>
            <span className="end-player-score" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <PointsIcon size={16} />
              {player.score} pts
            </span>
            <span className="end-player-coins" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CoinIcon size={16} />
              {player.coins}
            </span>
            <div className="end-player-details">
              <span>Músicos: {player.musicians.length}</span>
              <span>Recursos: {player.resources.length}</span>
              <span>Discos: {player.discs.length}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        id="play-again-btn"
        className="btn-primary btn-lg"
        type="button"
        onClick={onPlayAgain}
      >
        🎵 Jogar Novamente
      </button>
    </div>
  );
}
