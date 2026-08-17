/**
 * PresentationModal — Modal interativo de Apresentação no Clube / Noite
 *
 * Regras Oficiais JAM:
 * 1. Ficha de Inspiração (+1 cubo extra) DEVE ser gasta antes de começar a comprar cubos.
 * 2. Compra e alocação passo a passo: 1 cubo retirado por vez e alocado na carta.
 * 3. Cubo branco NUNCA pode ser alocado em uma carta (nem em coringa), a menos que possua estilo "Cubo Branco Coringa".
 * 4. Alocação sempre da esquerda para a direita, a não ser que o músico tenha a habilidade de alocação reversa.
 *    Nesse caso, o primeiro cubo alocado define a direção (da esquerda para direita ou da direita para esquerda).
 * 5. Ao final, pode gastar 1 Inspiração para eliminar 1 cubo comprado não alocado.
 * 6. Todos os cubos não eliminados retornam ao saco do jogador.
 */

import { useState, useCallback, useEffect } from 'react';
import type { GameState } from '../../types/game';
import type { NoteColor } from '../../types/cards';
import { CLUBS } from '../../types/board';
import { GameEngine } from '../../engine/gameEngine';
import CubeToken, { COLOR_DATA } from '../common/CubeToken';
import { CoinIcon, PointsIcon, SkillIcon, RenownIcon, InspirationIcon, ClubBadgeIcon } from '../common/GameIcons';
import MusicianCardComponent from '../player/MusicianCard';
import ClubRewardIcon from '../common/ClubRewardIcon';
import BoardPeekBanner from '../common/BoardPeekBanner';

interface PresentationModalProps {
  gameState: GameState;
  onComplete: (newState: GameState) => void;
  onCancel: () => void;
}

type ModalPhase = 'intro' | 'drawing_step' | 'summary' | 'result';

interface PlacedNote {
  musicianId: string;
  noteIndex: number;
  color: NoteColor;
}

