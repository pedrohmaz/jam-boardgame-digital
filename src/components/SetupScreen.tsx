import { useState } from 'react';
import type { PlayerSetup } from '../App';
import RulesModal from './modals/RulesModal';

interface SetupScreenProps {
  onStart: (setup: PlayerSetup[]) => void;
  playerColors: string[];
}

const COLOR_LABELS: Record<string, string> = {
  orange: 'Laranja',
  pink: 'Rosa',
  green: 'Verde',
  brown: 'Marrom',
  gray: 'Cinza',
};

const COLOR_HEX: Record<string, string> = {
  orange: '#e67e22',
  pink: '#e84393',
  green: '#27ae60',
  brown: '#8d5524',
  gray: '#7f8c8d',
};

const DEFAULT_NAMES = ['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4'];

export default function SetupScreen({ onStart, playerColors }: SetupScreenProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [showRules, setShowRules] = useState(false);
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: 'Jogador 1', color: 'orange', isBot: false },
    { name: 'Jogador 2', color: 'pink', isBot: false },
    { name: 'Jogador 3', color: 'green', isBot: false },
    { name: 'Jogador 4', color: 'brown', isBot: false },
  ]);

  const activePlayers = playerCount === 1
    ? [
        { ...players[0], isBot: false },
        { name: players[1].name.includes('Bot') ? players[1].name : 'Miles (Bot)', color: players[1].color, isBot: true },
      ]
    : players.slice(0, playerCount);

  const updatePlayer = (index: number, field: keyof PlayerSetup, value: string | boolean) => {
    setPlayers(prev => prev.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const usedColors = activePlayers.map(p => p.color);

  const handleStart = () => {
    onStart(activePlayers);
  };

  return (
    <div className="setup-screen">
      {/* Header */}
      <div className="setup-header">
        <div className="setup-logo">
          <img src="/assets/logo/JAM_logo.png" alt="JAM" className="setup-logo-img" />
        </div>
        <h1 className="setup-title">Bem-vindo ao JAM</h1>
        <p className="setup-subtitle">O Jogo de Cartas de Jazz</p>
      </div>

      {/* Player count selector */}
      <div className="setup-card">
        <h2 className="setup-section-title">Número de Jogadores</h2>
        <div className="player-count-selector">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              id={`player-count-${n}`}
              className={`count-btn ${playerCount === n ? 'active' : ''}`}
              onClick={() => setPlayerCount(n)}
              type="button"
            >
              {n}
              {n === 1 && <span className="count-label">Solo</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Player setup */}
      <div className="setup-card">
        <h2 className="setup-section-title">Configurar Jogadores</h2>
        <div className="players-list">
          {activePlayers.map((player, index) => (
            <div key={index} className="player-row">
              <div
                className="player-color-indicator"
                style={{ backgroundColor: COLOR_HEX[player.color] || '#888' }}
              />
              <input
                id={`player-name-${index}`}
                type="text"
                className="player-name-input"
                value={player.name}
                placeholder={DEFAULT_NAMES[index]}
                onChange={e => updatePlayer(index, 'name', e.target.value)}
              />
              <select
                id={`player-color-${index}`}
                className="player-color-select"
                value={player.color}
                onChange={e => updatePlayer(index, 'color', e.target.value)}
              >
                {playerColors.map(color => (
                  <option
                    key={color}
                    value={color}
                    disabled={usedColors.includes(color) && player.color !== color}
                  >
                    {COLOR_LABELS[color]}
                  </option>
                ))}
              </select>
              {playerCount === 1 || index > 0 ? (
                <label className="bot-toggle" htmlFor={`bot-toggle-${index}`}>
                  <input
                    id={`bot-toggle-${index}`}
                    type="checkbox"
                    checked={player.isBot || (playerCount === 1 && index > 0)}
                    onChange={e => updatePlayer(index, 'isBot', e.target.checked)}
                    disabled={playerCount === 1 && index > 0}
                  />
                  <span className="bot-toggle-label">🤖 Bot</span>
                </label>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '440px' }}>
        <button
          id="start-game-btn"
          className="btn-primary btn-lg start-btn"
          type="button"
          onClick={handleStart}
          style={{ width: '100%', margin: 0 }}
        >
          🎷 Começar a Tocar!
        </button>

        <button
          type="button"
          onClick={() => setShowRules(true)}
          style={{
            background: 'rgba(243, 195, 67, 0.12)',
            border: '1px solid rgba(243, 195, 67, 0.35)',
            borderRadius: '10px',
            padding: '10px 16px',
            color: '#f3c343',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <span>📖 Como Jogar / Manual de Regras</span>
        </button>
      </div>

      <p className="setup-footer">
        Baseado no jogo de tabuleiro JAM — Versão Digital
      </p>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
