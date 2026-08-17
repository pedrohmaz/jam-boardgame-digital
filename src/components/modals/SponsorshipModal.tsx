/**
 * SponsorshipModal — Modal Interativo para Escolha de Patrocínio (Evento 04)
 * Permite a cada jogador da partida escolher entre:
 * 1) +5 Moedas
 * 2) +1 Renome
 * 3) +1 Habilidade (com a regra oficial de ganho de cubo em caso de avanço numérico)
 */

import { useState } from 'react';
import type { GameState, PlayerState } from '../../types/game';
import { SKILL_STEPS_VALUES, SKILL_STEPS_LABELS } from '../../types/game';
import type { NoteColor, EventCard } from '../../types/cards';
import { GameEngine } from '../../engine/gameEngine';
import CubeToken from '../common/CubeToken';
import { CoinIcon } from '../common/GameIcons';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface SponsorshipModalProps {
  event: EventCard;
  round: number;
  gameState: GameState;
  onComplete: (newState: GameState) => void;
}

export default function SponsorshipModal({
  event,
  round,
  gameState,
  onComplete,
}: SponsorshipModalProps) {
  const [currentState, setCurrentState] = useState<GameState>(gameState);
  const [playerQueueIndex, setPlayerQueueIndex] = useState<number>(0);
  const [choice, setChoice] = useState<'coins' | 'renown' | 'skill'>('coins');
  const [isMinimized, setIsMinimized] = useState(false);

  // Opções de Cubo ao subir nível de habilidade
  const [spendInspiration, setSpendInspiration] = useState<boolean>(false);
  const [chosenColor, setChosenColor] = useState<NoteColor>('red');

  const totalPlayers = currentState.players.length;
  const currentPlayer: PlayerState = currentState.players[playerQueueIndex];

  // Cálculo da habilidade
  const nextSkillStepIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (currentPlayer.skillStepIndex ?? 0) + 1);
  const isNumericSkillUp = SKILL_STEPS_VALUES[nextSkillStepIndex] > (SKILL_STEPS_VALUES[currentPlayer.skillStepIndex ?? 0]);
  const hasTocaDiscos = currentPlayer.resources.some(r => r.id === 'recurso_07' || r.effectType === 'choose_cube_on_skill_up');

  const handleConfirmChoice = () => {
    const updatedState = GameEngine.applySponsorshipChoice(
      currentState,
      playerQueueIndex,
      choice
    );

    if (playerQueueIndex + 1 < totalPlayers) {
      setCurrentState(updatedState);
      setPlayerQueueIndex(playerQueueIndex + 1);
      setChoice('coins');
      setSpendInspiration(false);
      setChosenColor('red');
    } else {
      onComplete(updatedState);
    }
  };

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle={`Evento ${event.name}`}
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Modal do Evento Patrocínio"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(165deg, #1f160b 0%, #120c06 100%)',
          border: '2px solid #f3c343',
          borderRadius: 16,
          padding: '24px',
          maxWidth: 540,
          width: '92%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(243,195,67,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#f0ede8',
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>🎭</span>
            <div>
              <div style={{ fontSize: 11, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                Evento da Rodada {round}
              </div>
              <h2 style={{ margin: 0, fontSize: 20, color: '#fff', fontWeight: 800 }}>
                {event.name}
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#f0ede8',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: 11.5,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Ocultar temporariamente o modal para ver o tabuleiro"
            >
              👁️ Espiar
            </button>
            <div style={{ background: 'rgba(243,195,67,0.15)', border: '1px solid #f3c343', padding: '3px 10px', borderRadius: 12, fontSize: 11, color: '#f3c343', fontWeight: 700 }}>
              Jogador {playerQueueIndex + 1} de {totalPlayers}
            </div>
          </div>
        </div>

        {/* Indicador do Jogador Atual */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#8a7a6e' }}>Escolhendo patrocínio:</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f3c343' }}>
              {currentPlayer.name}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#c2ab8f' }}>
            <span>Moedas: <strong>{currentPlayer.coins}</strong></span>
            <span>Renome: <strong>{currentPlayer.renown}</strong></span>
            <span>Habilidade: <strong>{currentPlayer.skill}</strong></span>
          </div>
        </div>

        {/* 3 Opções de Patrocínio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Opção 1: +5 Moedas */}
          <label
            onClick={() => setChoice('coins')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              background: choice === 'coins' ? 'rgba(201,146,43,0.25)' : 'rgba(255,255,255,0.03)',
              border: choice === 'coins' ? '2px solid #f1c40f' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="radio"
                name="sponsorshipOption"
                checked={choice === 'coins'}
                onChange={() => setChoice('coins')}
                style={{ transform: 'scale(1.2)' }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CoinIcon size={16} /> Ganhar 5 Moedas
                </div>
                <div style={{ fontSize: 12, color: '#8a7a6e' }}>
                  Aumenta seu saldo para compras e contratações (Atual: {currentPlayer.coins} ➔ {currentPlayer.coins + 5})
                </div>
              </div>
            </div>
            {choice === 'coins' && <span style={{ color: '#f1c40f', fontWeight: 800 }}>✓</span>}
          </label>

          {/* Opção 2: +1 Renome */}
          <label
            onClick={() => setChoice('renown')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              background: choice === 'renown' ? 'rgba(230,126,34,0.25)' : 'rgba(255,255,255,0.03)',
              border: choice === 'renown' ? '2px solid #e67e22' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="radio"
                name="sponsorshipOption"
                checked={choice === 'renown'}
                onChange={() => setChoice('renown')}
                style={{ transform: 'scale(1.2)' }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  🏆 Ganhar +1 Renome
                </div>
                <div style={{ fontSize: 12, color: '#8a7a6e' }}>
                  Mais público e moedas em todos os shows (Atual: {currentPlayer.renown} ➔ {Math.min(10, currentPlayer.renown + 1)}/10)
                </div>
              </div>
            </div>
            {choice === 'renown' && <span style={{ color: '#e67e22', fontWeight: 800 }}>✓</span>}
          </label>

          {/* Opção 3: +1 Habilidade */}
          <label
            onClick={() => setChoice('skill')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 10,
              background: choice === 'skill' ? 'rgba(139,30,63,0.25)' : 'rgba(255,255,255,0.03)',
              border: choice === 'skill' ? '2px solid #8b1e3f' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="radio"
                  name="sponsorshipOption"
                  checked={choice === 'skill'}
                  onChange={() => setChoice('skill')}
                  style={{ transform: 'scale(1.2)' }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    🎓 Ganhar 1 Passo de Habilidade
                  </div>
                  <div style={{ fontSize: 12, color: '#8a7a6e' }}>
                    Avança na trilha do Conservatório (Atual: Passo {SKILL_STEPS_LABELS[currentPlayer.skillStepIndex ?? 0]} • Nv{currentPlayer.skill} ➔ Passo {SKILL_STEPS_LABELS[nextSkillStepIndex]} • Nv{SKILL_STEPS_VALUES[nextSkillStepIndex]})
                  </div>
                </div>
              </div>
              {choice === 'skill' && <span style={{ color: '#ff7675', fontWeight: 800 }}>✓</span>}
            </div>

            {/* Seletor de Cubo ao subir nível numérico */}
            {choice === 'skill' && isNumericSkillUp && (
              <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f3c343', marginBottom: 4 }}>
                  ⭐ Aumento Numérico de Nível: Adicione 1 Cubo ao seu Saco!
                </div>

                {hasTocaDiscos ? (
                  <div>
                    <div style={{ fontSize: 11, color: '#2ecc71', fontWeight: 600, marginBottom: 4 }}>
                      📻 <strong>Toca-Discos Ativo:</strong> Escolha livremente a cor:
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(['red', 'blue', 'yellow', 'purple'] as NoteColor[]).map(color => {
                        const count = currentState.mainBag[color as keyof typeof currentState.mainBag] || 0;
                        const isSelected = chosenColor === color;
                        const isAvailable = count > 0;
                        return (
                          <div
                            key={color}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAvailable) setChosenColor(color);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '3px 7px',
                              borderRadius: 6,
                              border: isSelected ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.2)',
                              background: isSelected ? 'rgba(243,195,67,0.25)' : 'rgba(255,255,255,0.05)',
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              opacity: isAvailable ? 1 : 0.4,
                            }}
                          >
                            <CubeToken color={color} size="sm" />
                            <span style={{ fontSize: 10, color: '#f0ede8', textTransform: 'capitalize' }}>{color} ({count})</span>
                            {isSelected && <span style={{ color: '#f3c343', fontSize: 10 }}>✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#f1c40f', cursor: currentPlayer.inspiration >= 1 ? 'pointer' : 'not-allowed', opacity: currentPlayer.inspiration >= 1 ? 1 : 0.6 }}
                    >
                      <input
                        type="checkbox"
                        checked={spendInspiration}
                        onChange={e => setSpendInspiration(e.target.checked)}
                        disabled={currentPlayer.inspiration < 1}
                      />
                      <span>✨ Gastar 1 Inspiração para escolher a cor (possui {currentPlayer.inspiration})</span>
                    </label>

                    {spendInspiration ? (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['red', 'blue', 'yellow', 'purple'] as NoteColor[]).map(color => {
                          const count = currentState.mainBag[color as keyof typeof currentState.mainBag] || 0;
                          const isSelected = chosenColor === color;
                          const isAvailable = count > 0;
                          return (
                            <div
                              key={color}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isAvailable) setChosenColor(color);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '3px 7px',
                                borderRadius: 6,
                                border: isSelected ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.2)',
                                background: isSelected ? 'rgba(243,195,67,0.25)' : 'rgba(255,255,255,0.05)',
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                opacity: isAvailable ? 1 : 0.4,
                              }}
                            >
                              <CubeToken color={color} size="sm" />
                              <span style={{ fontSize: 10, color: '#f0ede8', textTransform: 'capitalize' }}>{color} ({count})</span>
                              {isSelected && <span style={{ color: '#f3c343', fontSize: 10 }}>✓</span>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: '#8a7a6e', fontStyle: 'italic' }}>
                        🎲 1 cubo aleatório será sorteado do saco principal para o seu saco.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </label>
        </div>

        {/* Botão de Confirmação */}
        <button
          type="button"
          className="btn-primary btn-lg"
          style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, marginTop: 4 }}
          onClick={handleConfirmChoice}
        >
          {playerQueueIndex + 1 < totalPlayers
            ? `✓ Confirmar Escolha de ${currentPlayer.name} ➔ Próximo Jogador`
            : `✓ Concluir Patrocínios & Iniciar Rodada ${round}!`}
        </button>
      </div>
    </div>
  );
}
