import { useState } from 'react';
import type { EventCard } from '../../types/cards';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface EventAnnouncementModalProps {
  event: EventCard;
  round: number;
  onClose: () => void;
}

export default function EventAnnouncementModal({ event, round, onClose }: EventAnnouncementModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle={`Evento ${event.name} (Rodada ${round})`}
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Novo Evento da Rodada ${round}`}
    >
      <div
        className="event-announcement-modal"
        style={{
          background: 'linear-gradient(160deg, #1e1508 0%, #140e08 100%)',
          border: '2px solid rgba(243, 195, 67, 0.6)',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 480,
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(243,195,67,0.2)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          animation: 'fadeIn 0.3s ease',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(243,195,67,0.15)', border: '1px solid #f3c343', color: '#f3c343', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            🎭 Novo Evento • Rodada {round} de 6
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#f0ede8',
              padding: '4px 10px',
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
        </div>

        {event.image && (
          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxWidth: 220, maxHeight: 300 }}>
            <img src={event.image} alt={event.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        )}

        <div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: '#f3c343', margin: '0 0 8px' }}>
            {event.name}
          </h2>
          <p style={{ fontSize: 15, color: '#ebdccb', lineHeight: 1.5, margin: 0, background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            {event.description}
          </p>
        </div>

        <button
          id="close-event-modal-btn"
          type="button"
          className="btn-primary btn-lg"
          style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 700, marginTop: 4 }}
          onClick={onClose}
        >
          🎵 Começar Rodada {round}!
        </button>
      </div>
    </div>
  );
}
