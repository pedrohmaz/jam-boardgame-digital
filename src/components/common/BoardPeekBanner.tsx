/**
 * BoardPeekBanner — Botão flutuante exibido quando o jogador minimiza um modal para espiar o tabuleiro.
 */

interface BoardPeekBannerProps {
  modalTitle: string;
  onRestore: () => void;
}

export default function BoardPeekBanner({ modalTitle, onRestore }: BoardPeekBannerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 22,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999999,
        background: 'linear-gradient(135deg, #241608 0%, #120a03 100%)',
        border: '2px solid #f3c343',
        borderRadius: 30,
        padding: '10px 22px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.95), 0 0 25px rgba(243,195,67,0.6)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        color: '#f0ede8',
        cursor: 'pointer',
        animation: 'pulseGlow 2s infinite',
      }}
      onClick={onRestore}
      title="Clique para voltar para o modal e continuar a sua decisão"
    >
      <span style={{ fontSize: 20 }}>↩️</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 10.5, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Modo Espiar Tabuleiro Ativo
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
          Voltar para: {modalTitle}
        </span>
      </div>
      <button
        type="button"
        className="btn-primary"
        style={{ padding: '4px 12px', fontSize: 11.5, borderRadius: 12, marginLeft: 6 }}
        onClick={(e) => {
          e.stopPropagation();
          onRestore();
        }}
      >
        Restaurar ✕
      </button>
    </div>
  );
}
