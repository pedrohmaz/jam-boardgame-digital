/**
 * ChapeuEstilosoModal — Modal interativo ativado ao adquirir a carta 'Chapéu Estiloso'
 * 
 * Regra:
 * "Escolha um estilo do baralho e coloque-o virado para baixo, próximo a suas cartas.
 * Quando for ganhar um Estilo, você pode escolher este e virá-lo para cima.
 * Se você já tem dois Estilos quando comprar esta carta, você pode trocar um deles por qualquer outro do baralho imediatamente."
 */

import { useState } from 'react';
import type { GameState } from '../../types/game';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface ChapeuEstilosoModalProps {
  gameState: GameState;
  onConfirm: (chosenStyleId: string, replacedStyleId?: string) => void;
  onCancel?: () => void;
}

export default function ChapeuEstilosoModal({ gameState, onConfirm }: ChapeuEstilosoModalProps) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const allAvailableStyles = [...gameState.decks.styles, ...gameState.market.styles];
  const hasTwoStyles = player.styles.length >= 2;
  const [isMinimized, setIsMinimized] = useState(false);

  const [selectedDeckStyleId, setSelectedDeckStyleId] = useState<string>(allAvailableStyles[0]?.id || '');
  const [styleToReplaceId, setStyleToReplaceId] = useState<string>(player.styles[0]?.id || '');

  const chosenStyle = allAvailableStyles.find(s => s.id === selectedDeckStyleId) || allAvailableStyles[0];

  const handleConfirm = () => {
    if (!selectedDeckStyleId) return;
    if (hasTwoStyles) {
      onConfirm(selectedDeckStyleId, styleToReplaceId);
    } else {
      onConfirm(selectedDeckStyleId);
    }
  };

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle="Chapéu Estiloso"
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Efeito do Chapéu Estiloso">
      <div
        className="chapeu-modal"
        style={{
          background: 'linear-gradient(160deg, #1f1810 0%, #120e0a 100%)',
          border: '2px solid #f3c343',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 680,
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(243,195,67,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(243,195,67,0.15)', color: '#f3c343', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
              🎩 Efeito Imediato: Chapéu Estiloso
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: '#fff', margin: '8px 0 4px' }}>
              {hasTwoStyles ? 'Troque 1 dos seus Estilos Ativos' : 'Escolha 1 Estilo para Reservar'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#f0ede8',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
            title="Ocultar temporariamente o modal para ver o tabuleiro"
          >
            👁️ Espiar
          </button>
        </div>
        <p style={{ fontSize: 13.5, color: '#ebdccb', margin: 0 }}>
          {hasTwoStyles
            ? 'Como você já possui 2 cartas de Estilo ativas, escolha 1 estilo do baralho para substituir imediatamente um dos seus estilos atuais:'
            : 'Escolha 1 estilo do baralho para deixar virado para baixo (reservado). Quando for ganhar um estilo durante o jogo, você poderá virá-lo para cima!'}
        </p>

        {/* Se tiver 2 estilos: seleção de qual estilo ativo substituir */}
        {hasTwoStyles && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f3c343', marginBottom: 8 }}>
              1. Selecione qual dos seus estilos atuais você deseja descartar:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
              {player.styles.map(style => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setStyleToReplaceId(style.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 4,
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: styleToReplaceId === style.id ? '2px solid #e74c3c' : '1px solid rgba(255,255,255,0.15)',
                    background: styleToReplaceId === style.id ? 'rgba(231,76,60,0.15)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {styleToReplaceId === style.id ? '❌ Descartar: ' : ''}{style.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#ebdccb', lineHeight: 1.3 }}>{style.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Escolha do Estilo do Baralho */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f3c343', marginBottom: 8 }}>
            {hasTwoStyles ? '2. Escolha o novo Estilo do Baralho:' : 'Selecione o Estilo para reservar:'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {allAvailableStyles.map(style => {
              const isSelected = selectedDeckStyleId === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedDeckStyleId(style.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 4,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: isSelected ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.12)',
                    background: isSelected ? 'rgba(243,195,67,0.15)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {style.image && (
                    <img src={style.image} alt={style.name} style={{ width: '100%', height: 75, objectFit: 'cover', borderRadius: 4, marginBottom: 2 }} />
                  )}
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? '#f3c343' : '#fff' }}>
                    {style.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#c2ab8f', lineHeight: 1.25 }}>
                    {style.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview do estilo selecionado */}
        {chosenStyle && (
          <div style={{ background: 'rgba(243,195,67,0.06)', border: '1px solid rgba(243,195,67,0.25)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#f3c343', textTransform: 'uppercase', fontWeight: 700 }}>Estilo Selecionado:</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{chosenStyle.name}</div>
              <div style={{ fontSize: 12, color: '#ebdccb' }}>{chosenStyle.description}</div>
            </div>
          </div>
        )}

        <button
          id="confirm-chapeu-style-btn"
          type="button"
          className="btn-primary btn-lg"
          style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, marginTop: 4 }}
          onClick={handleConfirm}
        >
          {hasTwoStyles ? '✓ Substituir e Ativar Novo Estilo' : '✓ Reservar Este Estilo (Virado p/ Baixo)'}
        </button>
      </div>
    </div>
  );
}
