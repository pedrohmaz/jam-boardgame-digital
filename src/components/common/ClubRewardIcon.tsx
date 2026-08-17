/**
 * ClubRewardIcon — Renderizador de ícones para prêmios de clubes de Jazz
 * Exibe ícones temáticos para Renome, Habilidade, Moedas, Pontos de Vitória, Estilos ou Combos.
 */

import { PointsIcon, CoinIcon, RenownIcon, SkillIcon } from './GameIcons';
import type { ClubReward } from '../../types/board';

interface ClubRewardIconProps {
  reward?: Partial<ClubReward> | null;
  type?: string;
  items?: { type: string; amount: number }[];
  size?: number;
}

export default function ClubRewardIcon({
  reward,
  type,
  items,
  size = 18,
}: ClubRewardIconProps) {
  const rewardType = reward?.type || type || 'vp';
  const rewardItems = reward?.items || items;

  if (rewardType === 'compound' && rewardItems && rewardItems.length > 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {rewardItems.map((item, idx) => (
          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {idx > 0 && <span style={{ fontSize: size * 0.7, color: '#f3c343', fontWeight: 800 }}>+</span>}
            <ClubRewardIcon type={item.type} size={size} />
          </span>
        ))}
      </span>
    );
  }

  if (rewardType === 'renown') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          padding: '1px 4px',
          borderRadius: 4,
          background: 'rgba(230, 126, 34, 0.2)',
          border: '1px solid #e67e22',
        }}
        title="Renome (+1)"
      >
        <RenownIcon size={size} />
      </span>
    );
  }

  if (rewardType === 'skill') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          padding: '1px 4px',
          borderRadius: 4,
          background: 'rgba(133, 28, 46, 0.25)',
          border: '1px solid #851c2e',
        }}
        title="Habilidade (+1 passo)"
      >
        <SkillIcon size={size} />
      </span>
    );
  }

  if (rewardType === 'coins') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          padding: '1px 4px',
          borderRadius: 4,
          background: 'rgba(241, 196, 15, 0.2)',
          border: '1px solid #f1c40f',
        }}
        title="Moedas"
      >
        <CoinIcon size={size} />
      </span>
    );
  }

  if (rewardType === 'vp') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          padding: '1px 4px',
          borderRadius: 4,
          background: 'rgba(56, 189, 248, 0.2)',
          border: '1px solid #38bdf8',
        }}
        title="Pontos de Vitória"
      >
        <PointsIcon size={size} />
      </span>
    );
  }

  if (rewardType === 'style') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size + 4,
          height: size + 4,
          borderRadius: 4,
          background: 'rgba(155, 89, 182, 0.25)',
          border: '1px solid #9b59b6',
          fontSize: size * 0.75,
        }}
        title="Carta de Estilo"
      >
        🎴
      </span>
    );
  }

  return <PointsIcon size={size} />;
}
