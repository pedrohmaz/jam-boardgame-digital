/**
 * BicicletaDecisionModal — Modal de decisão da Bicicleta (Recurso 14)
 * 
 * Regra:
 * "Quando um jogador precisar lhe pagar uma moeda, você pode recusar e ganhar um tempo no lugar. (limite: 1 vez por rodada)"
 */

import { useState } from 'react';
import type { GameState, PendingBicicletaDecision } from '../../types/game';
import BoardPeekBanner from '../common/BoardPeekBanner';
import { CoinIcon } from '../common/GameIcons';
import { BOARD_LOCATIONS } from '../../types/board';

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

interface BicicletaDecisionModalProps {
  decision: PendingBicicletaDecision;
  gameState: GameState;
  onResolve: (waiveFee: boolean) => void;
}

export default function BicicletaDecisionModal({
  decision,
  gameState,
  onResolve,
}: BicicletaDecisionModalProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  const owner = gameState.players[decision.ownerPlayerIndex];
  const visiting = gameState.players[decision.visitingPlayerIndex];
  const locName = BOARD_LOCATIONS.find(l => l.index === decision.targetLocation)?.name || `Local ${decision.targetLocation}`;

  if (!owner || !visiting) return null;

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle="Decisão da Bicicleta"
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Decisão da Bicicleta">
      <div
        className="bicicleta-modal"
        style={{
          background: 'linear-gradient(160deg, #1a162b 0%, #0d0b17 100%)',
          border: '2px solid #a855f7',
          borderRadius: 16,
          padding: '24px 28px',
          maxWidth: 580,
          width: '94%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(168,85,247,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>
              <span>🚲</span>
              <span>Recurso 14 • Bicicleta</span>
            </div>
            <h2 style={{ fontSize: 22, color: '#fff', margin: '10px 0 0', fontWeight: 800 }}>
              Decisão de Taxa de Visita
            </h2>
          </div>
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => setIsMinimized(true)}
            style={{ fontSize: 12, padding: '4px 10px', color: '#c2ab8f', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            👁️ Espiar Tabuleiro
          </button>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '14px 16px',
          fontSize: 14,
          color: '#ebdccb',
          lineHeight: 1.5,
        }}>
          <p style={{ margin: 0 }}>
            <strong style={{ color: getPlayerColorHex(visiting.color) }}>{visiting.name}</strong> está entrando em <strong>{locName}</strong>, onde você (<strong style={{ color: getPlayerColorHex(owner.color) }}>{owner.name}</strong>) já está presente!
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: '#a89d91' }}>
            Como dono da <strong>Bicicleta</strong>, você pode escolher receber a taxa de 1 moeda normalmente OU recusar a moeda e avançar seu marcador de tempo em <strong>+1 Tempo</strong> (economizando a moeda para {visiting.name}).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            type="button"
            onClick={() => onResolve(false)}
            style={{
              padding: '16px 14px',
              borderRadius: 12,
              background: 'rgba(243,195,67,0.1)',
              border: '2px solid rgba(243,195,67,0.4)',
              color: '#f3c343',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700 }}>
              <CoinIcon size={20} />
              <span>Receber 1 Moeda</span>
            </div>
            <div style={{ fontSize: 12, color: '#ebdccb' }}>
              Você ganha +1 moeda de {visiting.name} normalmente.
            </div>
          </button>

          <button
            type="button"
            onClick={() => onResolve(true)}
            style={{
              padding: '16px 14px',
              borderRadius: 12,
              background: 'rgba(168,85,247,0.15)',
              border: '2px solid #a855f7',
              color: '#c084fc',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700 }}>
              <span style={{ fontSize: 20 }}>⏱️</span>
              <span>Ganhar +1 Tempo</span>
            </div>
            <div style={{ fontSize: 12, color: '#ebdccb' }}>
              Você ganha +1 Tempo no dado (máx 6) e {visiting.name} não paga a moeda.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
