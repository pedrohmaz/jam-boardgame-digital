/**
 * Dice3D — Dado estilizado do jogador
 * Mostra o valor do dado (1-6) com face visual e animação de rolar.
 */

import { useState, useEffect, useRef } from 'react';

interface Dice3DProps {
  value: number;       // 1-6
  size?: number;       // px
  animate?: boolean;   // true para rolar antes de mostrar o valor
  onRollEnd?: (value: number) => void;
  color?: string;
}

// Pontos do dado para cada face (posições relativas em grid 3x3)
const DOT_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export default function Dice3D({ value, size = 56, animate = false, onRollEnd, color = '#c9922b' }: Dice3DProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isRolling, setIsRolling] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    setIsRolling(true);
    let count = 0;
    const total = 12;

    intervalRef.current = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= total) {
        clearInterval(intervalRef.current!);
        setDisplayValue(value);
        setIsRolling(false);
        onRollEnd?.(value);
      }
    }, 60);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [value, animate]);

  const dotSize = Math.round(size * 0.14);
  const dotPositions = DOT_POSITIONS[displayValue] ?? DOT_POSITIONS[1];

  return (
    <div
      className={`dice3d ${isRolling ? 'dice3d--rolling' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.18),
        background: `linear-gradient(145deg, #f5f0e8 0%, #e0d8c8 100%)`,
        border: `2px solid ${color}`,
        boxShadow: `
          0 4px 8px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.6),
          inset 0 -2px 4px rgba(0,0,0,0.15)
        `,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        padding: Math.round(size * 0.1),
        gap: Math.round(size * 0.04),
        userSelect: 'none',
        flexShrink: 0,
        transition: 'transform 0.1s ease',
        transform: isRolling ? 'rotate(5deg) scale(1.05)' : 'rotate(0deg) scale(1)',
      }}
      role="img"
      aria-label={`Dado: ${displayValue}`}
    >
      {Array.from({ length: 9 }, (_, idx) => (
        <div
          key={idx}
          style={{
            borderRadius: '50%',
            backgroundColor: dotPositions.includes(idx) ? color : 'transparent',
            width: dotSize,
            height: dotSize,
            margin: 'auto',
            boxShadow: dotPositions.includes(idx)
              ? `0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`
              : 'none',
            transition: 'background-color 0.05s ease',
          }}
        />
      ))}
    </div>
  );
}
