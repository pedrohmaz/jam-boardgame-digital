/**
 * PlayerMat — Tabuleiro individual do jogador
 *
 * Paleta de cores customizada:
 * - Habilidade: Bordô / Vinho (#8b1e3f / #500b1e)
 * - Renome: Laranja (#e67e22 / #f39c12)
 * - Inspiração: Verde (#2ecc71 / #27ae60)
 * - Pontos de Vitória: Azul Claro (#48dbfb) com símbolo Clave de Sol 𝄞
 */

import type { PlayerState } from '../../types/game';
import { SKILL_STEPS_VALUES, SKILL_STEPS_LABELS } from '../../types/game';
import type { ObjectiveGoal } from '../../types/cards';
import { CubeBag } from '../common/CubeToken';
import Dice3D from '../common/Dice3D';
import { CoinIcon, PointsIcon, SkillIcon, RenownIcon, InspirationIcon } from '../common/GameIcons';
import MusicianCardComponent from './MusicianCard';
import CardHoverPreview from '../common/CardHoverPreview';

interface PlayerMatProps {
  player: PlayerState;
  isActive: boolean;
  onAction?: (action: string, params?: Record<string, unknown>) => void;
}

function getGoalProgress(goal: ObjectiveGoal, player: PlayerState): { text: string; isMet: boolean } {
  switch (goal.type) {
    case 'musicians':
    case 'band_size': {
      const isMet = player.musicians.length >= goal.value;
      return { text: `${player.musicians.length}/${goal.value} músicos`, isMet };
    }
    case 'score':
    case 'points': {
      const isMet = player.score >= goal.value;
      return { text: `${player.score}/${goal.value} pontos`, isMet };
    }
    case 'renown': {
      const isMet = player.renown >= goal.value;
      return { text: `${player.renown}/${goal.value} Renome`, isMet };
    }
    case 'coins': {
      const isMet = player.coins >= goal.value;
      return { text: `${player.coins}/${goal.value} moedas`, isMet };
    }
    case 'resources': {
      const isMet = player.resources.length >= goal.value;
      return { text: `${player.resources.length}/${goal.value} recursos`, isMet };
    }
    case 'discs': {
      const cnt = (player.totalDiscsRecorded ?? player.discs.length);
      const isMet = cnt >= goal.value;
      return { text: `${cnt}/${goal.value} discos`, isMet };
    }
    case 'cubes_same_color': {
      const colorCounts: Record<string, number> = {};
      player.bag.forEach(c => { if (c !== 'white') colorCounts[c] = (colorCounts[c] || 0) + 1; });
      const maxCount = Math.max(0, ...Object.values(colorCounts));
      const isMet = maxCount >= goal.value;
      return { text: `${maxCount}/${goal.value} cubos da mesma cor`, isMet };
    }
    case 'skill': {
      const isMet = player.skill >= goal.value;
      return { text: `Habilidade Nv. ${player.skill}/${goal.value}`, isMet };
    }
    case 'eliminated_white_cubes': {
      const whiteRemaining = player.bag.filter(c => c === 'white').length;
      const eliminatedCount = Math.max(0, 3 - whiteRemaining);
      const isMet = eliminatedCount >= goal.value;
      return { text: `${eliminatedCount}/${goal.value} eliminados (${whiteRemaining} no saco)`, isMet };
    }
    case 'gigs': {
      const isMet = player.gigs.length >= goal.value;
      return { text: `${player.gigs.length}/${goal.value} shows`, isMet };
    }
    case 'musicians_level2plus': {
      const cnt = player.musicians.filter(m => m.level >= 2).length;
      const isMet = cnt >= goal.value;
      return { text: `${cnt}/${goal.value} músicos Nv.2+`, isMet };
    }
    case 'all_levels': {
      const has1 = player.musicians.some(m => m.level === 1);
      const has2 = player.musicians.some(m => m.level === 2);
      const has3 = player.musicians.some(m => m.level === 3);
      const levelsCount = (has1 ? 1 : 0) + (has2 ? 1 : 0) + (has3 ? 1 : 0);
      const isMet = levelsCount >= 3;
      return { text: `${levelsCount}/3 níveis (1, 2 e 3)`, isMet };
    }
    case 'colored_cubes': {
      const cnt = player.bag.filter(c => c !== 'white').length;
      const isMet = cnt >= goal.value;
      return { text: `${cnt}/${goal.value} cubos coloridos`, isMet };
    }
    case 'gig_achievements': {
      const cnt = player.gigs.filter(g => g.success).length;
      const isMet = cnt >= goal.value;
      return { text: `${cnt}/${goal.value} shows com sucesso`, isMet };
    }
    case 'disc_level': {
      const maxDisc = Math.max(0, ...player.discs.map(d => d.level));
      const isMet = maxDisc >= goal.value;
      return { text: `Maior disco Nv. ${maxDisc}/${goal.value}`, isMet };
    }
    case 'styles': {
      const isMet = player.styles.length >= goal.value;
      return { text: `${player.styles.length}/${goal.value} estilos`, isMet };
    }
    default:
      return { text: `0/${goal.value}`, isMet: false };
  }
}

