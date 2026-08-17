/**
 * CardHoverPreview — Modal Flutuante Centralizado e Ampliado para Pré-Visualização de Cartas
 * Utiliza React Portal para renderizar no topo de toda a aplicação (document.body),
 * garantindo que nunca fique cortado por nenhum overflow ou elemento da tela.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { MusicianCard, ResourceCard, EventCard, StyleCard, ObjectiveCard } from '../../types/cards';
import { PointsIcon, CoinIcon } from './GameIcons';

interface CardHoverPreviewProps {
  musician?: MusicianCard | null;
  resource?: ResourceCard | null;
  event?: EventCard | null;
  objective?: ObjectiveCard | null;
  style?: StyleCard | null;
  children: React.ReactNode;
}

export default function CardHoverPreview({ musician, resource, event, objective, style, children }: CardHoverPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!musician && !resource && !event && !objective && !style) {
    return <>{children}</>;
  }

  return (
    <div
      style={{ display: 'inline-block', cursor: 'zoom-in' }}
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
              width: 380,
              maxWidth: '92vw',
              maxHeight: '90vh',
              background: '#181109',
              border: '3px solid #f1c40f',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(241,196,15,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              pointerEvents: 'auto',
              color: '#f0ede8',
            }}
          >
            {musician && (
              <>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#0c0804',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {musician.image ? (
                    <img
                      src={musician.image}
                      alt={musician.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: 54 }}>🎷</span>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.85)',
                    color: '#f3c343',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid #f3c343',
                  }}>
                    Nível {musician.level}
                  </div>
                  {musician.cost > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#c9922b',
                      color: '#000',
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <CoinIcon size={14} />
                      {musician.cost} Moedas
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>
                  {musician.name}
                </div>

                {musician.specialRule && (
                  <div style={{
                    fontSize: 13,
                    color: '#f3c343',
                    background: 'rgba(243,195,67,0.15)',
                    border: '1px solid rgba(243,195,67,0.35)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    textAlign: 'center',
                    lineHeight: 1.4,
                    fontWeight: 600,
                  }}>
                    {musician.specialRule.description}
                  </div>
                )}

                <div style={{
                  fontSize: 13,
                  color: '#ebdccb',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <div>
                    <strong>Notas:</strong> {musician.notes.map(n => n.color === 'wild' ? 'Qualquer Cor' : n.color).join(' • ')}
                  </div>
                  <div style={{ color: '#38bdf8', fontWeight: 700 }}>
                    Pontuação Máxima: {musician.notes.reduce((s, n) => s + n.points, 0)} Pontos
                  </div>
                </div>
              </>
            )}

            {resource && (
              <>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#0c0804',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {resource.image ? (
                    <img
                      src={resource.image}
                      alt={resource.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: 54 }}>📦</span>
                  )}
                  {resource.cost > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: '#c9922b',
                      color: '#000',
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <CoinIcon size={14} />
                      {resource.cost} Moedas
                    </div>
                  )}
                  {resource.victoryPoints > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#38bdf8',
                      color: '#000',
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <PointsIcon size={14} />
                      +{resource.victoryPoints} VP
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>
                  {resource.name}
                </div>

                <div style={{
                  fontSize: 13.5,
                  color: '#ebdccb',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  lineHeight: 1.45,
                  textAlign: 'center',
                }}>
                  {resource.description}
                </div>
              </>
            )}

            {event && (
              <>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#0c0804',
                  border: '1px solid rgba(243,195,67,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: 54 }}>🎭</span>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.85)',
                    color: '#f3c343',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid #f3c343',
                  }}>
                    Carta de Evento
                  </div>
                </div>

                <div style={{ fontSize: 18, fontWeight: 800, color: '#f3c343', textAlign: 'center' }}>
                  {event.name}
                </div>

                <div style={{
                  fontSize: 13.5,
                  color: '#ebdccb',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  lineHeight: 1.45,
                  textAlign: 'center',
                }}>
                  {event.description}
                </div>
              </>
            )}

            {objective && (
              <>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#0c0804',
                  border: '1px solid rgba(243,195,67,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {objective.image ? (
                    <img
                      src={objective.image}
                      alt={objective.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: 54 }}>🎯</span>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.85)',
                    color: '#f3c343',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid #f3c343',
                  }}>
                    Carta de Objetivo Secreto
                  </div>
                </div>

                <div style={{ fontSize: 18, fontWeight: 800, color: '#f3c343', textAlign: 'center' }}>
                  {objective.name}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {objective.goals.map((g, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 12,
                        color: '#ebdccb',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        padding: '6px 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span><strong>{idx + 1}º:</strong> {g.description}</span>
                      <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                        {idx === 0 ? '+2 VP & Estilo' : idx === 1 ? '+3 VP' : '+5 VP & Estilo'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {style && (
              <>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: 240,
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#0c0804',
                  border: '1px solid rgba(243,195,67,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {style.image ? (
                    <img
                      src={style.image}
                      alt={style.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: 54 }}>✨</span>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.85)',
                    color: '#f3c343',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid #f3c343',
                  }}>
                    Estilo Musical
                  </div>
                </div>

                <div style={{ fontSize: 18, fontWeight: 800, color: '#f3c343', textAlign: 'center' }}>
                  {style.name}
                </div>

                <div style={{
                  fontSize: 13.5,
                  color: '#ebdccb',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  lineHeight: 1.45,
                  textAlign: 'center',
                }}>
                  {style.description}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
