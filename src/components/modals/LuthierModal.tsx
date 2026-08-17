/**
 * LuthierModal — Modal de escolha do Luthier (Recurso 15)
 * 
 * Regra:
 * "Escolha uma carta de instrumento do baralho de recursos. Você pode comprá-la imediatamente pelo valor de face. Reembaralhe o baralho de recursos."
 */

import { useState } from 'react';
import type { GameState, PendingLuthierChoice } from '../../types/game';
import BoardPeekBanner from '../common/BoardPeekBanner';
import CardHoverPreview from '../common/CardHoverPreview';
import { CoinIcon, PointsIcon } from '../common/GameIcons';

interface LuthierModalProps {
  pendingChoice: PendingLuthierChoice;
  gameState: GameState;
  onConfirm: (chosenInstrumentId?: string) => void;
}

export default function LuthierModal({
  pendingChoice,
  gameState,
  onConfirm,
}: LuthierModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const player = gameState.players[pendingChoice.playerIndex];
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);

  if (!player) return null;

  const instruments = pendingChoice.availableInstruments;
  const selectedInstrument = instruments.find(i => i.id === selectedInstrumentId);
  const canAffordSelected = selectedInstrument ? player.coins >= selectedInstrument.cost : false;

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle="Luthier: Escolha de Instrumento"
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Efeito do Luthier">
      <div
        className="luthier-modal"
        style={{
          background: 'linear-gradient(160deg, #1f1810 0%, #120e0a 100%)',
          border: '2px solid #2ecc71',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 780,
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(46,204,113,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(46,204,113,0.15)', color: '#2ecc71', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
              <span>🎻</span>
              <span>Recurso 15 • Luthier</span>
            </div>
            <h2 style={{ fontSize: 22, color: '#fff', margin: '10px 0 0', fontWeight: 800 }}>
              Escolha um Instrumento para Comprar
            </h2>
          </div>
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => setIsMinimized(true)}
            style={{ fontSize: 12, padding: '4px 10px', color: '#c2ab8f', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            👁️ Espiar Tabuleiro
          </button>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '12px 16px',
          fontSize: 13.5,
          color: '#ebdccb',
          lineHeight: 1.45,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}>
          <div>
            Você pode escolher qualquer carta de instrumento do baralho/descarte e comprá-la imediatamente pelo <strong>valor de face</strong>.
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(243,195,67,0.15)', padding: '6px 12px', borderRadius: 8, color: '#f3c343', fontWeight: 700 }}>
            <CoinIcon size={16} />
            <span>Suas Moedas: {player.coins}</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          maxHeight: 380,
          overflowY: 'auto',
          padding: '4px 2px',
        }}>
          {instruments.map(inst => {
            const isSelected = selectedInstrumentId === inst.id;
            const canAfford = player.coins >= inst.cost;

            return (
              <div
                key={inst.id}
                onClick={() => setSelectedInstrumentId(isSelected ? null : inst.id)}
                style={{
                  border: isSelected ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  padding: 10,
                  background: isSelected ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'all 0.2s',
                  opacity: canAfford ? 1 : 0.6,
                }}
              >
                {inst.image && (
                  <CardHoverPreview resource={inst}>
                    <img
                      src={inst.image}
                      alt={inst.name}
                      style={{
                        width: '100%',
                        height: 120,
                        borderRadius: 8,
                        objectFit: 'cover',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    />
                  </CardHoverPreview>
                )}

                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{inst.name}</span>
                    {inst.victoryPoints > 0 && (
                      <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        <PointsIcon size={12} /> +{inst.victoryPoints} VP
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#ebdccb', marginTop: 4, lineHeight: 1.3 }}>
                    {inst.description}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  marginTop: 'auto',
                  paddingTop: 4,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <span style={{ color: '#f3c343', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <CoinIcon size={13} /> {inst.cost} moedas
                  </span>
                  {!canAfford && (
                    <span style={{ color: '#ff7675', fontSize: 10.5 }}>Insuficiente</span>
                  )}
                  {isSelected && (
                    <span style={{ color: '#2ecc71', fontWeight: 700 }}>✓ Escolhido</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            className="btn-outline btn-md"
            onClick={() => onConfirm(undefined)}
            style={{ padding: '10px 18px', fontSize: 14 }}
          >
            Não Comprar Nenhum
          </button>

          <button
            type="button"
            className="btn-primary btn-md"
            disabled={!selectedInstrumentId || !canAffordSelected}
            onClick={() => {
              if (selectedInstrumentId && canAffordSelected) {
                onConfirm(selectedInstrumentId);
              }
            }}
            style={{
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              opacity: selectedInstrumentId && canAffordSelected ? 1 : 0.5,
              cursor: selectedInstrumentId && canAffordSelected ? 'pointer' : 'not-allowed',
            }}
          >
            {selectedInstrument
              ? `Comprar ${selectedInstrument.name} (${selectedInstrument.cost} moedas)`
              : 'Selecione um Instrumento'}
          </button>
        </div>
      </div>
    </div>
  );
}
