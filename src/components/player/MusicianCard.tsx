/**
 * MusicianCard — Componente visual da carta de músico
 * Exibe a imagem, nome, nível, notas e regras especiais da carta.
 */

import type { MusicianInPlay } from '../../types/game';
import type { NoteColor } from '../../types/cards';
import CardHoverPreview from '../common/CardHoverPreview';

interface MusicianCardProps {
  musician: MusicianInPlay;
  compact?: boolean;
  onNoteClick?: (noteIndex: number) => void;
  highlightSlotIndex?: number | null;
  highlightSlotIndices?: number[];
  availableCubes?: NoteColor[];
  disableHoverPreview?: boolean;
}

const NOTE_COLOR_DATA: Record<NoteColor, { bg: string; border: string; label: string }> = {
  red:    { bg: '#c0392b', border: '#922b21', label: 'Vermelho' },
  blue:   { bg: '#2980b9', border: '#1a5276', label: 'Azul' },
  yellow: { bg: '#ffd32a', border: '#cf9f02', label: 'Amarelo' },
  purple: { bg: '#8e44ad', border: '#6c3483', label: 'Roxo' },
  white:  { bg: '#e8e0d0', border: '#b8a898', label: 'Branco' },
  wild:   { bg: '#7f8c8d', border: '#566573', label: 'Coringa' },
};

