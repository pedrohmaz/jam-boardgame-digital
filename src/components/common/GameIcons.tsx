/**
 * GameIcons — Ícones SVG padronizados, nítidos e temáticos para o JAM Board Game
 * 
 * Padrão Oficial do Jogo:
 * - Pontos: Clave de Sol Azul Clara (PointsIcon)
 * - Habilidade: Semínima Bordô (SkillIcon)
 * - Renome: Estrela Amarelo Alaranjado (RenownIcon)
 * - Inspiração: Lâmpada Verde (InspirationIcon)
 * - Moedas: Moeda D Ouro Vintage (CoinIcon)
 * - Clubes: Badges vetoriais temáticos (ClubBadgeIcon)
 */

import React from 'react';
import type { ClubId } from '../../types/board';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 1. Pontos de Vitória — Clave de Sol Azul Clara
 */
export function PointsIcon({ size = 18, className = '', style }: IconProps) {
  const width = Math.max(10, Math.round(size * 0.6));
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`game-icon points-icon ${className}`}
      style={{
        verticalAlign: 'middle',
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
      aria-label="Pontos de Vitória (Clave de Sol Azul Clara)"
    >
      {/* Glow azul claro suave */}
      <ellipse cx="7" cy="12" rx="6.5" ry="11" fill="#38bdf8" opacity="0.18" />

      {/* Clave de Sol proporcional e elegante */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.4 1.5C7.2 1.5 6.9 1.9 6.7 2.6C6.1 4.4 5.3 7.1 5.3 9.4C5.3 10.9 5.8 12.2 6.8 12.9C5.4 13.4 4.5 14.7 4.5 16.3C4.5 18.5 6.2 20.3 8.3 20.3C10.4 20.3 12 18.7 12 16.6C12 14.8 10.6 13.3 8.8 13.3C8.6 13.3 8.4 13.3 8.2 13.4C8.2 12.7 8.4 12 8.7 11.4C9.3 10 10.1 8.8 10.7 7.4C11.2 6 11.2 4.7 10.8 3.5C10.3 2.1 9 1.5 7.4 1.5ZM7.6 3.6C8.2 3.7 8.7 4.3 8.9 5.1C9.1 5.9 8.9 6.8 8.5 7.8C8.1 8.7 7.5 9.7 7.1 10.6C6.8 10.1 6.6 9.4 6.6 8.8C6.6 6.9 7.1 5 7.6 3.6ZM8.3 14.7C9.4 14.7 10.3 15.6 10.3 16.6C10.3 17.7 9.4 18.6 8.3 18.6C7.2 18.6 6.2 17.7 6.2 16.6C6.2 15.6 7.2 14.7 8.3 14.7Z"
        fill="url(#lightBlueClefGradient)"
      />
      {/* Haste central que desce até o ponto inferior */}
      <path
        d="M7.7 1.6V21.4C7.7 22.2 7.1 22.8 6.4 22.8C5.7 22.8 5.2 22.2 5.2 21.5C5.2 20.8 5.7 20.3 6.4 20.3"
        stroke="url(#lightBlueClefGradient)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <defs>
        <linearGradient id="lightBlueClefGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * 2. Habilidade — Semínima Bordô (♩)
 */
export function SkillIcon({ size = 18, className = '', style }: IconProps) {
  const width = Math.max(10, Math.round(size * 0.7));
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`game-icon skill-icon ${className}`}
      style={{
        verticalAlign: 'middle',
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
      aria-label="Habilidade (Semínima Bordô)"
    >
      {/* Glow de fundo */}
      <ellipse cx="6" cy="18" rx="6" ry="4.5" fill="#851c2e" opacity="0.25" />

      {/* Cabeça da nota inclinada (oval) */}
      <ellipse
        cx="6"
        cy="17.5"
        rx="5.2"
        ry="3.8"
        transform="rotate(-26 6 17.5)"
        fill="url(#bordoNoteGradient)"
        stroke="#5c0916"
        strokeWidth="0.8"
      />

      {/* Brilho na cabeça */}
      <ellipse
        cx="5"
        cy="16.5"
        rx="3.2"
        ry="1.8"
        transform="rotate(-26 5 16.5)"
        fill="#ff7675"
        opacity="0.4"
      />

      {/* Haste da semínima na direita subindo */}
      <rect
        x="9.6"
        y="2.5"
        width="1.8"
        height="15"
        rx="0.9"
        fill="url(#bordoNoteGradient)"
        stroke="#5c0916"
        strokeWidth="0.4"
      />

      <defs>
        <linearGradient id="bordoNoteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="40%" stopColor="#961b2b" />
          <stop offset="85%" stopColor="#700d1b" />
          <stop offset="100%" stopColor="#4a0610" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * 3. Renome — Estrela Amarelo Alaranjado
 */
export function RenownIcon({ size = 18, className = '', style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`game-icon renown-icon ${className}`}
      style={{
        verticalAlign: 'middle',
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
      aria-label="Renome (Estrela Amarelo Alaranjado)"
    >
      {/* Glow de fundo */}
      <circle cx="12" cy="12" r="10" fill="#f39c12" opacity="0.2" />

      {/* Estrela de 5 pontas estilizada com relevo facetado */}
      <path
        d="M12 2L14.9 8.6L22 9.4L16.7 14.2L18.2 21.2L12 17.6L5.8 21.2L7.3 14.2L2 9.4L9.1 8.6L12 2Z"
        fill="url(#amberStarGradient)"
        stroke="#b85d06"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Faceta de sombra para profundidade 3D */}
      <path
        d="M12 2L12 17.6L5.8 21.2L7.3 14.2L2 9.4L9.1 8.6L12 2Z"
        fill="#d35400"
        opacity="0.28"
      />

      {/* Ponto de brilho no centro */}
      <circle cx="12" cy="11.5" r="2" fill="#ffffff" opacity="0.65" />

      <defs>
        <linearGradient id="amberStarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff176" />
          <stop offset="30%" stopColor="#fbc531" />
          <stop offset="70%" stopColor="#e67e22" />
          <stop offset="100%" stopColor="#d35400" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * 4. Inspiração — Lâmpada Verde (Ideia / Inspiração)
 */
export function InspirationIcon({ size = 18, className = '', style }: IconProps) {
  const width = Math.max(12, Math.round(size * 0.8));
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`game-icon inspiration-icon ${className}`}
      style={{
        verticalAlign: 'middle',
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
      aria-label="Inspiração (Lâmpada Verde)"
    >
      {/* Glow verde suave */}
      <ellipse cx="10" cy="9" rx="8" ry="8" fill="#2ecc71" opacity="0.25" />

      {/* Bulbo de vidro verde */}
      <path
        d="M10 2C6.1 2 3 5.1 3 9C3 11.5 4.3 13.6 6.3 14.8C6.8 15.1 7.1 15.6 7.1 16.2V17H12.9V16.2C12.9 15.6 13.2 15.1 13.7 14.8C15.7 13.6 17 11.5 17 9C17 5.1 13.9 2 10 2Z"
        fill="url(#greenBulbGradient)"
        stroke="#1b7340"
        strokeWidth="0.9"
      />

      {/* Filamento interno brilhante */}
      <path
        d="M7.8 11C7.8 8.5 8.8 7 10 7C11.2 7 12.2 8.5 12.2 11M9 11V14M11 11V14"
        stroke="#dcfce7"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Brilho no topo do vidro */}
      <ellipse cx="7.5" cy="5.5" rx="2.5" ry="1.5" transform="rotate(-30 7.5 5.5)" fill="#ffffff" opacity="0.55" />

      {/* Base de metal com rosca */}
      <rect x="7.3" y="17.5" width="5.4" height="2" rx="0.5" fill="#f1c40f" stroke="#8c6d1f" strokeWidth="0.6" />
      <rect x="8" y="20" width="4" height="1.8" rx="0.5" fill="#f39c12" stroke="#8c6d1f" strokeWidth="0.6" />
      <ellipse cx="10" cy="22.3" rx="1.5" ry="0.9" fill="#2d3436" />

      <defs>
        <radialGradient id="greenBulbGradient" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="85%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#166534" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/**
 * 5. Moeda / Dinheiro Oficial (Vintage Gold Coin com 'D' em relevo)
 */
export function CoinIcon({ size = 18, className = '', style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`game-icon coin-icon ${className}`}
      style={{ verticalAlign: 'middle', display: 'inline-block', flexShrink: 0, ...style }}
      aria-label="Moedas"
    >
      <circle cx="12" cy="12" r="10" fill="#784508" />
      <circle cx="12" cy="11.5" r="9.5" fill="url(#goldGradientOuter)" stroke="#f3c343" strokeWidth="0.8" />
      <circle cx="12" cy="11.5" r="7.5" fill="url(#goldGradientInner)" stroke="#9e7b16" strokeWidth="0.7" strokeDasharray="1.5 1.5" />
      <text
        x="12"
        y="15.2"
        textAnchor="middle"
        fontSize="10"
        fontFamily="'Cinzel', 'Playfair Display', Georgia, serif"
        fontWeight="900"
        fill="#5a3806"
        stroke="#ffd700"
        strokeWidth="0.3"
      >
        D
      </text>

      <defs>
        <radialGradient id="goldGradientOuter" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fff2a8" />
          <stop offset="40%" stopColor="#f1c40f" />
          <stop offset="85%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9e7b16" />
        </radialGradient>
        <linearGradient id="goldGradientInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3c343" />
          <stop offset="100%" stopColor="#c9922b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * 6. Ícone garantido e nítido para cada Clube de Jazz
 */
export function ClubBadgeIcon({ clubId, size = 20, className = '' }: { clubId: ClubId | string; size?: number; className?: string }) {
  if (clubId === 'mosca_frita') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`club-badge-icon ${className}`}
        style={{ verticalAlign: 'middle', display: 'inline-block', flexShrink: 0 }}
        aria-label="Mosca Frita"
      >
        <circle cx="12" cy="12" r="10" fill="#2d3436" stroke="#e17055" strokeWidth="1.2" />
        <ellipse cx="8.5" cy="9.5" rx="3.5" ry="5.5" transform="rotate(-30 8.5 9.5)" fill="#74b9ff" fillOpacity="0.7" stroke="#0984e3" strokeWidth="0.8" />
        <ellipse cx="15.5" cy="9.5" rx="3.5" ry="5.5" transform="rotate(30 15.5 9.5)" fill="#74b9ff" fillOpacity="0.7" stroke="#0984e3" strokeWidth="0.8" />
        <ellipse cx="12" cy="13" rx="2.5" ry="4.5" fill="#2d3436" stroke="#dfe6e9" strokeWidth="0.8" />
        <circle cx="12" cy="8" r="2.2" fill="#d63031" />
        <circle cx="10.8" cy="7.5" r="0.8" fill="#fff" />
        <circle cx="13.2" cy="7.5" r="0.8" fill="#fff" />
      </svg>
    );
  }

  if (clubId === 'toca_do_gargalo') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`club-badge-icon ${className}`} style={{ verticalAlign: 'middle', display: 'inline-block' }}>
        <circle cx="12" cy="12" r="10" fill="#2c3e50" stroke="#f39c12" strokeWidth="1.2" />
        <path d="M12 5V8L14 11V18C14 18.6 13.6 19 13 19H11C10.4 19 10 18.6 10 18V11L12 8V5Z" fill="#f1c40f" />
        <circle cx="12" cy="5" r="1.5" fill="#e67e22" />
      </svg>
    );
  }

  if (clubId === 'broccolis') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`club-badge-icon ${className}`} style={{ verticalAlign: 'middle', display: 'inline-block' }}>
        <circle cx="12" cy="12" r="10" fill="#1b4332" stroke="#52b788" strokeWidth="1.2" />
        <circle cx="10" cy="9" r="3" fill="#2d6a4f" />
        <circle cx="14" cy="9" r="3" fill="#2d6a4f" />
        <circle cx="12" cy="7" r="3.2" fill="#40916c" />
        <path d="M11 11V17C11 17.5 11.5 18 12 18C12.5 18 13 17.5 13 17V11" stroke="#d8f3dc" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (clubId === 'o_flamingo') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`club-badge-icon ${className}`} style={{ verticalAlign: 'middle', display: 'inline-block' }}>
        <circle cx="12" cy="12" r="10" fill="#4a1525" stroke="#ff7675" strokeWidth="1.2" />
        <path d="M14 7C14 5.5 12.5 5 11.5 6C10.5 7 11 9 12 10C13 11 14.5 12 14.5 14C14.5 15.5 13 16.5 11.5 16" stroke="#ff7675" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="13.5" cy="6" r="1.5" fill="#fd79a8" />
        <path d="M12 16V20M12 18L10 19" stroke="#fab1a0" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (clubId === 'blue_haven') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`club-badge-icon ${className}`} style={{ verticalAlign: 'middle', display: 'inline-block' }}>
        <circle cx="12" cy="12" r="10" fill="#0c2461" stroke="#38bdf8" strokeWidth="1.2" />
        <path d="M8 6H13V13C13 15.2 14.8 17 17 17C18.1 17 19 16.1 19 15C19 13.9 18.1 13 17 13" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="6" r="1.2" fill="#38bdf8" />
      </svg>
    );
  }

  // Graham Bell Hall (Cartola / Grand Hall)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`club-badge-icon ${className}`} style={{ verticalAlign: 'middle', display: 'inline-block' }}>
      <circle cx="12" cy="12" r="10" fill="#2d3436" stroke="#ffd700" strokeWidth="1.2" />
      <path d="M6 16H18M8 16V9C8 8.4 8.4 8 9 8H15C15.6 8 16 8.4 16 9V16" stroke="#ffd700" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="8" y="13" width="8" height="2" fill="#c0392b" />
    </svg>
  );
}
