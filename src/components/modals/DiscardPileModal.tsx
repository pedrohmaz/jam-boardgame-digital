/**
 * DiscardPileModal — Modal para visualização das cartas descartadas
 * Permite aos jogadores consultar o descarte de Músicos e de Recursos
 */

import type { MusicianCard, ResourceCard } from '../../types/cards';
import CardHoverPreview from '../common/CardHoverPreview';
import { PointsIcon, CoinIcon } from '../common/GameIcons';

interface DiscardPileModalProps {
  type: 'musicians' | 'resources';
  musicians?: MusicianCard[];
  resources?: ResourceCard[];
  onClose: () => void;
}

export default function DiscardPileModal({
  type,
  musicians = [],
  resources = [],
  onClose,
}: DiscardPileModalProps) {
  const isMusicians = type === 'musicians';
  const title = isMusicians ? '📜 Pilha de Descarte de Músicos' : '📜 Pilha de Descarte de Recursos';
  const itemsCount = isMusicians ? musicians.length : resources.length;

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        zIndex: 999999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(165deg, #1e1610 0%, #100b06 100%)',
          border: '2px solid #c9922b',
          borderRadius: 16,
          padding: '24px',
          maxWidth: 680,
          width: '96%',
          maxHeight: '85vh',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(201,146,43,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#f0ede8',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: '#f3c343', fontWeight: 800 }}>
              {title}
            </h2>
            <div style={{ fontSize: 12, color: '#c2ab8f', marginTop: 2 }}>
              Total de cartas fora de jogo: <strong>{itemsCount}</strong> (Passe o mouse nas cartas para ver a arte ampliada)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#f0ede8',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ✕ Fechar
          </button>
        </div>

        {/* Content list */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', paddingRight: 4 }}>
          {itemsCount === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8a7a6e', fontSize: 13, fontStyle: 'italic' }}>
              Nenhuma carta foi descartada nesta pilha ainda.
            </div>
          ) : isMusicians ? (
            musicians.map((m, idx) => (
              <div
                key={`${m.id}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {m.image && (
                  <CardHoverPreview musician={m}>
                    <img
                      src={m.image}
                      alt={m.name}
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', cursor: 'zoom-in', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </CardHoverPreview>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{m.name}</span>
                    <span style={{ fontSize: 10, background: 'rgba(201,146,43,0.3)', border: '1px solid #c9922b', color: '#f1c40f', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                      Nv.{m.level}
                    </span>
                    <span style={{ fontSize: 11, color: '#c2ab8f' }}>
                      Custo: {m.cost} moedas • Artista #{m.artistNumber}
                    </span>
                  </div>
                  {m.specialRule && (
                    <div style={{ fontSize: 11, color: '#e0d2c1', marginTop: 2 }}>
                      {m.specialRule.description}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            resources.map((r, idx) => (
              <div
                key={`${r.id}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {r.image && (
                  <CardHoverPreview resource={r}>
                    <img
                      src={r.image}
                      alt={r.name}
                      style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', cursor: 'zoom-in', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </CardHoverPreview>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: '#c2ab8f', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <CoinIcon size={12} /> {r.cost} moedas
                    </span>
                    {r.victoryPoints > 0 && (
                      <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        <PointsIcon size={12} /> +{r.victoryPoints} VP
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#ebdccb', marginTop: 2 }}>
                    {r.description}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', padding: '10px', fontSize: 13 }}
          onClick={onClose}
        >
          ✓ Entendido
        </button>
      </div>
    </div>
  );
}
