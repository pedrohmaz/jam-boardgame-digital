/**
 * ClubHoverPreview — Modal Flutuante Centralizado para Pré-Visualização de Clubes e seus Prêmios
 * Renderiza via React Portal no document.body para visualização limpa e desobstruída.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { ClubDef, ClubReward } from '../../types/board';
import type { PlayerState } from '../../types/game';
import { PointsIcon, ClubBadgeIcon } from './GameIcons';
import ClubRewardIcon from './ClubRewardIcon';

interface ClubHoverPreviewProps {
  club: ClubDef;
  rewards: ClubReward[];
  players: PlayerState[];
  children: React.ReactNode;
}

export default function ClubHoverPreview({
  club,
  rewards,
  players,
  children,
}: ClubHoverPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{ display: 'inline-block', cursor: 'pointer' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(3px)',
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            style={{
              width: 440,
              maxWidth: '92vw',
              maxHeight: '90vh',
              background: 'linear-gradient(165deg, #1b1208 0%, #100a04 100%)',
              border: '2.5px solid #f3c343',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(243,195,67,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              pointerEvents: 'auto',
              color: '#f0ede8',
            }}
          >
            {/* Cabeçalho do Clube */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
              <ClubBadgeIcon clubId={club.id} size={42} />
              <div>
                <div style={{ fontSize: 11, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Clube Noturno de Jazz
                </div>
                <h3 style={{ margin: 0, fontSize: 20, color: '#fff', fontWeight: 800 }}>
                  {club.name}
                </h3>
              </div>
            </div>

            {/* Requisitos e Metas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: '10px 8px',
              textAlign: 'center',
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#c2ab8f', textTransform: 'uppercase' }}>Renome Mínimo</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f3c343', marginTop: 2 }}>{club.minRenown}+</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#c2ab8f', textTransform: 'uppercase' }}>Lotação Máx</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{club.maxCapacity} pub</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#c2ab8f', textTransform: 'uppercase' }}>Meta de Sucesso</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#2ecc71', marginTop: 2 }}>{club.successThreshold} pts</div>
              </div>
            </div>

            {/* Slots de Prêmios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f3c343', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                🏆 Prêmios de Apresentação (Slots de Cubos):
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rewards.map((r, i) => {
                  const claimingPlayer = r.claimedByPlayerId
                    ? players.find(p => p.id === r.claimedByPlayerId)
                    : null;
                  const isClaimed = !!claimingPlayer;

                  return (
                    <div
                      key={r.id || i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: isClaimed ? 'rgba(0,0,0,0.4)' : 'rgba(243,195,67,0.08)',
                        border: isClaimed ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(243,195,67,0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ClubRewardIcon reward={r} size={20} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isClaimed ? '#a09080' : '#fff' }}>
                            Slot {i + 1}: {r.label}
                          </span>
                          <span style={{ fontSize: 11, color: isClaimed ? '#7a6a5e' : '#c2ab8f' }}>
                            {r.description}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isClaimed ? (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: getPlayerColorHex(claimingPlayer.color),
                            background: 'rgba(0,0,0,0.5)',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: `1px solid ${getPlayerColorHex(claimingPlayer.color)}`,
                          }}>
                            🔒 {claimingPlayer.name}
                          </span>
                        ) : (
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#2ecc71',
                            background: 'rgba(46,204,113,0.15)',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px solid rgba(46,204,113,0.3)',
                          }}>
                            Disponível
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Opção Padrão Sempre Disponível */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(56,189,248,0.08)',
                    border: '1px dashed rgba(56,189,248,0.4)',
                    marginTop: 2,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <PointsIcon size={14} /> (1 Ponto de Vitória)
                    </span>
                    <span style={{ fontSize: 11, color: '#c2ab8f' }}>
                      Opção sempre disponível em qualquer clube ou se todos os slots forem ocupados
                    </span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#38bdf8' }}>
                    Ilimitado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function getPlayerColorHex(color: string): string {
  const map: Record<string, string> = {
    orange: '#e67e22',
    pink: '#e84393',
    green: '#27ae60',
    brown: '#8d5524',
    gray: '#7f8c8d',
  };
  return map[color] || '#c9922b';
}
