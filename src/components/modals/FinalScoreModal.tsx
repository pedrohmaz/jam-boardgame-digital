/**
 * FinalScoreModal — Modal completo de Pontuação Final e Preview de Placar
 *
 * Modos:
 * 1. 'game_over': Exibido no fim da partida, com congratulações ao vencedor, espiar tabuleiro e voltar ao menu.
 * 2. 'preview': Aberto pelo botão no TopBar a qualquer momento para conferir a projeção dos pontos.
 */

import { useState } from 'react';
import type { GameState } from '../../types/game';
import { GameEngine, type FinalScoreBreakdown } from '../../engine/gameEngine';
import { CoinIcon, PointsIcon, RenownIcon, InspirationIcon } from '../common/GameIcons';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface FinalScoreModalProps {
  gameState: GameState;
  mode: 'game_over' | 'preview';
  onClose: () => void;
  onResetGame?: () => void;
}

export default function FinalScoreModal({
  gameState,
  mode,
  onClose,
  onResetGame,
}: FinalScoreModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const scores: FinalScoreBreakdown[] = GameEngine.calculateFinalScores(gameState);
  const winner = scores[0];
  const activeBreakdown = scores.find(s => s.playerId === (selectedPlayerId || winner?.playerId)) || scores[0];

  const isGameOver = mode === 'game_over';

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle={isGameOver ? 'Fim de Jogo: Placar Final' : 'Preview da Pontuação Final'}
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => {
        if (e.target === e.currentTarget && !isGameOver) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={isGameOver ? 'Modal de Fim de Jogo' : 'Preview do Placar Final'}
      style={{ zIndex: 90000 }}
    >
      <div
        className="final-score-modal"
        style={{
          maxWidth: 820,
          width: '94vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #1f140e 0%, #120b08 100%)',
          border: '2px solid #c9922b',
          borderRadius: 16,
          boxShadow: '0 25px 70px rgba(0,0,0,0.95), 0 0 40px rgba(201,146,43,0.35)',
          color: '#f0ede8',
          overflow: 'hidden',
        }}
      >
        {/* ── CABEÇALHO ────────────────────────────────────────── */}
        <div
          style={{
            padding: '16px 20px',
            background: isGameOver
              ? 'linear-gradient(135deg, rgba(201,146,43,0.3) 0%, rgba(30,20,10,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(20,15,10,0.95) 100%)',
            borderBottom: '1px solid rgba(201,146,43,0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26 }}>{isGameOver ? '🏆' : '📊'}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f3c343', fontWeight: 800 }}>
                  {isGameOver ? 'Fim de Jogo: Placar Final!' : 'Projeção da Pontuação Final (Preview)'}
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#ebdccb' }}>
                  {isGameOver
                    ? `Parabéns ao grande vencedor: ${winner?.playerName}!`
                    : 'Confira em tempo real a projeção dos pontos de vitória de cada jogador'}
                </p>
              </div>
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
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Ocultar temporariamente o modal para espiar o tabuleiro"
            >
              👁️ Espiar Tabuleiro
            </button>
            {!isGameOver && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Fechar"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ebdccb',
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── CONTEÚDO SCROLLÁVEL ───────────────────────────────── */}
        <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Card do Vencedor (quando Game Over) */}
          {isGameOver && winner && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(243,195,67,0.2) 0%, rgba(201,146,43,0.08) 100%)',
                border: '2px solid #f3c343',
                borderRadius: 12,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(243,195,67,0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 36 }}>👑</span>
                <div>
                  <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#f3c343', fontWeight: 800, letterSpacing: 1 }}>
                    Campeão da Temporada
                  </span>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                    {winner.playerName}
                  </div>
                  <div style={{ fontSize: 12, color: '#ebdccb', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CoinIcon size={13} />
                    <span>{winner.coins} moedas de desempate • {winner.totalDiscs} discos gravados</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#f3c343', fontWeight: 700 }}>PONTUAÇÃO TOTAL</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#f3c343', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <PointsIcon size={26} />
                  <span>{winner.totalScore}</span>
                </div>
              </div>
            </div>
          )}

          {/* Abas / Botões de seleção de jogador */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {scores.map((s, idx) => {
              const isSelected = s.playerId === activeBreakdown.playerId;
              const rankColor = idx === 0 ? '#f3c343' : idx === 1 ? '#e0e0e0' : idx === 2 ? '#cd7f32' : '#8a7a6e';

              return (
                <button
                  key={s.playerId}
                  type="button"
                  onClick={() => setSelectedPlayerId(s.playerId)}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? rankColor : 'rgba(255,255,255,0.12)'}`,
                    background: isSelected ? `linear-gradient(135deg, ${rankColor}25, rgba(0,0,0,0.5))` : 'rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: rankColor,
                        color: '#000',
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {s.rank}º
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#fff' : '#c2ab8f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
                      {s.playerName}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: rankColor, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <PointsIcon size={14} />
                    {s.totalScore}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── DETALHAMENTO DO JOGADOR SELECIONADO ───────────────── */}
          <div
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f3c343' }}>
                Detalhamento dos Critérios: {activeBreakdown.playerName}
              </span>
              <span style={{ fontSize: 13, color: '#38bdf8', fontWeight: 800 }}>
                Total: {activeBreakdown.totalScore} Pontos de Vitória
              </span>
            </div>

            {/* Grid de 6 Critérios Oficiais */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              
              {/* 1. Pontos da Partida */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <PointsIcon size={14} />
                  <span>1. PONTOS NA PARTIDA</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  +{activeBreakdown.gameScore} VP
                </div>
                <div style={{ fontSize: 11, color: '#ebdccb' }}>
                  Apresentações nos clubes, objetivos e gravações.
                </div>
              </div>

              {/* 2. Cartas de Recurso & Instrumentos */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#a89d91', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>📜 2. RECURSOS & INSTRUMENTOS</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  +{activeBreakdown.resourcesVP + activeBreakdown.instrumentBonusVP} VP
                </div>
                <div style={{ fontSize: 11, color: '#ebdccb' }}>
                  {activeBreakdown.resourcesVP} VP impressos + {activeBreakdown.instrumentBonusVP} VP de efeitos finais.
                </div>
              </div>

              {/* 3. Majoritária de Discos */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#f1c40f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>💿 3. MAIORIA DE DISCOS GRAVADOS</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  +{activeBreakdown.discsVP} VP
                </div>
                <div style={{ fontSize: 11, color: '#ebdccb' }}>
                  {activeBreakdown.discRankText} (5/3/1 pts).
                </div>
              </div>

              {/* 4. Renome */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#f39c12', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <RenownIcon size={14} />
                  <span>4. RENOME (1 VP A CADA 2)</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  +{activeBreakdown.renownVP} VP
                </div>
                <div style={{ fontSize: 11, color: '#ebdccb' }}>
                  {activeBreakdown.renown} de Renome atual.
                </div>
              </div>

              {/* 5. Moedas */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#f1c40f', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CoinIcon size={14} />
                  <span>5. MOEDAS (1 VP A CADA 5)</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  +{activeBreakdown.coinsVP} VP
                </div>
                <div style={{ fontSize: 11, color: '#ebdccb' }}>
                  {activeBreakdown.coins} Moedas acumuladas.
                </div>
              </div>

              {/* 6. Inspiração */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, color: '#2ecc71', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <InspirationIcon size={14} />
                  <span>6. INSPIRAÇÃO NÃO GASTA</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                  +{activeBreakdown.inspirationVP} VP
                </div>
                <div style={{ fontSize: 11, color: '#ebdccb' }}>
                  {activeBreakdown.inspiration} ficha(s) de Inspiração (1 VP cada).
                </div>
              </div>

            </div>

            {/* Detalhes de cartas de instrumentos se houver */}
            {(activeBreakdown.details.resourcesList.length > 0 || activeBreakdown.details.instrumentsList.length > 0) && (
              <div style={{ marginTop: 4, background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#f3c343', marginBottom: 4 }}>
                  Cartas de Recursos & Instrumentos com Pontuação:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {activeBreakdown.details.resourcesList.map((r, i) => (
                    <div key={`res_${i}`} style={{ fontSize: 11, color: '#ebdccb', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📜 {r.name}:</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>+{r.vp} VP</span>
                    </div>
                  ))}
                  {activeBreakdown.details.instrumentsList.map((ins, i) => (
                    <div key={`ins_${i}`} style={{ fontSize: 11, color: '#ebdccb', display: 'flex', justifyContent: 'space-between' }}>
                      <span>🎷 {ins.name} ({ins.description}):</span>
                      <span style={{ color: '#2ecc71', fontWeight: 700 }}>+{ins.vp} VP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RODAPÉ ───────────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(0,0,0,0.65)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: isGameOver ? 'space-between' : 'flex-end',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {isGameOver && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => setIsMinimized(true)}
              style={{ padding: '10px 18px', fontSize: 14, fontWeight: 600 }}
            >
              👁️ Espiar Tabuleiro Final
            </button>
          )}

          {isGameOver ? (
            <button
              id="return-to-menu-btn"
              type="button"
              className="btn-primary btn-lg"
              onClick={onResetGame}
              style={{ padding: '10px 24px', fontSize: 15, fontWeight: 800 }}
            >
              🔄 Voltar ao Menu Inicial
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={onClose}
              style={{ padding: '8px 20px', fontSize: 14, fontWeight: 700 }}
            >
              Fechar Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