// Trilha de Renome: 10 níveis (1-10)
const RENOWN_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const RENOWN_BONUS = ['+10', '+20', '+30', '+40', '+50', '+60', '+70', '+80', '+90', '+100'];

function TrackDot({
  filled,
  active,
  label,
  tooltip,
  size = 28,
  type = 'default',
}: {
  filled: boolean;
  active: boolean;
  label: string;
  tooltip?: string;
  size?: number;
  type?: 'skill' | 'renown' | 'default';
}) {
  let activeBorder = '#c9922b';
  let activeBg = 'radial-gradient(circle, #f1c40f 40%, #c9922b 100%)';
  let filledBg = 'radial-gradient(circle, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.2) 100%)';
  let activeGlow = '0 0 10px rgba(201,146,43,0.7)';

  if (type === 'skill') {
    // Bordô
    activeBorder = '#ff7675';
    activeBg = 'radial-gradient(circle, #d63031 30%, #7b112b 100%)';
    filledBg = 'radial-gradient(circle, #8b1e3f 40%, #500b1e 100%)';
    activeGlow = '0 0 10px rgba(214,48,49,0.8)';
  } else if (type === 'renown') {
    // Laranja
    activeBorder = '#fed330';
    activeBg = 'radial-gradient(circle, #f39c12 30%, #d35400 100%)';
    filledBg = 'radial-gradient(circle, #e67e22 40%, #b33939 100%)';
    activeGlow = '0 0 10px rgba(243,156,18,0.8)';
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: active ? `2.5px solid ${activeBorder}` : filled ? '2px solid rgba(255,255,255,0.45)' : '2px solid rgba(255,255,255,0.12)',
        background: filled ? (active ? activeBg : filledBg) : 'rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 9,
        fontWeight: 700,
        color: active ? '#ffffff' : filled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)',
        boxShadow: active ? activeGlow : filled ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
        transition: 'all 0.25s ease',
        flexShrink: 0,
        cursor: 'default',
      }}
      title={tooltip}
    >
      {label}
    </div>
  );
}