export default function PresentationModal({ gameState, onComplete, onCancel }: PresentationModalProps) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const isNightPhase = gameState.phase === 'night';
  const isBot = Boolean(player.isBot);
  const club = isNightPhase && player.chosenClub
    ? CLUBS.find(c => c.id === player.chosenClub) || CLUBS[0]
    : null;

  const hasSensei = player.resources.some(r => r.id === 'recurso_08' || r.effectType === 'extra_draw_in_gig');
  const hasWhiteAsWild = player.styles.some(s => s.effectType === 'white_as_wild' || s.id === 'estilo_03');
  const hasRedrawStyle = player.styles.some(s => s.effectType === 'redraw_once_per_cube' || s.id === 'estilo_01');
  const hasFlexibilidade = player.styles.some(s => s.effectType === 'place_cube_anytime' || s.id === 'estilo_02');
  const hasCachêExtra = player.styles.some(s => s.effectType === 'bonus_coins_presentation' || s.id === 'estilo_04');
  const bonusCoinsFromStyle = hasCachêExtra ? (gameState.round >= 5 ? 3 : 2) : 0;
  const hasTacticalInspiration = player.styles.some(s => s.effectType === 'inspire_extra_draw_anytime' || s.id === 'estilo_05');
  const hasReduceThreshold = player.styles.some(s => s.effectType === 'reduce_success_threshold' || s.id === 'estilo_06');
  const effectiveSuccessThreshold = club ? Math.max(1, club.successThreshold - (hasReduceThreshold ? 1 : 0)) : 0;
  
  // Estilos 08, 09, 10, 11
  const hasStyle08 = player.styles.some(s => s.effectType === 'fill_right_to_left' || s.id === 'estilo_08');
  const hasStyle09 = player.styles.some(s => s.effectType === 'draw_from_main_bag' || s.id === 'estilo_09');
  const hasStyle10 = player.styles.some(s => s.effectType === 'first_white_redraw' || s.id === 'estilo_10');
  const hasPremioCobicado = player.styles.some(s => s.effectType === 'claim_taken_reward' || s.id === 'estilo_11');

  const baseDrawCount = player.skill + (hasSensei ? 1 : 0);

  // Estados principais
  const [phase, setPhase] = useState<ModalPhase>('intro');
  const [isMinimized, setIsMinimized] = useState(false);
  const [useExtraDrawInspiration, setUseExtraDrawInspiration] = useState(false);
  
  // Estados para Estilos Especiais (01, 02, 08, 09, 10, 11)
  const [hasUsedRedraw, setHasUsedRedraw] = useState(false);
  const [reservedCubeForAnytime, setReservedCubeForAnytime] = useState<NoteColor | null>(null);
  const [hasUsedFlexibilidade, setHasUsedFlexibilidade] = useState(false);
  const [isPlacingReservedCube, setIsPlacingReservedCube] = useState(false);
  const [style08MusicianId, setStyle08MusicianId] = useState<string | null>(null);
  const [chosenMainBagCube, setChosenMainBagCube] = useState<NoteColor | null>(null);
  const [hasUsedWhiteRedraw, setHasUsedWhiteRedraw] = useState(false);
  const [disabledRewardId, setDisabledRewardId] = useState<string | null>(null);

  // Saco de trabalho durante a apresentação
  const [remainingBag, setRemainingBag] = useState<NoteColor[]>([...player.bag]);
  
  // Controle de sorteio passo a passo
  const [currentDrawStep, setCurrentDrawStep] = useState(0);
  const [currentDrawnCube, setCurrentDrawnCube] = useState<NoteColor | null>(null);
  const [cubeAwaitingPlacement, setCubeAwaitingPlacement] = useState(false);
  
  // Histórico, alocações e direções dos músicos
  const [allDrawnCubes, setAllDrawnCubes] = useState<NoteColor[]>([]);
  const [unplacedCubes, setUnplacedCubes] = useState<NoteColor[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Array<NoteColor | null>>>({});
  const [musicianDirections, setMusicianDirections] = useState<Record<string, 'ltr' | 'rtl'>>({});
  const [eliminatedCubeIndex, setEliminatedCubeIndex] = useState<number | null>(null);
  const eliminatedCube = eliminatedCubeIndex !== null ? unplacedCubes[eliminatedCubeIndex] : null;

  // Prêmios de Apresentação do Clube
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // Resultados finais
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [finalAudience, setFinalAudience] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedNewState, setSavedNewState] = useState<GameState | null>(null);

  const totalDrawCount = baseDrawCount + (useExtraDrawInspiration ? 1 : 0);
  const availableInspirationForElimination = player.inspiration - (useExtraDrawInspiration ? 1 : 0);

  // Recompensas do clube
  const clubRewardsList = (club && gameState.clubRewards && gameState.clubRewards[club.id]) || [];
  const availableRewards = clubRewardsList.filter(r => !r.claimedByPlayerId || hasPremioCobicado);
  const allRewardsOccupied = clubRewardsList.length > 0 && availableRewards.length === 0;

  // Inicializa mapa de slots vazios dos músicos
  const initAssignments = useCallback(() => {
    const init: Record<string, Array<NoteColor | null>> = {};
    player.musicians.forEach(m => {
      init[m.id] = m.notes.map(() => null);
    });
    return init;
  }, [player.musicians]);

  // Iniciar apresentação
  const handleStartPresentation = () => {
    setAssignments(initAssignments());
    setMusicianDirections({});
    const startBag = chosenMainBagCube ? [...player.bag, chosenMainBagCube] : [...player.bag];
    setRemainingBag(startBag);
    setAllDrawnCubes([]);
    setUnplacedCubes([]);
    setEliminatedCubeIndex(null);
    setSelectedRewardId(null);
    setSelectedStyleId(null);
    setDisabledRewardId(null);
    setHasUsedRedraw(false);
    setReservedCubeForAnytime(null);
    setHasUsedFlexibilidade(false);
    setIsPlacingReservedCube(false);
    setStyle08MusicianId(null);
    setHasUsedWhiteRedraw(false);
    setPhase('drawing_step');
    drawSingleCube(1, startBag);
  };

  // Sorteia 1 cubo individualmente
  const drawSingleCube = (stepNum: number, currentBag: NoteColor[]) => {
    if (currentBag.length === 0) {
      setCurrentDrawStep(stepNum);
      setCurrentDrawnCube(null);
      setCubeAwaitingPlacement(false);
      return;
    }

    const randIdx = Math.floor(Math.random() * currentBag.length);
    const drawn = currentBag[randIdx];
    const newBag = [...currentBag];
    newBag.splice(randIdx, 1);

    setRemainingBag(newBag);
    setCurrentDrawnCube(drawn);
    setCurrentDrawStep(stepNum);
    setAllDrawnCubes(prev => [...prev, drawn]);
    setCubeAwaitingPlacement(true);
  };

  const placedWhiteCubesCount = Object.values(assignments)
    .reduce((acc, arr) => acc + (arr ? arr.filter(c => c === 'white').length : 0), 0);
  const canUseWhiteAsWild = hasWhiteAsWild && placedWhiteCubesCount < 1;

  /**
   * Verifica se o cubo alvo pode ser colocado em slots dos músicos:
   * - Cubo branco NUNCA entra sem estilo correspondente (e máx 1x por apresentação).
   * - Músico padrão: apenas a nota vazia mais à esquerda.
   * - Músico com habilidade reversa / Estilo 08: se vazio, tanto a ponta esquerda (slot 0) quanto a ponta direita (slot length-1) são opções válidas.
   *   Assim que o 1º cubo é alocado em uma ponta, a direção para este músico é fixada ('ltr' ou 'rtl').
   */
  const getValidSlotsForCube = useCallback((targetCube: NoteColor | null): PlacedNote[] => {
    if (!targetCube) return [];

    // Cubo branco bloqueado sem a carta de estilo ou se já utilizou o limite de 1 cubo branco coringa por show
    if (targetCube === 'white' && !canUseWhiteAsWild) {
      return [];
    }

    const validSlots: PlacedNote[] = [];

    player.musicians.forEach(musician => {
      const currentFilled = assignments[musician.id] || [];
      const filledCount = currentFilled.filter(c => c !== null).length;
      const lockedDirection = musicianDirections[musician.id];

      // Validação de regra especial: = Todos Iguais (mesma cor do 1º cubo colocado)
      if (musician.specialRule?.type === 'same_color') {
        const filled = currentFilled.filter((c): c is NoteColor => c !== null);
        if (filled.length > 0 && filled[0] !== targetCube) {
          return;
        }
      }

      // Validação de regra especial: ≠ Todos Diferentes (nenhuma cor repetida)
      if (musician.specialRule?.type === 'different_colors') {
        const filled = currentFilled.filter((c): c is NoteColor => c !== null);
        if (filled.includes(targetCube)) {
          return;
        }
      }

      const isNoteMatch = (noteColor: NoteColor, cubeColor: NoteColor) => {
        if (noteColor === 'wild') return true;
        if (cubeColor === noteColor) return true;
        if (canUseWhiteAsWild && cubeColor === 'white') return true;
        return false;
      };

      const hasNativeReverse = musician.specialRule?.type === 'reverse_order' ||
        musician.specialRule?.type === 'right_to_left';

      // Estilo 08: permite alocar da direita para esquerda em 1 carta de músico sem essa habilidade
      const canUseStyle08OnThisMusician = hasStyle08 &&
        !hasNativeReverse &&
        musician.notes.length > 1 &&
        (style08MusicianId === null || style08MusicianId === musician.id);

      const hasReverseAbility = hasNativeReverse || canUseStyle08OnThisMusician;

      if (hasReverseAbility && filledCount === 0) {
        // Primeira alocação no músico flexível: pode começar pela esquerda OU pela direita
        const leftIndex = 0;
        const rightIndex = musician.notes.length - 1;

        // Testa ponta esquerda
        const leftNote = musician.notes[leftIndex];
        if (leftNote && isNoteMatch(leftNote.color, targetCube)) {
          validSlots.push({ musicianId: musician.id, noteIndex: leftIndex, color: targetCube });
        }

        // Testa ponta direita (se diferente de esquerda)
        if (rightIndex > leftIndex) {
          const rightNote = musician.notes[rightIndex];
          if (rightNote && isNoteMatch(rightNote.color, targetCube)) {
            validSlots.push({ musicianId: musician.id, noteIndex: rightIndex, color: targetCube });
          }
        }
      } else {
        // Direção definida ou músico padrão (LTR)
        const direction = lockedDirection || 'ltr';
        let targetIndex = -1;

        if (direction === 'rtl') {
          // Busca o próximo slot vazio da direita para a esquerda
          for (let i = musician.notes.length - 1; i >= 0; i--) {
            if (!currentFilled[i]) {
              targetIndex = i;
              break;
            }
          }
        } else {
          // Busca o próximo slot vazio da esquerda para a direita
          for (let i = 0; i < musician.notes.length; i++) {
            if (!currentFilled[i]) {
              targetIndex = i;
              break;
            }
          }
        }

        if (targetIndex !== -1) {
          const note = musician.notes[targetIndex];
          if (isNoteMatch(note.color, targetCube)) {
            validSlots.push({
              musicianId: musician.id,
              noteIndex: targetIndex,
              color: targetCube,
            });
          }
        }
      }
    });

    return validSlots;
  }, [hasWhiteAsWild, canUseWhiteAsWild, hasStyle08, style08MusicianId, player.musicians, assignments, musicianDirections]);

  const activeCubeForPlacement = isPlacingReservedCube
    ? reservedCubeForAnytime
    : (cubeAwaitingPlacement ? currentDrawnCube : null);
  
  const validSlots = getValidSlotsForCube(activeCubeForPlacement);
  const isWhiteBlocked = currentDrawnCube === 'white' && !canUseWhiteAsWild;

  // Aloca o cubo atual em um slot válido e fixa a direção se for músico flexível ou Estilo 08
  const handlePlaceCubeOnSlot = (musicianId: string, noteIndex: number) => {
    const cubeToPlace = activeCubeForPlacement;
    if (!cubeToPlace) return;

    const isValid = validSlots.some(v => v.musicianId === musicianId && v.noteIndex === noteIndex);
    if (!isValid) return;

    const musician = player.musicians.find(m => m.id === musicianId);
    if (musician && !musicianDirections[musicianId]) {
      const hasNativeReverse = musician.specialRule?.type === 'reverse_order' || musician.specialRule?.type === 'right_to_left';
      if (noteIndex === 0) {
        setMusicianDirections(prev => ({ ...prev, [musicianId]: 'ltr' }));
      } else if (noteIndex === musician.notes.length - 1) {
        setMusicianDirections(prev => ({ ...prev, [musicianId]: 'rtl' }));
        if (!hasNativeReverse && hasStyle08) {
          setStyle08MusicianId(musicianId);
        }
      } else {
        setMusicianDirections(prev => ({ ...prev, [musicianId]: 'ltr' }));
      }
    }

    setAssignments(prev => {
      const newAssign = { ...prev };
      const arr = [...(newAssign[musicianId] || [])];
      arr[noteIndex] = cubeToPlace;
      newAssign[musicianId] = arr;
      return newAssign;
    });

    if (isPlacingReservedCube) {
      setReservedCubeForAnytime(null);
      setIsPlacingReservedCube(false);
    } else {
      setCubeAwaitingPlacement(false);
    }
  };

  // Deixa o cubo de lado (não aloca)
  const handleSkipCube = () => {
    if (!currentDrawnCube || !cubeAwaitingPlacement) return;
    setUnplacedCubes(prev => [...prev, currentDrawnCube]);
    setCubeAwaitingPlacement(false);
  };

  // Avança para o próximo sorteio ou vai para o resumo
  const handleNextStep = () => {
    if (currentDrawStep < totalDrawCount) {
      drawSingleCube(currentDrawStep + 1, remainingBag);
    } else {
      const finalPts = calculateTotalPoints();
      const success = club ? finalPts >= effectiveSuccessThreshold : true;
      if (success && club) {
        if (allRewardsOccupied && !hasPremioCobicado) {
          setSelectedRewardId('fallback_vp');
        } else if (availableRewards.length > 0) {
          setSelectedRewardId(availableRewards[0].id);
        }
      }
      if (reservedCubeForAnytime) {
        setUnplacedCubes(prev => [...prev, reservedCubeForAnytime]);
        setReservedCubeForAnytime(null);
      }
      setPhase('summary');
    }
  };

  // Cálculo dos pontos acumulados das notas
  const calculateTotalPoints = useCallback(() => {
    let pts = 0;
    player.musicians.forEach(musician => {
      const mAssign = assignments[musician.id] || [];
      musician.notes.forEach((note, idx) => {
        if (mAssign[idx]) {
          pts += note.points;
        }
      });
    });
    return pts;
  }, [player.musicians, assignments]);

  // Finaliza a apresentação e grava os resultados no GameEngine
  const handleFinalizePresentation = () => {
    const finalPts = calculateTotalPoints();
    const baseAudience = player.renown * 10 + (player.hasPublicityToken ? 30 : 0);
    const cap = club ? club.maxCapacity : 120;
    const finalAud = Math.min(cap, Math.max(10, baseAudience));
    const baseCoins = Math.floor(finalAud / 10);
    const finalC = baseCoins + bonusCoinsFromStyle;
    const success = club ? finalPts >= effectiveSuccessThreshold : true;

    const finalAssignments: Record<string, NoteColor[]> = {};
    player.musicians.forEach(m => {
      const arr = assignments[m.id] || [];
      finalAssignments[m.id] = arr.filter((c): c is NoteColor => c !== null);
    });

    const performingPlayerId = player.id;
    let baseState = gameState;
    if (success && club && selectedRewardId) {
      const { newState: rewardedState } = GameEngine.claimClubReward(
        baseState,
        club.id,
        selectedRewardId,
        selectedStyleId || undefined,
        performingPlayerId,
        disabledRewardId || undefined
      );
      baseState = rewardedState;
    }

    const { newState: finalState } = GameEngine.performNightGig(baseState, finalAssignments, {
      pointsGained: finalPts,
      coinsGained: finalC,
      audience: finalAud,
      success,
      extraDrawInspirationUsed: useExtraDrawInspiration,
      eliminatedCube,
      chosenMainBagCube,
    });

    setTotalPoints(finalPts);
    setTotalCoins(finalC);
    setFinalAudience(finalAud);
    setIsSuccess(success);
    setSavedNewState(finalState);
    setPhase('result');
  };

  // ── AUTOMAÇÃO COMPLETA QUANDO O JOGADOR FOR BOT ─────────────────────────
  useEffect(() => {
    if (!isBot) return;

    if (phase === 'intro') {
      const timer = setTimeout(() => {
        if (player.inspiration >= 1 && player.skill < 4) {
          setUseExtraDrawInspiration(true);
        }
        handleStartPresentation();
      }, 800);
      return () => clearTimeout(timer);
    }

    if (phase === 'drawing_step') {
      const timer = setTimeout(() => {
        if (cubeAwaitingPlacement && currentDrawnCube) {
          const validSlots = getValidSlotsForCube(currentDrawnCube);
          if (validSlots.length > 0) {
            const bestSlot = [...validSlots].sort((a, b) => {
              const mA = player.musicians.find(m => m.id === a.musicianId);
              const mB = player.musicians.find(m => m.id === b.musicianId);
              const ptsA = mA?.notes[a.noteIndex]?.points || 0;
              const ptsB = mB?.notes[b.noteIndex]?.points || 0;
              return ptsB - ptsA;
            })[0];
            handlePlaceCubeOnSlot(bestSlot.musicianId, bestSlot.noteIndex);
          } else {
            handleSkipCube();
          }
        } else {
          handleNextStep();
        }
      }, 750);
      return () => clearTimeout(timer);
    }

    if (phase === 'summary') {
      const timer = setTimeout(() => {
        const whiteIdx = unplacedCubes.findIndex(c => c === 'white');
        if (whiteIdx !== -1 && availableInspirationForElimination >= 1) {
          setEliminatedCubeIndex(whiteIdx);
        }
        const finalPts = calculateTotalPoints();
        const success = club ? finalPts >= effectiveSuccessThreshold : true;
        if (success && club && availableRewards.length > 0) {
          const priority = ['style', 'skill', 'renown', 'coins', 'vp'];
          const sorted = [...availableRewards].sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type));
          setSelectedRewardId(sorted[0].id);
        }
        handleFinalizePresentation();
      }, 900);
      return () => clearTimeout(timer);
    }

    if (phase === 'result' && savedNewState) {
      const timer = setTimeout(() => {
        onComplete(savedNewState);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [
    isBot,
    phase,
    cubeAwaitingPlacement,
    currentDrawnCube,
    unplacedCubes,
    availableInspirationForElimination,
    savedNewState,
  ]);

  if (isMinimized) {
    return (
      <BoardPeekBanner
        modalTitle={club ? `Show no ${club.name}` : 'Apresentação Musical'}
        onRestore={() => setIsMinimized(false)}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget && phase !== 'result' && !isNightPhase) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Modal de Apresentação de Show"
    >
      <div className="presentation-modal" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div className="presentation-modal__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="presentation-modal__title" style={{ margin: 0 }}>
                {club ? `🎷 Show no ${club.name}` : '🎷 Apresentação!'}
              </h2>
              {isBot && (
                <span style={{
                  background: 'linear-gradient(135deg, #e67e22, #d35400)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 12,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span>🤖</span>
                  <span>Apresentação do Bot</span>
                </span>
              )}
            </div>
            <p className="presentation-modal__subtitle" style={{ margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span>{player.name} •</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <SkillIcon size={14} />
                <span>Habilidade {player.skill}</span>
              </span>
              <span>({baseDrawCount} cubos base{hasSensei ? ' [🥋 +1 Sensei]' : ''})</span>
              {club && (
                <span>
                  • Meta do Clube: <strong>{effectiveSuccessThreshold} pts</strong>
                  {hasReduceThreshold && <span style={{ color: '#2ecc71', fontWeight: 600 }}> (Minimalismo: -1 pt)</span>}
                  {' • '}Lotação: {club.maxCapacity}
                </span>
              )}
            </p>
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
            {phase === 'intro' && !isNightPhase && (
              <button
                type="button"
                className="modal-close-btn"
                onClick={onCancel}
                aria-label="Cancelar apresentação"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── FASE 1: INTRO (Setup do Show & Inspiração Pré-Draw) ── */}
        {phase === 'intro' && (
          <div className="presentation-modal__intro" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {club && (
              <div className="presentation-modal__info-card" style={{ background: 'rgba(201,146,43,0.08)', border: '1px solid rgba(201,146,43,0.3)', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#f3c343', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ClubBadgeIcon clubId={club.id} size={22} />
                    {club.name}
                  </span>
                  <span className="badge" style={{ background: '#851c2e', color: '#fff', fontSize: 13, padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <PointsIcon size={14} />
                    Meta de Sucesso: {effectiveSuccessThreshold} pts{hasReduceThreshold ? ' (Minimalismo: -1)' : ''}
                  </span>
                </div>
                <div style={{ fontSize: 13.5, color: '#ebdccb', lineHeight: 1.45 }}>
                  • Lotação Máxima: <strong>{club.maxCapacity} pessoas</strong><br />
                  • Seu Renome: <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><RenownIcon size={14} /> {player.renown}</strong> (Público estimado: {player.renown * 10}{player.hasPublicityToken ? ' + 30 divulgação' : ''} pessoas ➔ Cachê: {Math.min(club.maxCapacity, player.renown * 10 + (player.hasPublicityToken ? 30 : 0)) / 10 + bonusCoinsFromStyle} moedas{bonusCoinsFromStyle > 0 ? ` [+${bonusCoinsFromStyle} Cachê Extra]` : ''})
                </div>
              </div>
            )}

            {hasSensei && (
              <div style={{ background: 'rgba(52,152,219,0.12)', border: '1px solid rgba(52,152,219,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🥋</span>
                <div>
                  <strong>Bônus do Sensei Ativo:</strong> Você retira <strong>+1 cubo extra</strong> nesta apresentação (Habilidade {player.skill} + 1 Sensei = <strong>{baseDrawCount} cubos base</strong>).
                </div>
              </div>
            )}

            {hasCachêExtra && (
              <div style={{ background: 'rgba(241,196,15,0.12)', border: '1px solid rgba(241,196,15,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f3c343', display: 'flex', alignItems: 'center', gap: 10 }}>
                <CoinIcon size={20} />
                <div>
                  <strong>Estilo Cachê Extra:</strong> Você ganha <strong>+{bonusCoinsFromStyle} moedas extras</strong> ao término do show (independentemente da lotação!).
                </div>
              </div>
            )}

            {hasStyle08 && (
              <div style={{ background: 'rgba(155,89,182,0.12)', border: '1px solid rgba(155,89,182,0.4)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#d29bfe', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🔄</span>
                <div>
                  <strong>Estilo Da Direita para Esquerda Ativo:</strong> Em 1 das suas cartas de músico sem essa habilidade, você pode começar alocando pelo slot mais à direita (ordem invertida).
                </div>
              </div>
            )}

            {/* Estilo 09: Seleção do Saco Principal */}
            {hasStyle09 && (
              <div style={{ background: 'rgba(52,152,219,0.12)', border: '1px solid rgba(52,152,219,0.4)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>✨ Estilo Seleção do Saco Principal (Opcional)</span>
                  </div>
                  {chosenMainBagCube && (
                    <button
                      type="button"
                      onClick={() => setChosenMainBagCube(null)}
                      style={{ background: 'transparent', border: 'none', color: '#ff7675', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      ✕ Não pegar nenhum
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: '#ebdccb', margin: '0 0 10px', lineHeight: 1.4 }}>
                  Você pode escolher 1 cubo do Saco Principal para colocar no seu saco antes do show:
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['blue', 'yellow', 'red', 'green', 'purple', 'black', 'orange'] as NoteColor[]).map(color => {
                    const countInMainBag = gameState.mainBag[color as keyof typeof gameState.mainBag] || 0;
                    if (countInMainBag <= 0) return null;
                    const isSelected = chosenMainBagCube === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setChosenMainBagCube(isSelected ? null : color)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: isSelected ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                          borderRadius: 8,
                          padding: '6px 10px',
                          cursor: 'pointer',
                        }}
                      >
                        <CubeToken color={color} size="sm" />
                        <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>
                          {COLOR_DATA[color]?.label} ({countInMainBag})
                        </span>
                        {isSelected && <span style={{ color: '#38bdf8', fontWeight: 700 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saco Preview */}
            <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 13.5, color: '#ebdccb', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Seu saco contém <strong>{player.bag.length + (chosenMainBagCube ? 1 : 0)} cubos</strong>:</span>
                <span style={{ color: '#f3c343', fontWeight: 600 }}>Comprará {totalDrawCount} cubos ({baseDrawCount} base{hasSensei ? ' com Sensei' : ''}{useExtraDrawInspiration ? ' + 1 Inspiração' : ''})</span>
              </div>
              <div className="presentation-modal__bag-preview" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(
                  (chosenMainBagCube ? [...player.bag, chosenMainBagCube] : player.bag).reduce<Record<string, number>>((a, c) => { a[c] = (a[c] || 0) + 1; return a; }, {})
                ).map(([color, count]) => (
                  <div key={color} className="bag-preview-item" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6 }}>
                    <CubeToken color={color as NoteColor} size="sm" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>×{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decisão de Inspiração ANTES do sorteio */}
            <div style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2ecc71', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InspirationIcon size={18} />
                    <span>Ficha de Inspiração (+1 Cubo Extra)</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#a89d91', marginTop: 2 }}>
                    {hasTacticalInspiration
                      ? '✨ Inspiração Tática: você pode ativar esta ficha agora ou a qualquer momento durante a apresentação!'
                      : 'Regra oficial: deve ser gasta antes de começar a retirar os cubos do saco.'}
                  </div>
                </div>
                {player.inspiration > 0 ? (
                  <button
                    type="button"
                    className={`btn-sm ${useExtraDrawInspiration ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setUseExtraDrawInspiration(!useExtraDrawInspiration)}
                    style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  >
                    <InspirationIcon size={14} />
                    <span>{useExtraDrawInspiration ? '✓ Inspiração Ativa' : `Usar Inspiração (${player.inspiration} disponível)`}</span>
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>Sem inspiração disponível</span>
                )}
              </div>
            </div>

            {/* Músicos da banda */}
            {player.musicians.length > 0 && (
              <div>
                <p style={{ fontSize: 13, color: '#c2ab8f', margin: '0 0 6px' }}>Sua banda pronta para tocar:</p>
                <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                  {player.musicians.map(m => (
                    <MusicianCardComponent key={m.id} musician={m} compact />
                  ))}
                </div>
              </div>
            )}

            <button
              id="start-gig-btn"
              className="btn-primary btn-lg"
              type="button"
              style={{ padding: '14px 20px', fontSize: 16, fontWeight: 700, marginTop: 8 }}
              onClick={handleStartPresentation}
            >
              🎲 Iniciar Apresentação e Retirar 1º Cubo
            </button>
          </div>
        )}

        {/* ── FASE 2: DRAWING STEP-BY-STEP ── */}
        {phase === 'drawing_step' && (
          <div className="presentation-modal__placing" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Barra de Habilidades Especiais Ativas Durante o Show */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Estilo 05: Inspiração Tática */}
              {hasTacticalInspiration && !useExtraDrawInspiration && player.inspiration >= 1 && (
                <button
                  type="button"
                  onClick={() => setUseExtraDrawInspiration(true)}
                  style={{
                    background: 'rgba(46,204,113,0.15)',
                    border: '1.5px solid #2ecc71',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#2ecc71',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  title="Gaste 1 Inspiração para comprar +1 cubo extra a qualquer momento da apresentação (Inspiração Tática)"
                >
                  <InspirationIcon size={16} />
                  <span>💡 Ativar +1 Cubo Extra c/ Inspiração (Inspiração Tática)</span>
                </button>
              )}

              {/* Estilo 02: Cubo Reservado Ativo */}
              {reservedCubeForAnytime && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isPlacingReservedCube ? 'rgba(56,189,248,0.25)' : 'rgba(56,189,248,0.12)',
                  border: isPlacingReservedCube ? '2px solid #38bdf8' : '1.5px solid rgba(56,189,248,0.5)',
                  borderRadius: 8,
                  padding: '4px 10px',
                }}>
                  <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 700 }}>
                    📦 Cubo Reservado (Flexibilidade):
                  </span>
                  <CubeToken color={reservedCubeForAnytime} size="sm" />
                  <button
                    type="button"
                    onClick={() => setIsPlacingReservedCube(!isPlacingReservedCube)}
                    style={{
                      background: isPlacingReservedCube ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                      color: isPlacingReservedCube ? '#000' : '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isPlacingReservedCube ? '✕ Cancelar Alocação' : '👉 Alocar este Cubo'}
                  </button>
                </div>
              )}
            </div>

            {/* Banner do Cubo Atual Retirado */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(22,36,54,0.9), rgba(15,23,42,0.95))',
              border: '2px solid rgba(243,195,67,0.4)',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {currentDrawnCube ? (
                  <div style={{ position: 'relative' }}>
                    <CubeToken color={currentDrawnCube} size="lg" />
                    <div style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: 10,
                      border: '2px solid #f3c343',
                      animation: 'pulse 1.5s infinite',
                      pointerEvents: 'none',
                    }} />
                  </div>
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: '#333' }} />
                )}

                <div>
                  <div style={{ fontSize: 12, color: '#f3c343', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Cubo {currentDrawStep} de {totalDrawCount} Retirado:
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                    {currentDrawnCube ? COLOR_DATA[currentDrawnCube]?.label : 'Nenhum'}
                  </div>
                </div>
              </div>

              {/* Ações para o cubo atual */}
              {cubeAwaitingPlacement ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {/* Estilo 01: Improvisação (Devolver ao saco e retirar outro) */}
                  {hasRedrawStyle && !hasUsedRedraw && currentDrawnCube && (
                    <button
                      id="redraw-cube-style-btn"
                      type="button"
                      className="btn-outline btn-sm"
                      style={{ padding: '8px 12px', fontSize: 12.5, borderColor: '#f1c40f', color: '#f1c40f', background: 'rgba(241,196,15,0.12)' }}
                      onClick={() => {
                        if (!currentDrawnCube || hasUsedRedraw) return;
                        const bagWithReturned = [...remainingBag, currentDrawnCube];
                        setAllDrawnCubes(prev => {
                          const copy = [...prev];
                          copy.pop();
                          return copy;
                        });
                        setHasUsedRedraw(true);
                        drawSingleCube(currentDrawStep, bagWithReturned);
                      }}
                      title="Devolva este cubo para o saco e retire outro (Improvisação - 1x por show)"
                    >
                      🔄 Devolver e Retirar Outro (Improvisação 1x)
                    </button>
                  )}

                  {/* Estilo 10: Pureza (Devolver cubo branco e retirar outro) */}
                  {hasStyle10 && !hasUsedWhiteRedraw && currentDrawnCube === 'white' && (
                    <button
                      id="redraw-white-cube-style-btn"
                      type="button"
                      className="btn-outline btn-sm"
                      style={{ padding: '8px 12px', fontSize: 12.5, borderColor: '#fff', color: '#fff', background: 'rgba(255,255,255,0.15)' }}
                      onClick={() => {
                        if (!currentDrawnCube || hasUsedWhiteRedraw) return;
                        const bagWithReturned = [...remainingBag, 'white' as NoteColor];
                        setAllDrawnCubes(prev => {
                          const copy = [...prev];
                          copy.pop();
                          return copy;
                        });
                        setHasUsedWhiteRedraw(true);
                        drawSingleCube(currentDrawStep, bagWithReturned);
                      }}
                      title="Devolva este cubo branco para o saco e retire outro (Pureza - 1x por show)"
                    >
                      🤍 Devolver Cubo Branco e Retirar Outro (Pureza 1x)
                    </button>
                  )}

                  {/* Estilo 02: Flexibilidade (Reservar cubo para alocar a qualquer momento) */}
                  {hasFlexibilidade && !hasUsedFlexibilidade && !reservedCubeForAnytime && currentDrawnCube && (
                    <button
                      id="reserve-cube-style-btn"
                      type="button"
                      className="btn-outline btn-sm"
                      style={{ padding: '8px 12px', fontSize: 12.5, borderColor: '#38bdf8', color: '#38bdf8', background: 'rgba(56,189,248,0.12)' }}
                      onClick={() => {
                        if (!currentDrawnCube) return;
                        setReservedCubeForAnytime(currentDrawnCube);
                        setHasUsedFlexibilidade(true);
                        setCubeAwaitingPlacement(false);
                      }}
                      title="Reserve este cubo para alocar a qualquer momento da apresentação (Flexibilidade - 1x por show)"
                    >
                      📥 Reservar Cubo (Flexibilidade 1x)
                    </button>
                  )}

                  {isWhiteBlocked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#ff7675', fontWeight: 600 }}>
                        🚫 Cubo branco não pode ser alocado em notas!
                      </span>
                      <button
                        id="skip-white-cube-btn"
                        type="button"
                        className="btn-outline btn-sm"
                        style={{ padding: '8px 14px', fontSize: 13, borderColor: '#fff' }}
                        onClick={handleSkipCube}
                      >
                        ➡️ Deixar de Lado
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 12, color: validSlots.length > 0 ? '#2ecc71' : '#f39c12', fontWeight: 600 }}>
                        {validSlots.length > 0 ? '👇 Clique em um slot destacado abaixo:' : 'Nenhum slot compatível disponível'}
                      </span>
                      <button
                        id="skip-cube-btn"
                        type="button"
                        className="btn-outline btn-sm"
                        style={{ padding: '8px 14px', fontSize: 13 }}
                        onClick={handleSkipCube}
                      >
                        ➡️ Deixar de Lado
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    id="next-draw-btn"
                    type="button"
                    className="btn-primary btn-md"
                    style={{ padding: '10px 18px', fontSize: 14, fontWeight: 700 }}
                    onClick={handleNextStep}
                  >
                    {currentDrawStep < totalDrawCount ? `🎲 Retirar Próximo Cubo (${currentDrawStep + 1}/${totalDrawCount}) ›` : '✓ Concluir Retiradas ›'}
                  </button>
                </div>
              )}
            </div>

            {/* Músicos e slots para alocação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#c2ab8f' }}>
                  Alocação na banda (ordem da esquerda para a direita, ou definida pelo 1º cubo):
                </span>
                <span style={{ fontSize: 14, color: '#38bdf8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <PointsIcon size={16} />
                  Pontuação atual: {calculateTotalPoints()} pts
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'stretch' }}>
                {player.musicians.map(musician => {
                  const mAssignments = assignments[musician.id] || [];
                  const musicianInPlay = {
                    ...musician,
                    filledNotes: mAssignments,
                  };

                  const targetSlotsForThis = validSlots.filter(v => v.musicianId === musician.id);
                  const hasValidSlot = targetSlotsForThis.length > 0;
                  const activeDirection = musicianDirections[musician.id];
                  const isStyle08Musician = style08MusicianId === musician.id;

                  return (
                    <div
                      key={musician.id}
                      style={{
                        flex: '1 1 200px',
                        maxWidth: '240px',
                        minWidth: '180px',
                        background: 'rgba(255,255,255,0.03)',
                        border: hasValidSlot ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: 8,
                        transition: 'border-color 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {activeDirection && (
                        <div style={{ fontSize: 10.5, color: '#f3c343', fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>
                          Ordem: {activeDirection === 'rtl' ? '◀️ Dir. p/ Esq.' : '▶️ Esq. p/ Dir.'}
                          {isStyle08Musician && <span style={{ color: '#d29bfe' }}> (Estilo 08)</span>}
                        </div>
                      )}
                      <MusicianCardComponent
                        musician={musicianInPlay}
                        disableHoverPreview={true}
                        onNoteClick={(noteIndex) => {
                          if (activeCubeForPlacement && targetSlotsForThis.some(t => t.noteIndex === noteIndex)) {
                            handlePlaceCubeOnSlot(musician.id, noteIndex);
                          }
                        }}
                        highlightSlotIndices={activeCubeForPlacement ? targetSlotsForThis.map(t => t.noteIndex) : []}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Histórico dos cubos retirados */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8a7a6e', paddingTop: 6 }}>
              <span>Cubos já retirados ({allDrawnCubes.length}/{totalDrawCount}):</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {allDrawnCubes.map((c, i) => (
                  <CubeToken key={i} color={c} size="sm" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FASE 3: RESUMO & ELIMINAÇÃO DE CUBO ── */}
        {phase === 'summary' && (
          <div className="presentation-modal__summary" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgba(201,146,43,0.1)',
              border: '1px solid rgba(201,146,43,0.3)',
              borderRadius: 10,
              padding: 16,
              textAlign: 'center',
            }}>
              <h3 style={{ margin: 0, fontSize: 20, color: '#f3c343' }}>
                Apresentação Concluída!
              </h3>
              <p style={{ margin: '6px 0 0', fontSize: 14.5, color: '#ebdccb', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                <span>Pontuação atingida:</span>
                <PointsIcon size={16} />
                <strong style={{ fontSize: 18, color: '#fff' }}>{calculateTotalPoints()} pts</strong>
                {club && (
                  <span> (Meta de {club.name}: <strong>{effectiveSuccessThreshold} pts</strong> ➔ {calculateTotalPoints() >= effectiveSuccessThreshold ? '🎉 SUCESSO!' : 'Meta não atingida'})</span>
                )}
              </p>
            </div>

            {/* Etapa c: Eliminar 1 cubo não colocado com Inspiração */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f3c343' }}>
                  🗑️ Eliminar um Cubo (Opcional — Custa 1 Inspiração)
                </span>
                <span style={{ fontSize: 12.5, color: '#a89d91' }}>
                  Inspirações disponíveis: {availableInspirationForElimination}
                </span>
              </div>
              <p style={{ fontSize: 12.5, color: '#c2ab8f', margin: '0 0 10px', lineHeight: 1.4 }}>
                Você pode gastar 1 Inspiração para descartar permanentemente da partida 1 cubo que foi retirado mas não colocado em uma carta (ótimo para expurgar cubos brancos!).
              </p>

              {unplacedCubes.length > 0 ? (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: '#8a7a6e' }}>Cubos não alocados:</span>
                  {unplacedCubes.map((cube, idx) => {
                    const isSelected = eliminatedCubeIndex === idx;
                    const canEliminate = availableInspirationForElimination > 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!canEliminate && !isSelected}
                        onClick={() => setEliminatedCubeIndex(isSelected ? null : idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          background: isSelected ? '#851c2e' : 'rgba(255,255,255,0.08)',
                          border: isSelected ? '2px solid #ff7675' : '1px solid rgba(255,255,255,0.2)',
                          borderRadius: 8,
                          padding: '5px 12px',
                          cursor: canEliminate || isSelected ? 'pointer' : 'not-allowed',
                          opacity: canEliminate || isSelected ? 1 : 0.4,
                        }}
                      >
                        <CubeToken color={cube} size="sm" />
                        <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>
                          {isSelected ? '✓ Eliminar' : 'Eliminar'}
                        </span>
                      </button>
                    );
                  })}
                  {eliminatedCube && (
                    <span style={{ fontSize: 12.5, color: '#ff7675', fontWeight: 700 }}>
                      (1 Inspiração será gasta para remover 1 cubo {COLOR_DATA[eliminatedCube]?.label})
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: 12.5, color: '#8a7a6e', fontStyle: 'italic' }}>
                  Todos os cubos retirados foram alocados em notas.
                </span>
              )}
            </div>

            {/* Etapa d: Escolha de Prêmio do Clube ao bater a meta */}
            {club && calculateTotalPoints() >= effectiveSuccessThreshold && (
              <div style={{
                background: 'rgba(243,195,67,0.08)',
                border: '1.5px solid rgba(243,195,67,0.4)',
                borderRadius: 10,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f3c343', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    🏆 Escolha o Prêmio de Apresentação em {club.name}
                  </span>
                  {hasPremioCobicado && (
                    <span style={{ fontSize: 11, background: '#9b59b6', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                      ✨ Estilo Prêmio Cobiçado Ativo
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: '#ebdccb', margin: 0, lineHeight: 1.4 }}>
                  Você atingiu a meta de {effectiveSuccessThreshold} pontos! Escolha 1 slot de prêmio disponível neste clube para colocar seu cubo e resgatar a recompensa:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                  {clubRewardsList.map(r => {
                    const isClaimed = !!r.claimedByPlayerId;
                    const claimingPlayer = isClaimed ? gameState.players.find(p => p.id === r.claimedByPlayerId) : null;
                    const canSelect = !isClaimed || hasPremioCobicado;
                    const isSelected = selectedRewardId === r.id;

                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={!canSelect}
                        onClick={() => {
                          setSelectedRewardId(r.id);
                          if (!isClaimed) setDisabledRewardId(null);
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: 4,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid #f3c343' : isClaimed ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(243,195,67,0.3)',
                          background: isSelected ? 'rgba(243,195,67,0.2)' : isClaimed ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.04)',
                          cursor: canSelect ? 'pointer' : 'not-allowed',
                          opacity: canSelect ? 1 : 0.45,
                          textAlign: 'left',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#f3c343' : '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <ClubRewardIcon reward={r} size={16} />
                            {r.label}
                          </span>
                          {isClaimed && (
                            <span style={{ fontSize: 10, color: claimingPlayer ? getPlayerColorHex(claimingPlayer.color) : '#e74c3c', fontWeight: 700 }}>
                              🔒 {claimingPlayer?.name || 'Ocupado'}{hasPremioCobicado ? ' (Disponível c/ Estilo)' : ''}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: '#ebdccb', lineHeight: 1.3 }}>{r.description}</span>
                        {isSelected && (
                          <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 700, marginTop: 2 }}>
                            ✓ Selecionado
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Opção Padrão Sempre Disponível (+1 Ponto) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRewardId('always_1_vp');
                      setDisabledRewardId(null);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 4,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: selectedRewardId === 'always_1_vp' || selectedRewardId === 'fallback_vp' ? '2px solid #38bdf8' : '1px dashed rgba(56,189,248,0.4)',
                      background: selectedRewardId === 'always_1_vp' || selectedRewardId === 'fallback_vp' ? 'rgba(56,189,248,0.2)' : 'rgba(56,189,248,0.05)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <PointsIcon size={14} /> +1 Ponto de Vitória
                      </span>
                      <span style={{ fontSize: 9.5, color: '#38bdf8', fontWeight: 600 }}>
                        (Sempre Disponível)
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#ebdccb', lineHeight: 1.3 }}>
                      Escolha +1 Ponto ao invés dos prêmios ou caso todos os slots estejam ocupados
                    </span>
                    {(selectedRewardId === 'always_1_vp' || selectedRewardId === 'fallback_vp') && (
                      <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700, marginTop: 2 }}>
                        ✓ Selecionado
                      </span>
                    )}
                  </button>
                </div>

                {/* Estilo 11: Se escolheu um prêmio já ocupado, deve escolher um prêmio livre para desabilitar */}
                {hasPremioCobicado && selectedRewardId && clubRewardsList.find(r => r.id === selectedRewardId)?.claimedByPlayerId && (
                  (() => {
                    const availableToDisable = clubRewardsList.filter(r => !r.claimedByPlayerId && r.id !== selectedRewardId);
                    if (availableToDisable.length === 0) return null;
                    return (
                      <div style={{ background: 'rgba(155,89,182,0.15)', border: '1.5px solid rgba(155,89,182,0.5)', borderRadius: 8, padding: 12, marginTop: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#d29bfe', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>✨ Estilo Prêmio Cobiçado: Bloquear Vaga Livre no Clube</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#ebdccb', margin: '0 0 8px', lineHeight: 1.35 }}>
                          Como você escolheu um prêmio que já havia sido resgatado, escolha 1 prêmio livre neste clube para desabilitar (ocupar a vaga com seu cubo):
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {availableToDisable.map(disR => {
                            const isChosenForDisable = disabledRewardId === disR.id;
                            return (
                              <button
                                key={disR.id}
                                type="button"
                                onClick={() => setDisabledRewardId(disR.id)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: 6,
                                  border: isChosenForDisable ? '2px solid #e74c3c' : '1px solid rgba(255,255,255,0.2)',
                                  background: isChosenForDisable ? 'rgba(231,76,60,0.3)' : 'rgba(255,255,255,0.05)',
                                  color: isChosenForDisable ? '#ff7675' : '#fff',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  cursor: 'pointer',
                                }}
                              >
                                {isChosenForDisable ? `🚫 Desabilitar: ${disR.label}` : disR.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Sub-escolha se a recompensa selecionada for de Estilo */}
                {selectedRewardId && clubRewardsList.find(r => r.id === selectedRewardId)?.type === 'style' && (
                  <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(243,195,67,0.3)', borderRadius: 8, padding: 10, marginTop: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f3c343', marginBottom: 6 }}>
                      Escolha a Carta de Estilo que deseja receber:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                      {player.reservedStyle && (
                        <button
                          type="button"
                          onClick={() => setSelectedStyleId(player.reservedStyle!.id)}
                          style={{
                            padding: 8,
                            borderRadius: 6,
                            border: selectedStyleId === player.reservedStyle.id ? '2px solid #9b59b6' : '1px solid rgba(155,89,182,0.4)',
                            background: selectedStyleId === player.reservedStyle.id ? 'rgba(155,89,182,0.25)' : 'rgba(155,89,182,0.1)',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#d29bfe' }}>🎩 Ativar Estilo Reservado</div>
                          <div style={{ fontSize: 11, color: '#fff' }}>{player.reservedStyle.name}</div>
                        </button>
                      )}
                      {[...gameState.decks.styles, ...gameState.market.styles].slice(0, 6).map(style => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedStyleId(style.id)}
                          style={{
                            padding: 8,
                            borderRadius: 6,
                            border: selectedStyleId === style.id ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.12)',
                            background: selectedStyleId === style.id ? 'rgba(243,195,67,0.15)' : 'rgba(255,255,255,0.03)',
                            textAlign: 'left',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>{style.name}</div>
                          <div style={{ fontSize: 10, color: '#ebdccb', lineHeight: 1.2 }}>{style.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              id="confirm-gig-summary-btn"
              className="btn-primary btn-lg"
              type="button"
              style={{ padding: '14px 20px', fontSize: 16, fontWeight: 700 }}
              onClick={handleFinalizePresentation}
            >
              ✓ Confirmar e Receber Recompensas
            </button>
          </div>
        )}

        {/* ── FASE 4: RESULT ── */}
        {phase === 'result' && (
          <div className="presentation-modal__result">
            <div className="result-animation">
              <div className="result-star">
                <PointsIcon size={32} />
              </div>
              <div className="result-star result-star--2">
                <PointsIcon size={40} />
              </div>
              <div className="result-star result-star--3">
                <PointsIcon size={32} />
              </div>
            </div>
            <h3 className="result-title">
              {club ? `Show em ${club.name} encerrado!` : 'Show encerrado!'}
            </h3>
            {club && (
              <div style={{ fontSize: 14.5, color: isSuccess ? '#2ecc71' : '#e67e22', fontWeight: 700, marginBottom: 8 }}>
                {isSuccess ? `🎉 Meta de sucesso alcançada (${totalPoints}/${effectiveSuccessThreshold} pts)!` : `Meta não atingida (${totalPoints}/${effectiveSuccessThreshold} pts)`}
              </div>
            )}
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat-label">Pontos de Vitória</span>
                <span className="result-stat-value result-stat-value--pts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <PointsIcon size={20} />
                  +{totalPoints}
                </span>
              </div>
              <div className="result-stat">
                <span className="result-stat-label">Público Presente</span>
                <span className="result-stat-value" style={{ color: '#3498db' }}>{finalAudience} pessoas</span>
              </div>
              <div className="result-stat">
                <span className="result-stat-label">Cachê Recebido</span>
                <span className="result-stat-value result-stat-value--coins" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CoinIcon size={20} />
                  +{totalCoins}{bonusCoinsFromStyle > 0 ? ` (+${bonusCoinsFromStyle} bônus)` : ''}
                </span>
              </div>
            </div>

            {player.styles.some(s => s.effectType === 'gain_composition_after_gig' || s.id === 'estilo_07') && (
              <div style={{
                marginTop: 12,
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(243,195,67,0.12)',
                border: '1px solid rgba(243,195,67,0.4)',
                color: '#f3c343',
                fontSize: 13,
                fontWeight: 700,
                textAlign: 'center',
              }}>
                ✨ <strong>Estilo Composição Bônus:</strong> Você ganhou 1 Partitura Nível {Math.max(2, player.skill - 1)}!
              </div>
            )}

            <button
              id="next-night-gig-btn"
              type="button"
              className="btn-primary btn-lg"
              style={{ marginTop: 18, width: '100%', padding: '14px', fontSize: 16, fontWeight: 700 }}
              onClick={() => {
                if (savedNewState) onComplete(savedNewState);
              }}
            >
              Avançar ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function getPlayerColorHex(color: string): string {
  const map: Record<string, string> = {
    red: '#c0392b', blue: '#2980b9', yellow: '#d4ac0d',
    green: '#27ae60', purple: '#8e44ad',
  };
  return map[color] || '#c9922b';
}
