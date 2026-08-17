import { useState } from 'react';
import type { GameState } from '../../types/game';
import type { NoteColor } from '../../types/cards';
import CubeToken from '../common/CubeToken';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface CubeSelectionModalProps {
  gameState: GameState;
  onConfirm: (choice: { chosenColor?: NoteColor; spendInspiration?: boolean }) => void;
}

export default function CubeSelectionModal({
  gameState,
  onConfirm,
}: CubeSelectionModalProps) {
  const pending = gameState.pendingCubeChoice;
  const [isMinimized, setIsMinimized] = useState(false);

  if (!pending) return null;

  const player = gameState.players[pending.playerIndex] || gameState.players[gameState.currentPlayerIndex];
  const hasTocaDiscos = player.resources.some(r => r.id === 'recurso_07' || r.effectType === 'choose_cube_on_skill_up');
  const hasInspiration = player.inspiration >= 1;

  // Modos: 'random' ou 'choose_color'
  const [selectedMode, setSelectedMode] = useState<'random' | 'choose_color'>(
    hasTocaDiscos ? 'choose_color' : 'random'
  );
  const [selectedColor, setSelectedColor] = useState<NoteColor>('red');

  const mainBag = gameState.mainBag;
  const colors: NoteColor[] = ['red', 'blue', 'yellow', 'purple'];

  const handleConfirmAction = () => {
    if (hasTocaDiscos) {
      onConfirm({ chosenColor: selectedColor, spendInspiration: false });
    } else if (selectedMode === 'choose_color') {
      onConfirm({ chosenColor: selectedColor, spendInspiration: true });
    } else {
      onConfirm({ spendInspiration: false });
    }
  };

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle={pending.title || 'Ganho de Cubo Musical'}
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Escolha de Cubo do Saco Principal"
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
          background: 'linear-gradient(165deg, #1f150a 0%, #120c06 100%)',
          border: '2px solid #f3c343',
          borderRadius: 16,
          padding: '24px',
          maxWidth: 520,
          width: '96%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(243,195,67,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#f0ede8',
        }}
      >
        {/* Cabeçalho */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
              🎲 Saco Principal • {player.name}
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 20, color: '#fff', fontWeight: 800 }}>
              {pending.title || 'Ganho de Cubo Musical!'}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#c2ab8f', lineHeight: 1.4 }}>
              {pending.description || 'Você ganhou 1 cubo musical do Saco Principal para colocar no seu saco.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              color: '#f0ede8',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            title="Ocultar temporariamente o modal para ver o tabuleiro e outros jogadores"
          >
            👁️ Espiar
          </button>
        </div>

        {/* Cenário 1: Toca-Discos Ativo */}
        {hasTocaDiscos ? (
          <div style={{
            background: 'rgba(46,204,113,0.12)',
            border: '1.5px solid rgba(46,204,113,0.4)',
            borderRadius: 10,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2ecc71', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📻</span> Recurso Toca-Discos Ativo!
            </div>
            <div style={{ fontSize: 12, color: '#ebdccb' }}>
              Seu Toca-Discos permite escolher a cor do cubo livremente, sem gastar nenhuma ficha de inspiração:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
              {colors.map(color => {
                const count = mainBag[color as keyof typeof mainBag] || 0;
                const isSelected = selectedColor === color;
                const isAvailable = count > 0;

                return (
                  <button
                    key={color}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: isSelected ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.15)',
                      background: isSelected ? 'rgba(46,204,113,0.25)' : 'rgba(255,255,255,0.04)',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      opacity: isAvailable ? 1 : 0.4,
                      textAlign: 'left',
                    }}
                  >
                    <CubeToken color={color} size="md" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                        {color}
                      </div>
                      <div style={{ fontSize: 11, color: '#c2ab8f' }}>
                        {count} no saco
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Cenário 2: Escolha entre Sorteio Aleatório ou Gastar 1 Inspiração */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Opção A: Sorteio Aleatório */}
            <div
              onClick={() => setSelectedMode('random')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 10,
                border: selectedMode === 'random' ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.12)',
                background: selectedMode === 'random' ? 'rgba(243,195,67,0.15)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🎲</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    Sortear Cubo Aleatório
                  </div>
                  <div style={{ fontSize: 11.5, color: '#c2ab8f' }}>
                    Sorteia 1 cubo aleatório do saco principal sem gastar fichas (Grátis)
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: selectedMode === 'random' ? '#f3c343' : 'rgba(255,255,255,0.4)' }}>
                {selectedMode === 'random' ? '● Selecionado' : '○'}
              </div>
            </div>

            {/* Opção B: Gastar 1 Inspiração para Escolher Cor */}
            <div
              onClick={() => {
                if (hasInspiration) {
                  setSelectedMode('choose_color');
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '12px 14px',
                borderRadius: 10,
                border: selectedMode === 'choose_color' ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.12)',
                background: selectedMode === 'choose_color' ? 'rgba(243,195,67,0.15)' : 'rgba(255,255,255,0.03)',
                cursor: hasInspiration ? 'pointer' : 'not-allowed',
                opacity: hasInspiration ? 1 : 0.5,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>✨</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f3c343' }}>
                      Gastar 1 Inspiração para Escolher a Cor
                    </div>
                    <div style={{ fontSize: 11.5, color: '#c2ab8f' }}>
                      {hasInspiration
                        ? `Você possui ${player.inspiration} ficha${player.inspiration > 1 ? 's' : ''} de Inspiração`
                        : 'Você não possui fichas de Inspiração suficientes'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: selectedMode === 'choose_color' ? '#f3c343' : 'rgba(255,255,255,0.4)' }}>
                  {selectedMode === 'choose_color' ? '● Selecionado' : '○'}
                </div>
              </div>

              {/* Seletor de Cores quando a opção B está ativa */}
              {selectedMode === 'choose_color' && hasInspiration && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4, paddingTop: 8, borderTop: '1px solid rgba(243,195,67,0.2)' }}>
                  {colors.map(color => {
                    const count = mainBag[color as keyof typeof mainBag] || 0;
                    const isSelected = selectedColor === color;
                    const isAvailable = count > 0;

                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={!isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColor(color);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.15)',
                          background: isSelected ? 'rgba(243,195,67,0.25)' : 'rgba(255,255,255,0.04)',
                          cursor: isAvailable ? 'pointer' : 'not-allowed',
                          opacity: isAvailable ? 1 : 0.4,
                          textAlign: 'left',
                        }}
                      >
                        <CubeToken color={color} size="sm" />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                            {color}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#c2ab8f' }}>
                            {count} no saco
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão de Confirmação */}
        <button
          type="button"
          className="btn-primary btn-lg"
          style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, marginTop: 4 }}
          onClick={handleConfirmAction}
        >
          {hasTocaDiscos
            ? `✓ Pegar Cubo ${selectedColor} (Toca-Discos)`
            : selectedMode === 'choose_color'
              ? `✓ Pegar Cubo ${selectedColor} (Gastar 1 Inspiração)`
              : '✓ Sortear Cubo Aleatório do Saco'}
        </button>
      </div>
    </div>
  );
}