export default function PlayerMat({ player, isActive }: PlayerMatProps) {
  const inspirationCount = Math.min(3, player.inspiration);

  return (
    <div className={`player-mat ${isActive ? 'player-mat--active' : ''}`}>
      {/* Header */}
      <div className="player-mat__header">
        <div
          className="player-mat__color-strip"
          style={{ backgroundColor: getColorHex(player.color) }}
        />
        <div className="player-mat__name-area">
          <span className="player-mat__name">{player.name}</span>
          {player.isBot && <span className="player-mat__bot-badge">🤖 Bot</span>}
        </div>
        <div className="player-mat__resources">
          {/* Moedas */}
          <div className="player-mat__stat" title="Moedas" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CoinIcon size={20} />
            <span className="player-mat__stat-value" style={{ fontSize: 16 }}>{player.coins}</span>
          </div>

          {/* Pontos de Vitória (Azul Claro c/ Clave de Sol) */}
          <div
            className="player-mat__stat"
            title="Pontos de Vitória"
            style={{
              background: 'rgba(72, 219, 251, 0.15)',
              border: '1px solid rgba(72, 219, 251, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <PointsIcon size={20} />
            <span className="player-mat__stat-value" style={{ color: '#48dbfb', fontWeight: 800, fontSize: 16 }}>
              {player.score}
            </span>
          </div>
        </div>
        <Dice3D value={player.timeMarker} size={44} color={getColorHex(player.color)} />
      </div>

      {/* Trilhas de status */}
      <div className="player-mat__tracks">
        {/* Trilha de Habilidade (BORDÔ) */}
        <div
          className="player-mat__track"
          style={{
            background: 'rgba(123, 17, 43, 0.12)',
            border: '1px solid rgba(214, 48, 49, 0.25)',
            borderRadius: 8,
            padding: '6px 8px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span
              className="player-mat__track-label"
              style={{ color: '#ff7675', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              title="Habilidade: determina quantos cubos você retira por apresentação"
            >
              <SkillIcon size={16} />
              <span>Habilidade (Nível {player.skill} • Passo {SKILL_STEPS_LABELS[player.skillStepIndex ?? 0]})</span>
            </span>
          </div>
          <div className="player-mat__track-dots" style={{ gap: 3 }}>
            {SKILL_STEPS_LABELS.map((label, i) => (
              <TrackDot
                key={i}
                type="skill"
                filled={i <= (player.skillStepIndex ?? 0)}
                active={i === (player.skillStepIndex ?? 0)}
                label={label}
                tooltip={`Passo ${label}: Habilidade ${SKILL_STEPS_VALUES[i]} (retira ${SKILL_STEPS_VALUES[i]} cubos)`}
                size={22}
              />
            ))}
          </div>
        </div>

        {/* Trilha de Renome (LARANJA) */}
        <div
          className="player-mat__track"
          style={{
            background: 'rgba(230, 126, 34, 0.12)',
            border: '1px solid rgba(230, 126, 34, 0.25)',
            borderRadius: 8,
            padding: '6px 8px',
          }}
        >
          <span
            className="player-mat__track-label"
            style={{ color: '#f39c12', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Renome: aumenta o público potencial nas apresentações"
          >
            <RenownIcon size={16} />
            <span>Renome (Nível {player.renown}/10)</span>
          </span>
          <div className="player-mat__track-dots" style={{ marginTop: 4 }}>
            {RENOWN_LABELS.map((label, i) => (
              <TrackDot
                key={i}
                type="renown"
                filled={i + 1 <= player.renown}
                active={i + 1 === player.renown}
                label={label}
                tooltip={`Renome ${i + 1}: público base ${(i + 1) * 10} (${RENOWN_BONUS[i]})`}
                size={24}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Inspiração (VERDE) */}
      <div
        className="player-mat__inspiration"
        style={{
          background: 'rgba(46, 204, 113, 0.08)',
          border: '1px solid rgba(46, 204, 113, 0.22)',
          borderRadius: 8,
          padding: '6px 10px',
        }}
      >
        <span className="player-mat__section-label" style={{ color: '#2ecc71', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <InspirationIcon size={16} />
          <span>Inspiração ({inspirationCount}/3)</span>
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: i < inspirationCount ? '1.5px solid #2ecc71' : '1.5px solid rgba(255,255,255,0.15)',
                background: i < inspirationCount
                  ? 'rgba(46, 204, 113, 0.15)'
                  : 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: i < inspirationCount ? '0 0 8px rgba(46,204,113,0.5)' : 'none',
                transition: 'all 0.2s',
              }}
              title={i < inspirationCount ? 'Ficha de Inspiração pronta para uso!' : 'Slot de Inspiração vazio'}
            >
              {i < inspirationCount ? (
                <InspirationIcon size={18} />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Composições & Discos Gravados */}
      <div className="player-mat__compositions" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="player-mat__section-label">🎼 Repertório & Gravações</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {player.compositions.map(c => (
            <span
              key={c.id}
              style={{
                fontSize: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4,
                padding: '2px 6px',
                color: '#f0ede8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Partitura ainda não gravada. Vá à Gravadora para gravar em disco!"
            >
              <span>📄</span>
              <span>Partitura Nv{c.level}</span>
            </span>
          ))}
          {player.discs.map((d, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 10,
                background: 'rgba(201,146,43,0.15)',
                border: '1px solid rgba(201,146,43,0.4)',
                borderRadius: 4,
                padding: '2px 6px',
                color: '#f1c40f',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
              }}
              title="Disco de Vinil gravado!"
            >
              <span>💿</span>
              <span>Vinil Nv{d.level}</span>
            </span>
          ))}
          {player.hasPublicityToken && (
            <span
              style={{
                fontSize: 10,
                background: 'rgba(46,204,113,0.15)',
                border: '1px solid rgba(46,204,113,0.4)',
                borderRadius: 4,
                padding: '2px 6px',
                color: '#2ecc71',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
              }}
              title="Ficha de Divulgação da Rádio: +30 de público na próxima apresentação!"
            >
              <span>📢</span>
              <span>Divulgação (+30 público)</span>
            </span>
          )}
          {player.compositions.length === 0 && player.discs.length === 0 && (
            <span style={{ fontSize: 10, color: '#8a7a6e', fontStyle: 'italic' }}>
              Nenhuma música composta ainda
            </span>
          )}
        </div>
      </div>

      {/* Saco de Cubos */}
      <div className="player-mat__bag-section">
        <span className="player-mat__section-label">
          🎲 Saco Musical ({player.bag.length} cubos)
        </span>
        <CubeBag bag={player.bag} />
      </div>

      {/* Músicos na Banda */}
      <div className="player-mat__musicians-section">
        {(() => {
          const effectiveMax = (player.maxMusicians || 3) >= 4 || player.resources.some(r => r.id === 'recurso_09' || r.effectType === 'musician_hand_size_4') ? 4 : 3;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="player-mat__section-label">
                🎷 Banda ({player.musicians.length}/{effectiveMax})
              </span>
              {effectiveMax === 4 && (
                <span style={{ fontSize: 9, color: '#c9922b', fontWeight: 600 }}>
                  +1 Sala de Ensaio
                </span>
              )}
            </div>
          );
        })()}
        <div className="player-mat__musician-cards">
          {player.musicians.map((musician, idx) => (
            <MusicianCardComponent
              key={musician.id || idx}
              musician={musician}
            />
          ))}
        </div>
      </div>

      {/* Carta de Objetivo Secreto */}
      {player.objective && (
        <div className="player-mat__objective-section" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="player-mat__section-label" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              🎯 Carta de Objetivo: {player.objective.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#8a7a6e' }}>
              {(player.objective.completedGoals?.filter(Boolean).length || 0)}/3 concluídos
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.04)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {player.objective.image ? (
                <CardHoverPreview objective={player.objective}>
                  <img
                    src={player.objective.image}
                    alt={player.objective.name}
                    style={{
                      width: 52,
                      height: 72,
                      objectFit: 'contain',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: 6,
                      flexShrink: 0,
                      cursor: 'zoom-in',
                    }}
                  />
                </CardHoverPreview>
              ) : (
                <div style={{ width: 52, height: 72, borderRadius: 6, background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}>
                  🎯
                </div>
              )}

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {player.objective.goals.map((goal, gIdx) => {
                  const isCompleted = Boolean(player.objective?.completedGoals?.[gIdx]);
                  const progress = getGoalProgress(goal, player);
                  const rewardVP = gIdx === 0 ? 2 : gIdx === 1 ? 3 : 5;

                  return (
                    <div
                      key={gIdx}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: isCompleted ? 'rgba(46, 204, 113, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isCompleted ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isCompleted ? '#2ecc71' : '#ffffff' }}>
                          {gIdx + 1}ª Meta: {goal.description}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: isCompleted ? '#27ae60' : 'rgba(255,255,255,0.08)',
                            color: isCompleted ? '#ffffff' : '#ebdccb',
                          }}
                        >
                          {isCompleted ? '✓ Concluído' : progress.isMet ? '⏳ Conclui no turno' : progress.text}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                        <span style={{ color: '#8a7a6e' }}>
                          Progresso atual: <strong style={{ color: progress.isMet ? '#2ecc71' : '#ebdccb' }}>{progress.text}</strong>
                        </span>
                        <span style={{ color: isCompleted ? '#2ecc71' : '#38bdf8', fontWeight: 700 }}>
                          +{rewardVP} Pontos de Vitória
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              fontSize: '0.72rem',
              color: '#f3c343',
              background: 'rgba(243, 195, 67, 0.08)',
              border: '1px dashed rgba(243, 195, 67, 0.25)',
              borderRadius: 6,
              padding: '4px 8px',
              textAlign: 'center',
            }}>
              ✨ <strong>Bônus de Estilo:</strong> Escolha 1 de 3 Cartas de Estilo ao cumprir seu <strong>1º</strong> e <strong>3º</strong> objetivo no total!
            </div>
          </div>
        </div>
      )}

      {/* Cartas de Estilo */}
      {(player.styles.length > 0 || player.reservedStyle) && (
        <div className="player-mat__styles-section" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="player-mat__section-label" style={{ fontSize: '0.85rem', color: '#f3c343', fontWeight: 700 }}>
            ✨ Estilos Musicais ({player.styles.length}/2)
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {player.styles.map(style => (
              <div
                key={style.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(243,195,67,0.06)',
                  border: '1px solid rgba(243,195,67,0.3)',
                }}
              >
                {style.image ? (
                  <img src={style.image} alt={style.name} style={{ width: 44, height: 60, objectFit: 'contain', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 44, height: 60, borderRadius: 5, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🎨</div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f3c343' }}>{style.name}</span>
                  <div style={{ fontSize: '0.82rem', color: '#ebdccb', lineHeight: 1.35 }}>
                    {style.description}
                  </div>
                </div>
              </div>
            ))}

            {/* Estilo Reservado do Chapéu Estiloso */}
            {player.reservedStyle && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(155,89,182,0.1)',
                  border: '1.5px dashed rgba(155,89,182,0.5)',
                }}
              >
                <div style={{ width: 36, height: 48, borderRadius: 4, background: 'rgba(155,89,182,0.2)', border: '1px solid #9b59b6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                  🎩
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#d29bfe' }}>{player.reservedStyle.name}</span>
                    <span style={{ fontSize: '0.72rem', background: '#9b59b6', color: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                      🔒 Reservado
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#ebdccb', lineHeight: 1.35 }}>
                    {player.reservedStyle.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recursos / Instrumentos */}
      {player.resources.length > 0 && (
        <div className="player-mat__resources-section" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="player-mat__section-label" style={{ fontSize: '0.85rem', color: '#c9922b', fontWeight: 700 }}>
            📦 Recursos & Instrumentos ({player.resources.length})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {player.resources.map(r => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(201,146,43,0.25)',
                }}
              >
                {r.image ? (
                  <CardHoverPreview resource={r}>
                    <img src={r.image} alt={r.name} style={{ width: 44, height: 60, objectFit: 'contain', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, flexShrink: 0, cursor: 'zoom-in' }} />
                  </CardHoverPreview>
                ) : (
                  <div style={{ width: 44, height: 60, borderRadius: 5, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📜</div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0ede8' }}>{r.name}</span>
                    {r.victoryPoints > 0 && (
                      <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                        <PointsIcon size={13} />
                        +{r.victoryPoints} VP
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#ebdccb', lineHeight: 1.35 }}>
                    {r.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    orange: '#e67e22', pink: '#e84393', green: '#27ae60',
    brown: '#8d5524', gray: '#7f8c8d',
  };
  return map[color] || '#c9922b';
}
