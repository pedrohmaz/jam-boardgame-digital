/**
 * InitialMusicianDraftModal — Modal de Escolha do Músico Inicial (Ordem Reversa de Turno)
 * Permite a cada jogador, começando pelo último jogador e terminando no primeiro jogador,
 * escolher 1 músico entre os 4 músicos de Nível 0 disponíveis.
 */

import { useState } from 'react';
import type { GameState, PlayerState } from '../../types/game';
import MusicianCardComponent from '../player/MusicianCard';
import BoardPeekBanner from '../common/BoardPeekBanner';
import { CoinIcon } from '../common/GameIcons';

interface InitialMusicianDraftModalProps {
  gameState: GameState;
  onSelectMusician: (musicianId: string) => void;
}

export default function InitialMusicianDraftModal({
  gameState,
  onSelectMusician,
}: InitialMusicianDraftModalProps) {
  const [selectedMusicianId, setSelectedMusicianId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const draftQueue = gameState.draftPlayerIndices || [];
  if (draftQueue.length === 0) return null;

  const currentDraftPlayerIdx = draftQueue[0];
  const currentPlayer: PlayerState = gameState.players[currentDraftPlayerIdx];
  const availableMusicians = gameState.availableStartingMusicians || [];

  const handleConfirm = () => {
    if (!selectedMusicianId) return;
    onSelectMusician(selectedMusicianId);
    setSelectedMusicianId(null);
  };

  const chosenMusician = availableMusicians.find(m => m.id === selectedMusicianId);

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle="Escolha de Músico Inicial"
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Escolha do Músico Inicial"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(165deg, #1e1509 0%, #120c06 100%)',
          border: '2px solid #f3c343',
          borderRadius: 16,
          padding: '24px',
          maxWidth: 780,
          width: '96%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(243,195,67,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#f0ede8',
          maxHeight: '94vh',
          overflowY: 'auto',
        }}
      >
        {/* Cabeçalho */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
              Início de Partida • Draft de Músicos Iniciais
            </div>
            <h2 style={{ margin: 0, fontSize: 22, color: '#fff', fontWeight: 800 }}>
              Escolha seu Músico Inicial
            </h2>
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
              title="Ocultar temporariamente o modal para ver o tabuleiro e outros jogadores"
            >
              👁️ Espiar Tabuleiro
            </button>
            <div style={{ background: 'rgba(243,195,67,0.15)', border: '1px solid #f3c343', padding: '4px 12px', borderRadius: 12, fontSize: 12, color: '#f3c343', fontWeight: 700 }}>
              Ordem Reversa: {currentPlayer.name} ({draftQueue.length} restante{draftQueue.length > 1 ? 's' : ''})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <p style={{ fontSize: 13.5, color: '#c2ab8f', margin: 0, lineHeight: 1.4 }}>
            A escolha dos músicos iniciais (Nível 0) ocorre em <strong>ordem reversa de turno</strong> e o custo do músico é pago com as moedas iniciais.
          </p>
          <div style={{ fontSize: 12.5, color: '#f1c40f', background: 'rgba(241,196,15,0.12)', border: '1px solid rgba(241,196,15,0.3)', padding: '3px 10px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span>Seu saldo atual:</span>
            <CoinIcon size={14} />
            <strong>{currentPlayer.coins} moedas</strong>
          </div>
        </div>

        {/* Grade com os músicos disponíveis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, alignItems: 'stretch' }}>
          {availableMusicians.map(musician => {
            const isSelected = selectedMusicianId === musician.id;
            const musicianInPlay = { ...musician, filledNotes: [] };

            return (
              <div
                key={musician.id}
                onClick={() => setSelectedMusicianId(musician.id)}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '3px solid #f3c343' : '1.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  padding: 8,
                  background: isSelected ? 'rgba(243,195,67,0.15)' : 'rgba(255,255,255,0.03)',
                  boxShadow: isSelected ? '0 0 20px rgba(243,195,67,0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                  <span style={{ fontWeight: 700, color: isSelected ? '#f3c343' : '#fff' }}>
                    {isSelected ? '✓ Selecionado' : 'Selecionar'}
                  </span>
                  <span style={{ color: '#f1c40f', display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700 }}>
                    <CoinIcon size={12} /> {musician.cost} moedas
                  </span>
                </div>
                <MusicianCardComponent
                  musician={musicianInPlay}
                  disableHoverPreview={true}
                />
              </div>
            );
          })}
        </div>

        {/* Botão de Confirmação */}
        <button
          type="button"
          disabled={!selectedMusicianId}
          className="btn-primary btn-lg"
          style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, marginTop: 6 }}
          onClick={handleConfirm}
        >
          {chosenMusician
            ? `✓ Pagar ${chosenMusician.cost} moedas e Contratar ${chosenMusician.name} para ${currentPlayer.name}`
            : 'Selecione um músico acima para continuar'}
        </button>
      </div>
    </div>
  );
}