function NoteSlot({
  noteColor,
  filledColor,
  points,
  onClick,
  isHighlighted,
  canFill,
}: {
  noteColor: NoteColor;
  filledColor: NoteColor | null;
  points: number;
  onClick?: () => void;
  isHighlighted?: boolean;
  canFill?: boolean;
}) {
  const isFilled = filledColor !== null && filledColor !== undefined;
  const displayColor = isFilled ? filledColor : noteColor;
  const colorData = NOTE_COLOR_DATA[displayColor] ?? NOTE_COLOR_DATA.wild;
  const isClickable = !isFilled && !!onClick && (isHighlighted || canFill);

  return (
    <button
      type="button"
      className={`note-slot-btn ${isFilled ? 'note-slot-btn--filled' : 'note-slot-btn--empty'} ${isHighlighted ? 'note-slot-btn--highlighted' : ''} ${isClickable ? 'note-slot-btn--can-fill' : ''}`}
      onClick={isClickable ? onClick : undefined}
      disabled={isFilled || !isClickable}
      title={`${colorData.label} — ${points} pt${points !== 1 ? 's' : ''}`}
      aria-label={`Nota ${colorData.label}, ${points} pontos${isFilled ? ' (preenchida)' : ''}`}
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        border: `2px solid ${isHighlighted ? '#f1c40f' : isFilled ? colorData.border : 'rgba(255,255,255,0.22)'}`,
        background: isFilled
          ? `linear-gradient(135deg, ${colorData.bg}, ${colorData.border})`
          : 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isClickable ? 'pointer' : isFilled ? 'default' : 'not-allowed',
        boxShadow: isFilled
          ? `0 2px 6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.3)`
          : isHighlighted
            ? `0 0 12px rgba(241,196,15,0.8), 0 0 0 3px rgba(241,196,15,0.4)`
            : 'inset 0 1px 3px rgba(0,0,0,0.5)',
        position: 'relative',
        transition: 'all 0.18s ease',
        transform: isHighlighted ? 'scale(1.12)' : 'scale(1)',
        flexShrink: 0,
        padding: 0,
      }}
    >
      {/* Mini-quadrado da cor quando vazio */}
      {!isFilled && noteColor !== 'wild' && (
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            background: colorData.bg,
            border: `1px solid ${colorData.border}`,
            boxShadow: `0 0 6px ${colorData.bg}99`,
            display: 'inline-block',
          }}
        />
      )}

      {/* Ícone coringa (?) */}
      {noteColor === 'wild' && !isFilled && (
        <span style={{ fontSize: 14, fontWeight: 800, color: '#f0ede8', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          ?
        </span>
      )}

      {/* Pontos */}
      <span
        style={{
          position: 'absolute',
          bottom: -9,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          fontWeight: 700,
          color: isFilled ? '#c9922b' : 'rgba(255,255,255,0.6)',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {points}pt
      </span>
    </button>
  );
}

export default function MusicianCardComponent({
  musician,
  compact = false,
  onNoteClick,
  highlightSlotIndex,
  highlightSlotIndices,
  availableCubes = [],
  disableHoverPreview = false,
}: MusicianCardProps) {
  const totalPoints = musician.notes.reduce((sum, n) => sum + n.points, 0);
  const filledPoints = musician.notes.reduce((sum, n, i) => {
    return musician.filledNotes?.[i] ? sum + n.points : sum;
  }, 0);
  const isFull = musician.notes.every((_, i) => musician.filledNotes?.[i]);

  const activeHighlightedIndices = highlightSlotIndices ?? (highlightSlotIndex !== null && highlightSlotIndex !== undefined ? [highlightSlotIndex] : []);

  const canFillNote = (noteColor: NoteColor): boolean => {
    if (availableCubes.length === 0) return true;
    return noteColor === 'wild' || availableCubes.includes(noteColor);
  };

  if (compact) {
    return (
      <div className={`musician-card musician-card--compact ${isFull ? 'musician-card--full' : ''}`}>
        {musician.image && (
          <img src={musician.image} alt={musician.name} className="musician-card__img-compact" />
        )}
        <div className="musician-card__notes-row">
          {musician.notes.map((note, i) => (
            <NoteSlot
              key={i}
              noteColor={note.color}
              filledColor={musician.filledNotes?.[i] ?? null}
              points={note.points}
              onClick={onNoteClick ? () => onNoteClick(i) : undefined}
              isHighlighted={activeHighlightedIndices.includes(i)}
              canFill={canFillNote(note.color)}
            />
          ))}
        </div>
      </div>
    );
  }

  const imageElement = (
    <div className="musician-card__image-wrapper" style={{ cursor: disableHoverPreview ? 'default' : 'zoom-in' }}>
      {musician.image ? (
        <img src={musician.image} alt={musician.name} className="musician-card__img" />
      ) : (
        <div className="musician-card__img-placeholder">🎵</div>
      )}
      <div className="musician-card__level-badge">Nv{musician.level}</div>
      {isFull && <div className="musician-card__full-badge">✓ Completo</div>}
    </div>
  );

  return (
    <div className={`musician-card ${isFull ? 'musician-card--full' : ''}`}>
      {/* Imagem da carta */}
      {disableHoverPreview ? (
        imageElement
      ) : (
        <CardHoverPreview musician={musician}>
          {imageElement}
        </CardHoverPreview>
      )}

      {/* Nome */}
      <div className="musician-card__name">{musician.name}</div>

      {/* Regra especial */}
      {musician.specialRule && (
        <div className="musician-card__rule" title={musician.specialRule.description}>
          {musician.specialRule.type === 'same_color' && '= Todos Iguais'}
          {musician.specialRule.type === 'different_colors' && '≠ Todos Diferentes'}
          {(musician.specialRule.type === 'reverse_order' || musician.specialRule.type === 'right_to_left') && '⇄ Sentido Livre'}
        </div>
      )}

      {/* Notas musicais */}
      <div className="musician-card__notes">
        {musician.notes.map((note, i) => (
          <NoteSlot
            key={i}
            noteColor={note.color}
            filledColor={musician.filledNotes?.[i] ?? null}
            points={note.points}
            onClick={onNoteClick ? () => onNoteClick(i) : undefined}
            isHighlighted={activeHighlightedIndices.includes(i)}
            canFill={canFillNote(note.color)}
          />
        ))}
      </div>

      {/* Progresso de pontos */}
      <div className="musician-card__progress">
        <div
          className="musician-card__progress-bar"
          style={{ width: `${totalPoints > 0 ? (filledPoints / totalPoints) * 100 : 0}%` }}
        />
        <span className="musician-card__progress-label">{filledPoints}/{totalPoints} pts</span>
      </div>
    </div>
  );
}
