/**
 * StyleSelectionModal — Modal interativo de Escolha de Carta de Estilo (Objetivos)
 * 
 * Regra Oficial:
 * Ao cumprir o 1º objetivo (meta 1) ou o 3º objetivo (meta 3), o jogador compra 3 cartas de estilo,
 * escolhe 1 para adicionar à sua banda e coloca as outras 2 no fundo do baralho.
 */

import { useState } from 'react';
import type { PendingStyleChoice, PlayerState } from '../../types/game';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface StyleSelectionModalProps {
  pendingChoice: PendingStyleChoice;
  player?: PlayerState;
  onConfirm: (chosenStyleId: string) => void;
}

export default function StyleSelectionModal({ pendingChoice, player, onConfirm }: StyleSelectionModalProps) {
  const [selectedStyleId, setSelectedStyleId] = useState<string>(
    pendingChoice.drawnStyles[0]?.id || ''
  );
  const [isMinimized, setIsMinimized] = useState(false);

  const chosenStyle = pendingChoice.drawnStyles.find(s => s.id === selectedStyleId) || pendingChoice.drawnStyles[0];

  const handleConfirm = () => {
    if (!selectedStyleId && chosenStyle) {
      onConfirm(chosenStyle.id);
    } else {
      onConfirm(selectedStyleId);
    }
  };

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle={`Escolha de Estilo: ${player ? player.name : pendingChoice.objectiveName}`}
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Escolha de Carta de Estilo" style={{ zIndex: 100000 }}>
      <div
        className="style-selection-modal"
        style={{
          background: 'linear-gradient(160deg, #1f1810 0%, #120e0a 100%)',
          border: '2px solid #f3c343',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 780,
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 35px rgba(243,195,67,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(243,195,67,0.18)', color: '#f3c343', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
              🎯 Recompensa de Objetivo {player ? `• Vez de ${player.name}` : ''}
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: '#ffffff', margin: '8px 0 4px' }}>
              {player ? `${player.name}: ` : ''}Escolha 1 Carta de Estilo Musical
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#ebdccb' }}>
              {player ? <strong>{player.name}</strong> : 'Você'} cumpriu a meta da carta <strong>{pendingChoice.objectiveName}</strong> e ganhou <strong>+{pendingChoice.rewardVP} VP</strong>!
              Escolha 1 estilo para sua banda (as outras 2 cartas irão para o fundo do baralho):
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#f0ede8',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
            }}
          >
            👁️ Espiar Tabuleiro
          </button>
        </div>

        {/* Lista das 3 Cartas Sorteadas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
            margin: '8px 0',
          }}
        >
          {pendingChoice.drawnStyles.map(style => {
            const isSelected = style.id === selectedStyleId;

            return (
              <div
                key={style.id}
                onClick={() => setSelectedStyleId(style.id)}
                style={{
                  background: isSelected ? 'rgba(243,195,67,0.18)' : 'rgba(255,255,255,0.04)',
                  border: isSelected ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: isSelected ? '0 0 16px rgba(243,195,67,0.3)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Imagem do Estilo */}
                <div
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {style.image ? (
                    <img
                      src={style.image}
                      alt={style.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ fontSize: 36 }}>✨</div>
                  )}
                </div>

                {/* Nome & Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? '#f3c343' : '#ffffff' }}>
                    {style.name}
                  </span>
                  <input
                    type="radio"
                    name="selectedStyle"
                    checked={isSelected}
                    onChange={() => setSelectedStyleId(style.id)}
                    style={{ accentColor: '#f3c343', cursor: 'pointer' }}
                  />
                </div>

                {/* Descrição */}
                <div style={{ fontSize: 12, color: '#ebdccb', lineHeight: 1.4, flex: 1 }}>
                  {style.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer com Confirmação */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedStyleId}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: '#f3c343',
              border: 'none',
              color: '#1a140c',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(243,195,67,0.4)',
            }}
          >
            ✓ Escolher {chosenStyle?.name || 'Estilo'}
          </button>
        </div>
      </div>
    </div>
  );
}
