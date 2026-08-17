/**
 * CubeToken — Cubo musical estilizado (componente reutilizável)
 * Representa os cubos coloridos do saco do jogador com cores vivas e realce 3D.
 */

import type { NoteColor } from '../../types/cards';

interface CubeTokenProps {
  color: NoteColor;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
}

export const COLOR_DATA: Record<NoteColor, { bg: string; border: string; highlight: string; label: string; emoji: string }> = {
  red:    { bg: '#ff4757', border: '#e84118', highlight: '#ff6b81', label: 'Vermelho', emoji: '🔴' },
  blue:   { bg: '#2e86de', border: '#0984e3', highlight: '#54a0ff', label: 'Azul',     emoji: '🔵' },
  yellow: { bg: '#ffd32a', border: '#cf9f02', highlight: '#fff9a6', label: 'Amarelo',  emoji: '🟡' },
  purple: { bg: '#a55eea', border: '#8854d0', highlight: '#d6a2e8', label: 'Roxo',     emoji: '🟣' },
  white:  { bg: '#ffffff', border: '#dcdde1', highlight: '#f5f6fa', label: 'Branco',   emoji: '⚪' },
  wild:   { bg: '#747d8c', border: '#57606f', highlight: '#a4b0be', label: 'Coringa',  emoji: '⚫' },
};

const SIZE_MAP = {
  sm: 18,
  md: 24,
  lg: 34,
};

export default function CubeToken({
  color,
  size = 'md',
  count,
  selectable = false,
  selected = false,
  onClick,
  className = '',
  title,
}: CubeTokenProps) {
  const data = COLOR_DATA[color] ?? COLOR_DATA.wild;
  const px = SIZE_MAP[size];
  const borderRadius = Math.round(px * 0.22);

  const style: React.CSSProperties = {
    width: px,
    height: px,
    backgroundColor: data.bg,
    border: `2px solid ${selected ? '#f1c40f' : data.border}`,
    borderRadius,
    boxShadow: selected
      ? `0 0 10px #f1c40f, inset 0 2px 3px rgba(255,255,255,0.6), 2px 3px 6px rgba(0,0,0,0.5)`
      : `0 0 6px ${data.bg}55, inset 0 2px 3px rgba(255,255,255,0.5), 2px 3px 6px rgba(0,0,0,0.35)`,
    cursor: selectable ? 'pointer' : 'default',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    transform: selected ? 'scale(1.18) translateY(-2px)' : 'scale(1)',
    padding: 0,
    background: `linear-gradient(135deg, ${data.highlight} 0%, ${data.bg} 55%, ${data.border} 100%)`,
    boxSizing: 'border-box',
  };

  const countBadge = count && count > 1 ? (
    <span
      style={{
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: '#1a1008',
        color: '#c9922b',
        fontSize: Math.max(9, px * 0.38) + 'px',
        fontWeight: 'bold',
        width: Math.max(14, px * 0.55) + 'px',
        height: Math.max(14, px * 0.55) + 'px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #c9922b',
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  ) : null;

  if (selectable) {
    return (
      <button
        type="button"
        className={`cube-token cube-token--${size} cube-token--selectable ${selected ? 'cube-token--selected' : ''} ${className}`}
        style={style}
        onClick={onClick}
        title={title ?? `${data.label}${count ? ` (${count})` : ''}`}
        aria-label={`${data.label}${count ? ` (${count})` : ''}`}
      >
        {countBadge}
      </button>
    );
  }

  return (
    <span
      className={`cube-token cube-token--${size} ${className}`}
      style={style}
      title={title ?? `${data.label}${count ? ` (${count})` : ''}`}
      aria-label={`${data.label}${count ? ` (${count})` : ''}`}
    >
      {countBadge}
    </span>
  );
}

export function CubeBag({ bag, size = 'sm' }: { bag: NoteColor[]; size?: 'sm' | 'md' }) {
  const counts: Partial<Record<NoteColor, number>> = {};
  bag.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
  const uniqueColors = Object.keys(counts) as NoteColor[];

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {uniqueColors.map(color => (
        <CubeToken key={color} color={color} count={counts[color]} size={size} />
      ))}
      {uniqueColors.length === 0 && (
        <span style={{ fontSize: 10, color: '#8a7a6e', fontStyle: 'italic' }}>Saco vazio</span>
      )}
    </div>
  );
}
