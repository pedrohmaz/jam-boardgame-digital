/**
 * EscolhasEsteticasModal — Modal Interativo para Escolhas Estéticas (Evento 02)
 * Permite a cada jogador da partida eliminar 1 cubo não branco de seu saco (ou passar).
 */

import { useState, useEffect } from 'react';
import type { GameState, PlayerState } from '../../types/game';
import type { NoteColor, EventCard } from '../../types/cards';
import { GameEngine } from '../../engine/gameEngine';
import CubeToken from '../common/CubeToken';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface EscolhasEsteticasModalProps {
  event: EventCard;
  round: number;
  gameState: GameState;
  onComplete: (newState: GameState) => void;
}

export default function EscolhasEsteticasModal({
  event,
  round,
  gameState,
  onComplete,
}: EscolhasEsteticasModalProps) {
  const [currentState, setCurrentState] = useState<GameState>(gameState);
  const [playerQueueIndex, setPlayerQueueIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<NoteColor | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const totalPlayers = currentState.players.length;
  const currentPlayer: PlayerState = currentState.players[playerQueueIndex];

  // Cubos não brancos disponíveis no saco do jogador atual
  const nonWhiteCubes = currentPlayer ? currentPlayer.bag.filter(c => c !== 'white') : [];
  const uniqueNonWhiteColors = Array.from(new Set(nonWhiteCubes)) as NoteColor[];

  // Se o jogador atual for BOT, resolve automaticamente após um pequeno delay
  useEffect(() => {
    if (currentPlayer?.isBot) {
      const timer = setTimeout(() => {
        // Heurística do Bot: elimina uma cor repetida se tiver > 2, ou passa se tiver poucas
        const colorCounts: Record<string, number> = {};
        nonWhiteCubes.forEach(c => { colorCounts[c] = (colorCounts[c] || 0) + 1; });
        const surplusColor = Object.entries(colorCounts).find(([, count]) => count >= 2)?.[0] as NoteColor | undefined;
        
        const updatedState = GameEngine.applyRemoveNonWhiteCubeChoice(
          currentState,
          playerQueueIndex,
          surplusColor
        );

        if (playerQueueIndex + 1 < totalPlayers) {
          setCurrentState(updatedState);
          setPlayerQueueIndex(playerQueueIndex + 1);
          setSelectedColor(null);
        } else {
          onComplete(updatedState);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [playerQueueIndex, currentPlayer, currentState, totalPlayers, nonWhiteCubes, onComplete]);

  const handleConfirmChoice = (colorToRemove?: NoteColor) => {
    const updatedState = GameEngine.applyRemoveNonWhiteCubeChoice(
      currentState,
      playerQueueIndex,
      colorToRemove
    );

    if (playerQueueIndex + 1 < totalPlayers) {
      setCurrentState(updatedState);
      setPlayerQueueIndex(playerQueueIndex + 1);
      setSelectedColor(null);
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

  if (!currentPlayer) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Modal do Evento Escolhas Estéticas"
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
          maxWidth: 520,
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
            <span style={{ fontSize: 24 }}>🎨</span>
            <div>
              <div style={{ fontSize: 11, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                Evento da Rodada {round}
              </div>
              <h2 style={{ margin: 0, fontSize: 20, color: '#fff', fontWeight: 800 }}>
                {event.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ebdccb',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            👁️ Ver Tabuleiro
          </button>
        </div>

        {/* Descrição do Evento */}
        <div style={{ background: 'rgba(243,195,67,0.08)', border: '1px solid rgba(243,195,67,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: '0.85rem', color: '#f0ede8', lineHeight: 1.4 }}>
          {event.description}
        </div>

        {/* Fila de Jogadores */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {currentState.players.map((p, idx) => {
            const isDone = idx < playerQueueIndex;
            const isCurrent = idx === playerQueueIndex;

            return (
              <div
                key={p.id}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  background: isCurrent ? 'rgba(243,195,67,0.2)' : isDone ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.04)',
                  border: isCurrent ? '1.5px solid #f3c343' : isDone ? '1px solid #2ecc71' : '1px solid rgba(255,255,255,0.1)',
                  color: isCurrent ? '#f3c343' : isDone ? '#2ecc71' : '#8a7a6e',
                }}
              >
                {isDone ? '✓ ' : ''}{p.name}
              </div>
            );
          })}
        </div>

        {/* Conteúdo de Escolha para o Jogador Ativo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f3c343' }}>
            Vez de {currentPlayer.name}:
          </div>

          {currentPlayer.isBot ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#8a7a6e', fontStyle: 'italic', fontSize: 13 }}>
              🤖 O Bot está avaliando seu saco de notas...
            </div>
          ) : (
            <>
              {uniqueNonWhiteColors.length > 0 ? (
                <div>
                  <div style={{ fontSize: 12, color: '#ebdccb', marginBottom: 8 }}>
                    Selecione 1 cubo não branco para eliminar permanentemente do seu saco (opcional):
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {uniqueNonWhiteColors.map(color => {
                      const count = nonWhiteCubes.filter(c => c === color).length;
                      const isSelected = selectedColor === color;

                      return (
                        <div
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: isSelected ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.2)',
                            background: isSelected ? 'rgba(243,195,67,0.25)' : 'rgba(255,255,255,0.06)',
                            cursor: 'pointer',
                          }}
                        >
                          <CubeToken color={color} size="md" />
                          <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'capitalize', color: '#fff' }}>
                            {color} ({count} no saco)
                          </span>
                          {isSelected && <span style={{ color: '#f3c343', fontWeight: 800 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#8a7a6e', fontStyle: 'italic' }}>
                  Você não possui cubos não brancos no saco para eliminar.
                </div>
              )}

              {/* Botões de Ação */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                  disabled={!selectedColor}
                  onClick={() => selectedColor && handleConfirmChoice(selectedColor)}
                >
                  🗑️ Eliminar Cubo {selectedColor ? selectedColor.toUpperCase() : ''}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                  onClick={() => handleConfirmChoice(undefined)}
                >
                  Passar (Não Eliminar)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
