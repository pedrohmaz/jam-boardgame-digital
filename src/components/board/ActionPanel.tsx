/**
 * ActionPanel — Painel de ações e decisões do jogador ativo
 *
 * Suporta:
 * - Baralho único de Músicos: 4 slots no mercado reposto no final do turno
 * - Rádio: Opção de tocar disco (+1 Renome) OU ganhar ficha de divulgação (+30 público); bônus das setas ativa AMBAS!
 * - Lojas: Compras múltiplas de recursos + limite de 1 cubo por turno
 * - Ir para Clube com tempo restante concede +1 Inspiração
 */

import { useState, useEffect } from 'react';
import type { GameState } from '../../types/game';
import { SKILL_STEPS_VALUES, SKILL_STEPS_LABELS } from '../../types/game';
import type { NoteColor } from '../../types/cards';
import { BOARD_LOCATIONS, CLUBS } from '../../types/board';
import { GameEngine } from '../../engine/gameEngine';
import CubeToken from '../common/CubeToken';
import { CoinIcon, SkillIcon, RenownIcon, InspirationIcon, ClubBadgeIcon } from '../common/GameIcons';
import ChapeuEstilosoModal from '../modals/ChapeuEstilosoModal';
import CardHoverPreview from '../common/CardHoverPreview';
import ClubHoverPreview from '../common/ClubHoverPreview';
import DiscardPileModal from '../modals/DiscardPileModal';

interface ActionPanelProps {
  gameState: GameState;
  onStateUpdate: (newState: GameState) => void;
  onOpenPresentation?: () => void;
  isActionBlocked?: boolean;
}

export default function ActionPanel({ gameState, onStateUpdate, isActionBlocked }: ActionPanelProps) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const { selectedLocation, hasActedThisTurn, isShoppingInLojas, hasBoughtCubeThisTurn, isForwardMovementInLojas } = gameState.turnActionState;
  const isClubSelectionPhase = gameState.phase === 'club_selection';

  const isDestinationSelected = selectedLocation !== null && selectedLocation !== player.boardPosition;
  const isShoppingAtLojas = isShoppingInLojas || (isDestinationSelected && selectedLocation === 4) || (player.boardPosition === 4 && selectedLocation === null);
  const activeLocIndex = isDestinationSelected ? selectedLocation : (isShoppingInLojas ? 4 : null);

  const locationDef = activeLocIndex !== null
    ? (BOARD_LOCATIONS.find(l => l.index === activeLocIndex) || BOARD_LOCATIONS[0])
    : null;

  const isInvertArrows = gameState.currentEvent?.effectType === 'invert_arrow_direction';
  const moveInfo = isDestinationSelected
    ? GameEngine.calculateMovement(player, selectedLocation!, gameState.players, isInvertArrows, gameState.neutralDie)
    : null;

  const hasCupons = player.resources.some(r => r.effectType === 'bonus_reverse_direction');
  const isForward = hasCupons || (moveInfo ? moveInfo.isForward : (isForwardMovementInLojas ?? true));

  const [activeTab, setActiveTab] = useState<'actions' | 'musicians' | 'resources' | 'clubs'>('actions');
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showChapeuModal, setShowChapeuModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState<'musicians' | 'resources' | null>(null);
  const [replacingMusicianSlot, setReplacingMusicianSlot] = useState<number | null>(null);

  // Seleções
  const [radioChoice, setRadioChoice] = useState<'play_disc' | 'publicity'>(player.discs.length > 0 ? 'play_disc' : 'publicity');
  const [selectedRadioDiscId, setSelectedRadioDiscId] = useState<string>('');
  const [conservatorioChoice, setConservatorioChoice] = useState<'skill' | 'compose'>('skill');
  const [spendInspirationCompose, setSpendInspirationCompose] = useState(false);
  const [recycleConservatorioCubes, setRecycleConservatorioCubes] = useState(false);
  const [chosenConsCubeIndex, setChosenConsCubeIndex] = useState<number>(0);
  const [chosenWorkshopColor, setChosenWorkshopColor] = useState<NoteColor>('red');

  const isWorkshop = gameState.currentEvent?.id === 'evento_05' ||
    gameState.currentEvent?.effectType === 'conservatorio_choose_any_cube' ||
    gameState.currentEvent?.effectType === 'conservatorio_choose_from_bag';

  const nextSkillStepIndex = Math.min(SKILL_STEPS_VALUES.length - 1, (player.skillStepIndex ?? 0) + 1);
  const isNumericSkillUp = SKILL_STEPS_VALUES[nextSkillStepIndex] > (SKILL_STEPS_VALUES[player.skillStepIndex ?? 0]);

  // Sincroniza escolha da rádio se os discos mudarem
  useEffect(() => {
    if (player.discs.length === 0) {
      setRadioChoice('publicity');
    }
  }, [player.discs.length]);

  // Se não houver inspiração, desmarca spendInspirationCompose
  useEffect(() => {
    if (player.inspiration < 1) {
      setSpendInspirationCompose(false);
    }
  }, [player.inspiration]);

  // Muda automaticamente para a aba de ações sempre que o jogador clica em um local válido
  useEffect(() => {
    if (selectedLocation !== null) {
      setActiveTab('actions');
    }
  }, [selectedLocation]);

  const showFeedback = (ok: boolean, msg: string) => {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  // ─── 1: Rádio ─────────────────────────────────────────────────────────────
  const handleRadioAction = () => {
    if (isActionBlocked || hasActedThisTurn || !isDestinationSelected) return;
    const { newState, success, message } = GameEngine.performRadioAction(
      gameState,
      selectedRadioDiscId || undefined,
      radioChoice
    );
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
    } else {
      showFeedback(false, message);
    }
  };

  // ─── 2: Conservatório ─────────────────────────────────────────────────────
  const handleConservatorioConfirm = () => {
    if (isActionBlocked || hasActedThisTurn || !isDestinationSelected) return;

    if (conservatorioChoice === 'skill') {
      const { newState, success, message } = GameEngine.performConservatorioGainSkill(
        gameState,
        {
          chosenConservatorioCubeIndex: isForward && !recycleConservatorioCubes ? (isWorkshop ? undefined : chosenConsCubeIndex) : undefined,
          chosenWorkshopColor: isForward && isWorkshop && !recycleConservatorioCubes ? chosenWorkshopColor : undefined,
          recycleConservatorioCubes: isForward ? recycleConservatorioCubes : false,
        }
      );
      if (success) {
        onStateUpdate(newState);
        showFeedback(true, message);
      } else {
        showFeedback(false, message);
      }
    } else {
      const { newState, success, message } = GameEngine.performConservatorioCompose(
        gameState,
        spendInspirationCompose && player.inspiration >= 1,
        isForward && !recycleConservatorioCubes ? (isWorkshop ? undefined : chosenConsCubeIndex) : undefined,
        isForward && isWorkshop && !recycleConservatorioCubes ? chosenWorkshopColor : undefined,
        isForward ? recycleConservatorioCubes : false
      );
      if (success) {
        onStateUpdate(newState);
        showFeedback(true, message);
      } else {
        showFeedback(false, message);
      }
    }
  };

  // ─── 3: Ruas (Contratar do mercado de 4 slots) ────────────────────────────
  const handleHireMusician = (slotIndex: number, replacedMusicianId?: string) => {
    if (isActionBlocked || hasActedThisTurn || !isDestinationSelected) return;
    const { newState, success, message } = GameEngine.performRuasHireMusician(gameState, slotIndex, replacedMusicianId);
    if (success) {
      setReplacingMusicianSlot(null);
      onStateUpdate(newState);
      showFeedback(true, message);
    } else {
      showFeedback(false, message);
    }
  };

  // ─── 4: Gravadora ─────────────────────────────────────────────────────────
  const handleGravadoraRecord = (compositionId?: string) => {
    if (isActionBlocked || hasActedThisTurn || !isDestinationSelected) return;
    const { newState, success, message } = GameEngine.performGravadoraRecordDisc(gameState, compositionId);
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
    } else {
      showFeedback(false, message);
    }
  };

  // ─── 5: Lojas (Comprar Recurso - Múltiplas compras) ───────────────────────
  const handleBuyResource = (slotIndex: number) => {
    if (isActionBlocked || hasActedThisTurn) return;
    const res = gameState.market.resources[slotIndex];
    const isChapeu = res?.id === 'recurso_11' || res?.effectType === 'reserve_style_card';

    const { newState, success, message } = GameEngine.performLojasBuyResource(gameState, slotIndex);
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
      if (isChapeu) {
        setShowChapeuModal(true);
      }
    } else {
      showFeedback(false, message);
    }
  };

  const handleChapeuConfirm = (chosenStyleId: string, replacedStyleId?: string) => {
    const { newState, success, message } = GameEngine.performChapeuEstilosoChoose(gameState, chosenStyleId, replacedStyleId);
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
    }
    setShowChapeuModal(false);
  };

  // ─── 5: Lojas (Comprar Cubo - 1 por turno) ────────────────────────────────
  const handleBuyCube = (color: NoteColor) => {
    if (isActionBlocked || hasActedThisTurn) return;
    const { newState, success, message } = GameEngine.performLojasBuyCube(gameState, color);
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
    } else {
      showFeedback(false, message);
    }
  };

  // ─── 5: Lojas (Vender Disco - Bônus de Movimento) ─────────────────────────
  const handleSellDisc = (discId: string) => {
    if (isActionBlocked || hasActedThisTurn) return;
    const { newState, success, message } = GameEngine.performLojasSellDisc(gameState, discId);
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
    } else {
      showFeedback(false, message);
    }
  };

  // ─── 5: Lojas (Finalizar Compras) ─────────────────────────────────────────
  const handleFinishShopping = () => {
    if (isActionBlocked) return;
    const newState = GameEngine.performLojasFinishShopping(gameState);
    onStateUpdate(newState);
    showFeedback(true, 'Compras finalizadas! Agora você pode passar o turno.');
  };

  // ─── 6: Parque ────────────────────────────────────────────────────────────
  const handleParqueAction = () => {
    if (isActionBlocked || hasActedThisTurn || !isDestinationSelected) return;
    const { newState, success, message } = GameEngine.performParqueAction(gameState);
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
    } else {
      showFeedback(false, message);
    }
  };

  // ─── Ir para o Clube (Noite) ──────────────────────────────────────────────
  const handleGoToClub = (clubId: string) => {
    if (isActionBlocked) return;
    const { newState, success, message } = GameEngine.goToClub(
      gameState,
      clubId as any
    );
    if (success) {
      onStateUpdate(newState);
      showFeedback(true, message);
    } else {
      showFeedback(false, message);
    }
  };

  // ─── Passar Turno ─────────────────────────────────────────────────────────
  const handleEndTurn = () => {
    if (isActionBlocked) {
      showFeedback(false, 'Finalize a decisão no modal ativo antes de passar o turno.');
      return;
    }
    if (!hasActedThisTurn && !player.hasFinishedDay) {
      showFeedback(false, 'Você precisa se mover e realizar a ação antes de passar o turno.');
      return;
    }
    const newState = GameEngine.nextTurn(gameState);
    onStateUpdate(newState);
  };

  // ─── TELA ESPECIAL: ESCOLHA DE CLUBES PARA QUEM VOLTOU À CASA ─────────────
  if (isClubSelectionPhase) {
    return (
      <div className="action-panel">
        <div className="action-panel__location" style={{ borderLeftColor: '#c9922b' }}>
          <span className="action-panel__location-icon" style={{ fontSize: 24 }}>🏠</span>
          <div style={{ flex: 1 }}>
            <div className="action-panel__location-name">Escolha de Clube (Na Casa)</div>
            <div className="action-panel__location-sub">
              {player.name} • Renome: <strong>{player.renown}</strong> • Habilidade: <strong>{player.skill}</strong>
            </div>
          </div>
        </div>

        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.82rem', color: '#f1c40f', fontWeight: 600, background: 'rgba(241,196,15,0.1)', padding: 8, borderRadius: 8, border: '1px solid rgba(241,196,15,0.3)' }}>
            🎪 Seu tempo na cidade encerrou. Escolha agora em qual clube de Jazz você fará sua apresentação nesta noite! (Passe o mouse no símbolo para ver prêmios)
          </div>

          {feedback && (
            <div
              className={`feedback-msg ${feedback.ok ? 'feedback-msg--ok' : 'feedback-msg--err'}`}
              style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: 6 }}
            >
              {feedback.msg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CLUBS.map(club => {
              const isEligible = player.renown >= club.minRenown;
              const maxCapacity = club.isUnlimited ? Infinity : (gameState.players.length === 2 ? 1 : 2);
              const otherOccupantsCount = gameState.players.filter(p => p.id !== player.id && p.chosenClub === club.id).length;
              const isFull = otherOccupantsCount >= maxCapacity;
              const canChoose = isEligible && !isFull;
              const clubRewards = gameState.clubRewards ? gameState.clubRewards[club.id] || [] : [];

              return (
                <div
                  key={club.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0.65rem 0.85rem',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    opacity: !canChoose ? 0.45 : 1,
                  }}
                >
                  <ClubHoverPreview
                    club={club}
                    rewards={clubRewards}
                    players={gameState.players}
                  >
                    <div
                      style={{
                        cursor: 'help',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 3,
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                      title="Passe o mouse para ver os prêmios deste clube"
                    >
                      <ClubBadgeIcon clubId={club.id} size={28} />
                    </div>
                  </ClubHoverPreview>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0ede8' }}>
                      {club.name}
                      {!club.isUnlimited && (
                        <span style={{ fontSize: 10, color: '#f3c343', marginLeft: 6 }}>
                          [{maxCapacity - otherOccupantsCount}/{maxCapacity} vaga{maxCapacity > 1 ? 's' : ''}]
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#ebdccb', marginTop: 2 }}>
                      Lotação: {club.maxCapacity} • Meta: {club.successThreshold} pts • Req: Renome {club.minRenown}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                    onClick={() => handleGoToClub(club.id)}
                    disabled={!canChoose}
                  >
                    {isFull ? 'Lotado 🚫' : !isEligible ? `Renome ${club.minRenown}` : 'Escolher Clube'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="action-panel">
      {/* Header do Local em Foco */}
      <div className="action-panel__location" style={{ borderLeftColor: locationDef ? locationDef.color : '#8a7a6e' }}>
        <span className="action-panel__location-icon" style={{ fontSize: 24 }}>
          {locationDef ? locationDef.icon : '🚶'}
        </span>
        <div style={{ flex: 1 }}>
          <div className="action-panel__location-name">
            {locationDef ? locationDef.name : 'Selecione um Local no Mapa'}
            {moveInfo && (
              <span style={{ fontSize: 10, color: '#f1c40f', marginLeft: 6 }}>
                (Custo: {moveInfo.timeCost}t{moveInfo.visitingFee > 0 ? ` • ${moveInfo.visitingFee}🪙` : ''})
              </span>
            )}
          </div>
          <div className="action-panel__location-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>Tempo: <strong>{player.timeMarker}t</strong></span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <CoinIcon size={14} />
              <strong>{player.coins}</strong>
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <RenownIcon size={14} />
              <strong>{player.renown}/10</strong>
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <SkillIcon size={14} />
              <strong>Nv.{player.skill}</strong>
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <InspirationIcon size={14} />
              <strong>{player.inspiration}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de Modo Espiar Tabuleiro Ativo */}
      {isActionBlocked && (
        <div
          style={{
            margin: '0.4rem 0.75rem',
            padding: '0.6rem 0.85rem',
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(243,195,67,0.2) 0%, rgba(201,146,43,0.1) 100%)',
            border: '1.5px solid #f3c343',
            color: '#f0ede8',
            fontSize: '0.78rem',
            lineHeight: 1.4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          🔒 <strong>Modo Espiar Tabuleiro:</strong> As ações e a passagem de turno estão temporariamente travadas. Conclua sua decisão no modal ativo (veja o botão flutuante na parte inferior) para poder jogar.
        </div>
      )}

      {/* Alerta de Movimento Obrigatório */}
      {!isActionBlocked && !isDestinationSelected && !hasActedThisTurn && !isShoppingInLojas && (
        <div
          style={{
            margin: '0.4rem 0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            background: 'rgba(230,126,34,0.15)',
            border: '1px solid rgba(230,126,34,0.4)',
            color: '#f39c12',
            fontSize: '0.76rem',
            fontWeight: 600,
          }}
        >
          ⚠️ Movimento Obrigatório: Clique em um local no tabuleiro antes de escolher sua ação!
        </div>
      )}

      {/* Alerta de Ação Concluída */}
      {hasActedThisTurn && !isShoppingInLojas && (
        <div
          style={{
            margin: '0.4rem 0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: 8,
            background: 'rgba(46,204,113,0.15)',
            border: '1px solid rgba(46,204,113,0.4)',
            color: '#2ecc71',
            fontSize: '0.78rem',
            fontWeight: 600,
          }}
        >
          ✓ Ação realizada! Passe a vez para o próximo jogador.
        </div>
      )}

      {/* Feedback Efêmero */}
      {feedback && (
        <div className={`action-feedback ${feedback.ok ? 'action-feedback--ok' : 'action-feedback--err'}`}>
          {feedback.ok ? '✓' : '✕'} {feedback.msg}
        </div>
      )}

      {/* Abas */}
      <div className="action-panel__tabs">
        {(['actions', 'musicians', 'resources', 'clubs'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            id={`tab-${tab}`}
            className={`action-tab ${activeTab === tab ? 'action-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'actions' && '⚡ Ações'}
            {tab === 'musicians' && '🎷 Músicos'}
            {tab === 'resources' && '📦 Lojas'}
            {tab === 'clubs' && '🎪 Clubes'}
          </button>
        ))}
      </div>

      <div className="action-panel__content">
        {/* ─── TAB: AÇÕES DO LOCAL ────────────────────────────── */}
        {activeTab === 'actions' && (
          <div className="actions-tab">
            <div className="action-group-title">
              {locationDef ? `Ação de ${locationDef.name}` : 'Ações Disponíveis'}
              {locationDef && isForward && ' (com Bônus das Setas)'}
            </div>

            {!isDestinationSelected && !isShoppingInLojas && (
              <p style={{ fontSize: '0.78rem', color: '#8a7a6e' }}>
                Você começou o turno na posição atual. Clique em outro local no tabuleiro para onde deseja ir.
              </p>
            )}

            {/* 1: Rádio */}
            {activeLocIndex === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c9922b', textTransform: 'uppercase' }}>
                  📻 Ação na Rádio:
                </div>

                {isForward ? (
                  <div style={{ fontSize: '0.75rem', color: '#2ecc71', background: 'rgba(46,204,113,0.1)', padding: 8, borderRadius: 6, border: '1px solid rgba(46,204,113,0.3)' }}>
                    🎁 <strong>Bônus das Setas Ativo:</strong> Você realiza as <strong>DUAS</strong> ações: toca seu disco (+1 Renome) <strong>E</strong> ganha a Ficha de Divulgação (+30 público no show)!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: '0.75rem', color: '#f0ede8' }}>
                      Escolha qual ação realizar na Rádio:
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#f0ede8', cursor: player.discs.length > 0 ? 'pointer' : 'not-allowed', opacity: player.discs.length > 0 ? 1 : 0.4 }}>
                      <input
                        type="radio"
                        name="radioOption"
                        checked={radioChoice === 'play_disc'}
                        onChange={() => setRadioChoice('play_disc')}
                        disabled={player.discs.length === 0 || hasActedThisTurn}
                      />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span>💿 Tocar Disco de Vinil (+1</span>
                        <RenownIcon size={14} />
                        <span>Renome) {player.discs.length === 0 ? '— Sem discos' : ''}</span>
                      </span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#f0ede8', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="radioOption"
                        checked={radioChoice === 'publicity'}
                        onChange={() => setRadioChoice('publicity')}
                        disabled={hasActedThisTurn}
                      />
                      <span>📢 Ganhar Ficha de Divulgação (+30 público no próximo show)</span>
                    </label>
                  </div>
                )}

                {/* Seleção de disco para tocar */}
                {(isForward || radioChoice === 'play_disc') && (
                  <div>
                    {player.discs.length > 0 ? (
                      <>
                        <div style={{ fontSize: '0.72rem', color: '#8a7a6e', marginBottom: 4 }}>
                          Selecione o disco para tocar (nível reduzirá em 1):
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {player.discs.map(disc => (
                            <div
                              key={disc.id}
                              onClick={() => !hasActedThisTurn && setSelectedRadioDiscId(disc.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: (selectedRadioDiscId === disc.id || (!selectedRadioDiscId && player.discs[0]?.id === disc.id))
                                  ? '2px solid #f1c40f'
                                  : '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(201,146,43,0.15)',
                                color: '#f1c40f',
                                fontSize: 10,
                                fontWeight: 600,
                                cursor: hasActedThisTurn ? 'default' : 'pointer',
                              }}
                            >
                              💿 Vinil Nv{disc.level} {disc.level === 1 ? '(descartará)' : `➔ Nv${disc.level - 1}`}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: '#e67e22', fontStyle: 'italic' }}>
                        Nenhum disco gravado. {isForward ? 'Você receberá apenas a Ficha de Divulgação.' : ''}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 4, width: '100%' }}
                  onClick={handleRadioAction}
                  disabled={hasActedThisTurn}
                >
                  📻 Confirmar Ação na Rádio
                </button>
              </div>
            )}

            {/* 2: Gravadora */}
            {activeLocIndex === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c9922b', marginBottom: 2 }}>
                  Custo de gravação: <strong>{isForward ? '3 moedas (desconto de 1 moeda do bônus)' : '4 moedas'}</strong>
                </div>
                {player.compositions.length > 0 ? (
                  player.compositions.map(comp => {
                    const cost = isForward ? 3 : 4;
                    const canAfford = player.coins >= cost;

                    return (
                      <ActionButton
                        key={comp.id}
                        id={`action-record-${comp.id}`}
                        icon="💿"
                        label={`Gravar Partitura Nível ${comp.level} em Disco (${cost} moedas)`}
                        description={`Custa ${cost} moedas para gravar a partitura em Vinil`}
                        disabled={hasActedThisTurn || !canAfford}
                        onClick={() => handleGravadoraRecord(comp.id)}
                        highlight={!hasActedThisTurn && canAfford}
                      />
                    );
                  })
                ) : (
                  <p style={{ fontSize: '0.78rem', color: '#8a7a6e' }}>
                    Você não possui partituras para gravar. Vá ao Conservatório para compor novas músicas!
                  </p>
                )}
              </div>
            )}

            {/* 3: Conservatório */}
            {activeLocIndex === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#c9922b', textTransform: 'uppercase' }}>
                  Escolha sua ação no Conservatório:
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#f0ede8' }}>
                  <input
                    type="radio"
                    name="consChoice"
                    checked={conservatorioChoice === 'skill'}
                    onChange={() => setConservatorioChoice('skill')}
                    disabled={hasActedThisTurn}
                  />
                  <div>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <SkillIcon size={16} />
                      <span>Ganhar Habilidade</span>
                    </strong>
                    <div style={{ fontSize: '0.7rem', color: '#8a7a6e' }}>
                      Avança na trilha (Atual: Passo {SKILL_STEPS_LABELS[player.skillStepIndex ?? 0]} • Nível {player.skill} / Próximo: Passo {SKILL_STEPS_LABELS[nextSkillStepIndex]} • Nível {SKILL_STEPS_VALUES[nextSkillStepIndex]})
                    </div>
                  </div>
                </label>

                {conservatorioChoice === 'skill' && isNumericSkillUp && (
                  <div style={{ background: 'rgba(243,195,67,0.08)', border: '1px solid rgba(243,195,67,0.3)', borderRadius: 8, padding: '8px 10px', marginTop: 2 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#f3c343', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <SkillIcon size={15} />
                      <span>Avanço de Nível ({player.skill} ➔ {SKILL_STEPS_VALUES[nextSkillStepIndex]}): Você ganhará 1 cubo do Saco Principal!</span>
                    </div>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: '#f0ede8' }}>
                  <input
                    type="radio"
                    name="consChoice"
                    checked={conservatorioChoice === 'compose'}
                    onChange={() => setConservatorioChoice('compose')}
                    disabled={hasActedThisTurn}
                  />
                  <div>
                    <strong>✍️ Compor uma Música</strong>
                    <div style={{ fontSize: '0.7rem', color: '#8a7a6e' }}>
                      {(() => {
                        const hasCaderno = player.resources.some(r => r.id === 'recurso_03' || r.effectType === 'composition_bonus_level');
                        const baseLvl = player.skill + (hasCaderno ? 1 : 0);
                        const finalLvl = baseLvl + (spendInspirationCompose ? 1 : 0);
                        return `Cria uma Partitura Nível ${finalLvl} ${hasCaderno ? '(+1 pelo Caderno de Composição)' : ''} ${spendInspirationCompose ? '(+1 por Inspiração)' : ''}`;
                      })()}
                    </div>
                  </div>
                </label>

                {conservatorioChoice === 'compose' && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#2ecc71', background: 'rgba(46,204,113,0.08)', padding: '4px 8px', borderRadius: 6, cursor: player.inspiration >= 1 ? 'pointer' : 'not-allowed', border: '1px solid rgba(46,204,113,0.2)' }}>
                    <input
                      type="checkbox"
                      checked={spendInspirationCompose}
                      onChange={e => setSpendInspirationCompose(e.target.checked)}
                      disabled={player.inspiration < 1 || hasActedThisTurn}
                    />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <InspirationIcon size={14} />
                      <span>Gastar 1 Inspiração para +1 Nível de Composição (possui {player.inspiration})</span>
                    </span>
                  </label>
                )}

                {isForward && (
                  <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    {isWorkshop ? (
                      <>
                        <div style={{ fontSize: 10, color: '#f3c343', fontWeight: 700, marginBottom: 6 }}>
                          🎪 EVENTO WORKSHOP (BÔNUS): Escolha 1 cubo do Saco Principal (qualquer uma das 4 cores):
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {(['red', 'blue', 'yellow', 'purple'] as NoteColor[]).map((color) => {
                            const count = gameState.mainBag[color as keyof typeof gameState.mainBag] || 0;
                            const isSelected = chosenWorkshopColor === color;
                            const isAvailable = count > 0;
                            return (
                              <div
                                key={color}
                                onClick={() => !hasActedThisTurn && isAvailable && setChosenWorkshopColor(color)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  border: isSelected ? '2px solid #f3c343' : '1px solid rgba(255,255,255,0.2)',
                                  background: isSelected ? 'rgba(243,195,67,0.25)' : 'rgba(255,255,255,0.05)',
                                  cursor: hasActedThisTurn || !isAvailable ? 'default' : 'pointer',
                                  opacity: isAvailable ? 1 : 0.4,
                                }}
                              >
                                <CubeToken color={color} size="sm" />
                                <span style={{ fontSize: 10, color: '#f0ede8', textTransform: 'capitalize' }}>
                                  {color} ({count})
                                </span>
                                {isSelected && <span style={{ color: '#f3c343', fontSize: 10 }}>✓</span>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : gameState.conservatorioCubes.length > 0 ? (
                      <>
                        <div style={{ fontSize: 10, color: '#2ecc71', fontWeight: 700, marginBottom: 6 }}>
                          🎁 BÔNUS DAS SETAS: Escolha 1 cubo disponível ou opte por reciclar:
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {gameState.conservatorioCubes.map((color, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                if (!hasActedThisTurn) {
                                  setRecycleConservatorioCubes(false);
                                  setChosenConsCubeIndex(idx);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: (!recycleConservatorioCubes && chosenConsCubeIndex === idx) ? '2px solid #2ecc71' : '1px solid rgba(255,255,255,0.2)',
                                background: (!recycleConservatorioCubes && chosenConsCubeIndex === idx) ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)',
                                cursor: hasActedThisTurn ? 'default' : 'pointer',
                              }}
                            >
                              <CubeToken color={color} size="sm" />
                              <span style={{ fontSize: 10, color: '#f0ede8', textTransform: 'capitalize' }}>Pegar {color}</span>
                              {(!recycleConservatorioCubes && chosenConsCubeIndex === idx) && <span style={{ color: '#2ecc71', fontSize: 10 }}>✓</span>}
                            </div>
                          ))}

                          {/* Opção de Não Pegar Cubo e Reciclar Conservatório */}
                          <div
                            onClick={() => !hasActedThisTurn && setRecycleConservatorioCubes(true)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: recycleConservatorioCubes ? '2px solid #38bdf8' : '1px dashed rgba(56,189,248,0.4)',
                              background: recycleConservatorioCubes ? 'rgba(56,189,248,0.25)' : 'rgba(56,189,248,0.05)',
                              cursor: hasActedThisTurn ? 'default' : 'pointer',
                            }}
                          >
                            <span style={{ fontSize: 11 }}>🔄</span>
                            <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 600 }}>Não pegar cubo (Reciclar Conservatório)</span>
                            {recycleConservatorioCubes && <span style={{ color: '#38bdf8', fontSize: 10 }}>✓</span>}
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: 4, width: '100%' }}
                  onClick={handleConservatorioConfirm}
                  disabled={hasActedThisTurn}
                >
                  ✓ Confirmar Ação no Conservatório
                </button>
              </div>
            )}

            {/* 4: Lojas */}
            {activeLocIndex === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ActionButton
                  id="action-lojas"
                  icon="🏪"
                  label={isShoppingInLojas ? "Continuar Comprando na Loja" : "Ir às Compras nas Lojas"}
                  description="Compre múltiplos recursos e cubos musicais na aba Lojas"
                  disabled={hasActedThisTurn}
                  onClick={() => setActiveTab('resources')}
                  highlight={!hasActedThisTurn && !isShoppingInLojas}
                />
                {!hasActedThisTurn && (
                  <ActionButton
                    id="action-finish-lojas"
                    icon="✓"
                    label="Concluir Compras nas Lojas"
                    description="Finaliza sua visita às Lojas e habilita passar o turno"
                    onClick={handleFinishShopping}
                    highlight={isShoppingInLojas || hasBoughtCubeThisTurn}
                  />
                )}
              </div>
            )}

            {/* 5: Ruas */}
            {activeLocIndex === 5 && (
              <ActionButton
                id="action-ruas"
                icon="🎻"
                label="Contratar Músicos nas Ruas"
                description={isForward ? 'Abra a aba Músicos (+1 Inspiração pelo bônus das setas!)' : 'Abra a aba Músicos'}
                disabled={hasActedThisTurn}
                onClick={() => setActiveTab('musicians')}
                highlight={!hasActedThisTurn}
              />
            )}

            {/* 6: Parque */}
            {activeLocIndex === 6 && (() => {
              const otherPlayersAtPark = gameState.players.filter(p => p.id !== player.id && p.boardPosition === 6);
              const hasNeutralDieAtPark = !!(gameState.neutralDie && gameState.neutralDie.position === 6);
              const isAlone = otherPlayersAtPark.length === 0 && !hasNeutralDieAtPark;
              const aloneBonus = isAlone ? 2 : 0;
              const hasCaixaDeSom = player.resources.some(r => r.effectType === 'coin_on_park_action');
              const caixaBonus = hasCaixaDeSom ? 1 : 0;
              const isDiaChuvoso = gameState.currentEvent?.effectType === 'park_half_coins';
              const subtotal = player.renown + aloneBonus + caixaBonus;
              const finalCoins = isDiaChuvoso ? Math.ceil(subtotal / 2) : subtotal;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <ActionButton
                    id="action-parque"
                    icon="🌳"
                    label={`Tocar no Parque (+${finalCoins} moedas)`}
                    description="Ganhe moedas pelo seu Renome com bônus de setor vazio e melhorias"
                    disabled={hasActedThisTurn}
                    onClick={handleParqueAction}
                    highlight={!hasActedThisTurn}
                  />
                  <div style={{
                    background: 'rgba(39,174,96,0.1)',
                    border: '1px solid rgba(39,174,96,0.3)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    color: '#ebdccb',
                    lineHeight: 1.4,
                  }}>
                    <div style={{ fontWeight: 700, color: '#2ecc71', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CoinIcon size={14} />
                      Previsão de Ganho: +{finalCoins} moedas
                    </div>
                    <div>• Renome base: <strong>+{player.renown}</strong></div>
                    <div>• Setor pequeno (sozinho): <strong>{isAlone ? '+2 (Ativo)' : '+0 (Ocupado)'}</strong></div>
                    {hasCaixaDeSom && <div>• Caixa de Som: <strong>+1</strong></div>}
                    {isDiaChuvoso && <div style={{ color: '#38bdf8' }}>• Evento Dia Chuvoso: metade arredondada p/ cima (÷ 2)</div>}
                  </div>
                </div>
              );
            })()}

            <div className="action-divider" />
            <div className="action-group-title">Encerramento do Turno</div>

            <ActionButton
              id="action-end-turn"
              icon="→"
              label="Passar Turno"
              description={hasActedThisTurn ? 'Passa a vez para o próximo jogador' : 'Realize sua ação antes de passar a vez'}
              onClick={handleEndTurn}
              disabled={!hasActedThisTurn && !player.hasFinishedDay}
              highlight={hasActedThisTurn}
            />
          </div>
        )}

        {/* ─── TAB: MÚSICOS (4 SLOTS DO BARALHO ÚNICO) ───────── */}
        {activeTab === 'musicians' && (
          <div className="musicians-tab" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="market-note">
              {activeLocIndex === 5 && isForward
                ? '✓ Ruas com Bônus das Setas: ganhe +1 ficha de Inspiração ao contratar!'
                : isDestinationSelected && activeLocIndex === 5
                  ? 'Contrate 1 músico para sua banda. O slot será reposto no final do seu turno.'
                  : '⚠️ Selecione as Ruas no mapa para poder contratar 1 músico.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#c9922b' }}>
                Músicos Disponíveis no Mercado (4 Slots):
              </span>
              <button
                type="button"
                onClick={() => setShowDiscardModal('musicians')}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#f0ede8',
                  cursor: 'pointer',
                }}
                title="Ver cartas de músicos descartadas/fora de jogo"
              >
                📜 Descarte ({gameState.decks.discardedMusicians?.length || 0})
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gameState.market.musicians.map((musician, slotIdx) => {
                if (!musician) {
                  return (
                    <div
                      key={slotIdx}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        textAlign: 'center',
                        fontSize: 10,
                        color: '#8a7a6e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      Slot {slotIdx + 1}: Contratado (será reposto no fim do turno)
                    </div>
                  );
                }

                const cost = musician.cost;
                const maxMusicians = (player.maxMusicians || 3) >= 4 || player.resources.some(r => r.id === 'recurso_09' || r.effectType === 'musician_hand_size_4') ? 4 : 3;
                const canAfford = player.coins >= cost && !hasActedThisTurn && isDestinationSelected && activeLocIndex === 5 && !isActionBlocked;
                const hasSpace = player.musicians.length < maxMusicians;
                const canHire = canAfford && !hasActedThisTurn && !isActionBlocked;

                return (
                  <div key={musician.id} className={`musician-market-card ${!canHire ? 'musician-market-card--disabled' : ''}`}>
                    {musician.image && (
                      <CardHoverPreview musician={musician}>
                        <img src={musician.image} alt={musician.name} className="musician-market-card__img" style={{ cursor: 'zoom-in' }} />
                      </CardHoverPreview>
                    )}
                    <div className="musician-market-card__info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="musician-market-card__name">{musician.name}</span>
                        <span style={{ fontSize: 9, background: 'rgba(201,146,43,0.3)', border: '1px solid #c9922b', color: '#f1c40f', padding: '1px 4px', borderRadius: 4, fontWeight: 700 }}>
                          Nv.{musician.level}
                        </span>
                      </div>
                      <div className="musician-market-card__notes">
                        {musician.notes.map((n, i) => (
                          <span
                            key={i}
                            className="musician-market-card__note"
                            style={{
                              background: NOTE_COLORS[n.color] || '#888',
                              border: '1.5px solid rgba(255,255,255,0.3)',
                            }}
                            title={`${n.color}: ${n.points}pt`}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`musician-hire-btn ${canHire ? '' : 'musician-hire-btn--disabled'}`}
                      onClick={() => {
                        if (hasSpace) {
                          handleHireMusician(slotIdx);
                        } else {
                          setReplacingMusicianSlot(slotIdx);
                        }
                      }}
                      disabled={!canHire}
                      title={isActionBlocked ? 'Finalize a decisão no modal ativo primeiro' : !isDestinationSelected ? 'Selecione as Ruas no mapa primeiro' : hasActedThisTurn ? 'Ação já realizada no turno' : !canAfford ? 'Moedas insuficientes' : `Contratar por ${cost} moedas`}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <CoinIcon size={14} />
                        <span>{cost}</span>
                      </span>
                      <span style={{ fontSize: 10 }}>{canHire ? (hasSpace ? 'Contratar' : 'Substituir') : isActionBlocked ? 'Em espera' : hasActedThisTurn ? 'Bloqueado' : 'Sem moedas'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Diálogo de Substituição quando a Banda estiver Cheia */}
            {replacingMusicianSlot !== null && gameState.market.musicians[replacingMusicianSlot] && (
              <div style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(30,20,10,0.98), rgba(20,15,10,0.98))',
                border: '2px solid #f3c343',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#f3c343' }}>
                  {(() => {
                    const maxMusicians = (player.maxMusicians || 3) >= 4 || player.resources.some(r => r.id === 'recurso_09' || r.effectType === 'musician_hand_size_4') ? 4 : 3;
                    return `⚠️ Banda Cheia (${player.musicians.length}/${maxMusicians})!`;
                  })()}
                </div>
                <div style={{ fontSize: 11.5, color: '#ebdccb', lineHeight: 1.35 }}>
                  Você está contratando <strong>{gameState.market.musicians[replacingMusicianSlot]!.name}</strong>. Escolha qual músico da sua banda atual deseja dispensar/substituir:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {player.musicians.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleHireMusician(replacingMusicianSlot, m.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(243,195,67,0.3)',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700 }}>🔄 Substituir {m.name} (Nv.{m.level})</span>
                      <span style={{ fontSize: 10, color: '#ff7675' }}>Dispensar</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleHireMusician(replacingMusicianSlot, 'discard_new')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'rgba(231,76,60,0.15)',
                      border: '1px solid rgba(231,76,60,0.4)',
                      color: '#ff7675',
                      cursor: 'pointer',
                      fontSize: 11.5,
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    🗑️ Descartar o novo músico contratado
                  </button>

                  <button
                    type="button"
                    onClick={() => setReplacingMusicianSlot(null)}
                    style={{
                      padding: '6px',
                      borderRadius: 6,
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#8a7a6e',
                      cursor: 'pointer',
                      fontSize: 11,
                      textAlign: 'center',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: LOJAS (MÚLTIPLAS COMPRAS + 1 CUBO POR TURNO) ─── */}
        {activeTab === 'resources' && (
          <div className="resources-tab" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p className="market-note">
              {isShoppingAtLojas
                ? '✓ Você está nas Lojas: compre quantos recursos quiser e até 1 cubo. As cartas só são repostas no fim do turno.'
                : '⚠️ Selecione as Lojas no mapa para poder comprar.'}
            </p>

            {/* Seção de Bônus de Movimento das Lojas (Vender Disco ou Desconto) */}
            {isForward && isShoppingAtLojas && (
              <div style={{
                background: 'rgba(201,146,43,0.12)',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid rgba(201,146,43,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f1c40f', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>🎁 Bônus das Lojas (Setas):</span>
                    <span style={{ color: '#ebdccb', fontWeight: 500 }}>
                      {player.discs.length > 0 ? 'Escolha prévia: Desconto OU Vender Disco' : 'Desconto de 1 Moeda'}
                    </span>
                  </span>
                  {gameState.turnActionState.lojasBonusChoice && (
                    <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 700 }}>
                      ✓ {gameState.turnActionState.lojasBonusChoice === 'discount' ? 'Desconto Ativo' : 'Venda de Disco Ativa'}
                    </span>
                  )}
                </div>

                {player.discs.length > 0 ? (
                  !gameState.turnActionState.lojasBonusChoice ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 6, border: '1px solid rgba(241,196,15,0.4)' }}>
                      <div style={{ fontSize: 11, color: '#f1c40f', fontWeight: 700 }}>
                        ⚠️ Você possui disco(s) gravado(s). Escolha qual bônus deseja usar ANTES de realizar compras:
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ flex: 1, minWidth: 140, padding: '6px 10px', fontSize: 11 }}
                          onClick={() => {
                            const { newState, success, message } = GameEngine.setLojasBonusChoice(gameState, 'discount');
                            if (success) {
                              onStateUpdate(newState);
                              showFeedback(true, message);
                            }
                          }}
                          disabled={hasActedThisTurn || isActionBlocked}
                        >
                          💰 1 Moeda de Desconto
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ flex: 1, minWidth: 140, padding: '6px 10px', fontSize: 11, borderColor: '#f1c40f', color: '#f1c40f' }}
                          onClick={() => {
                            const { newState, success, message } = GameEngine.setLojasBonusChoice(gameState, 'sell_disc');
                            if (success) {
                              onStateUpdate(newState);
                              showFeedback(true, message);
                            }
                          }}
                          disabled={hasActedThisTurn || isActionBlocked}
                        >
                          💿 Vender 1 Disco de Vinil
                        </button>
                      </div>
                    </div>
                  ) : gameState.turnActionState.lojasBonusChoice === 'sell_disc' ? (
                    <div>
                      {gameState.turnActionState.hasSoldDiscThisTurn ? (
                        <div style={{ fontSize: 10.5, color: '#2ecc71' }}>
                          ✓ Você já vendeu 1 disco neste turno! O bônus foi consumido (o desconto de movimento não se aplica às compras).
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 10.5, color: '#ebdccb', marginBottom: 4 }}>
                            Clique em um disco abaixo para vendê-lo por moedas iguais ao seu nível (o nível diminui em 1):
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {player.discs.map(disc => (
                              <button
                                key={disc.id}
                                type="button"
                                onClick={() => handleSellDisc(disc.id)}
                                disabled={hasActedThisTurn || isActionBlocked}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '5px 9px',
                                  borderRadius: 6,
                                  border: '1px solid rgba(241,196,15,0.6)',
                                  background: 'rgba(241,196,15,0.2)',
                                  color: '#ffffff',
                                  cursor: 'pointer',
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                                title={`Vender por ${disc.level} moedas (o disco passará a Nível ${disc.level - 1}${disc.level - 1 === 0 ? ' - descartado' : ''})`}
                              >
                                <span>💿 Disco Nv.{disc.level}</span>
                                <span style={{ color: '#2ecc71', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                  (+{disc.level} <CoinIcon size={12} />)
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 10.5, color: '#2ecc71' }}>
                      ✓ Bônus selecionado: <strong>-1 moeda de desconto</strong> nas compras de recursos da estante abaixo!
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: 10.5, color: '#2ecc71' }}>
                    ✓ Bônus ativo: <strong>-1 moeda de desconto</strong> nos recursos da estante abaixo.
                  </div>
                )}
              </div>
            )}

            {/* Seção de Compra de Cubos (limite de 1 por turno) */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f1c40f' }}>
                  🎲 Comprar Cubo do Saco Principal (2 moedas - máx 1 por turno):
                </span>
                {hasBoughtCubeThisTurn && (
                  <span style={{ fontSize: 10, color: '#2ecc71', fontWeight: 700 }}>✓ Já comprou 1 cubo</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['red', 'blue', 'yellow', 'purple'] as const).map(color => {
                  const count = gameState.mainBag[color] || 0;
                  const isPendingBonusChoice = isForward && isShoppingAtLojas && player.discs.length > 0 && !gameState.turnActionState.lojasBonusChoice;
                  const canBuy = player.coins >= 2 && count > 0 && !hasBoughtCubeThisTurn && isShoppingAtLojas && !hasActedThisTurn && !isPendingBonusChoice;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleBuyCube(color)}
                      disabled={!canBuy}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.05)',
                        cursor: canBuy ? 'pointer' : 'default',
                        opacity: canBuy ? 1 : 0.4,
                      }}
                      title={isPendingBonusChoice ? 'Escolha o bônus das Lojas acima antes de comprar' : hasBoughtCubeThisTurn ? 'Limite de 1 cubo por turno atingido' : !canBuy ? 'Indisponível ou moedas insuficientes' : `Comprar 1 cubo ${color} por 2 moedas`}
                    >
                      <CubeToken color={color} size="sm" />
                      <span style={{ fontSize: 10, color: '#f0ede8', textTransform: 'capitalize' }}>
                        {color} ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estante de Recursos (Compre quantos quiser) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#c9922b' }}>
                Estante de Recursos (Compre quantos quiser):
              </span>
              <button
                type="button"
                onClick={() => setShowDiscardModal('resources')}
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: '#f0ede8',
                  cursor: 'pointer',
                }}
                title="Ver cartas de recursos descartadas/fora de jogo"
              >
                📜 Descarte ({gameState.decks.discardedResources?.length || 0})
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gameState.market.resources.map((resource, slotIdx) => {
                if (!resource) {
                  return (
                    <div
                      key={slotIdx}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        textAlign: 'center',
                        fontSize: 10,
                        color: '#8a7a6e',
                      }}
                    >
                      Slot {slotIdx + 1}: Comprado (será reposto no fim do turno)
                    </div>
                  );
                }

                const isLastSlot = slotIdx === 3;
                const slotDiscount = isLastSlot ? 1 : 0;
                const hasSoldDisc = gameState.turnActionState.hasSoldDiscThisTurn || gameState.turnActionState.lojasBonusChoice === 'sell_disc';
                const bonusDiscount = (isForward && isShoppingAtLojas && !hasSoldDisc) ? 1 : 0;
                const totalDiscount = slotDiscount + bonusDiscount;

                let baseCost = resource.cost;
                if (resource.specialCost && gameState.round >= resource.specialCost.fromRound) {
                  baseCost = resource.specialCost.cost;
                }
                if (resource.playerCountCost) {
                  const numPlayers = gameState.players.length as 2 | 3 | 4;
                  baseCost = resource.playerCountCost[numPlayers] ?? resource.cost;
                }

                const finalCost = Math.max(0, baseCost - totalDiscount);
                const isPendingBonusChoice = isForward && isShoppingAtLojas && player.discs.length > 0 && !gameState.turnActionState.lojasBonusChoice;
                const canAfford = player.coins >= finalCost && isShoppingAtLojas && !hasActedThisTurn && !isActionBlocked && !isPendingBonusChoice;

                return (
                  <div key={resource.id} className={`resource-market-card ${!canAfford ? 'resource-market-card--disabled' : ''}`}>
                    {resource.image && (
                      <CardHoverPreview resource={resource}>
                        <img src={resource.image} alt={resource.name} className="resource-market-card__img" style={{ cursor: 'zoom-in' }} />
                      </CardHoverPreview>
                    )}
                    <div className="resource-market-card__info" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="resource-market-card__name" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                          {resource.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {slotDiscount > 0 && (
                            <span style={{ fontSize: 10, background: 'rgba(46,204,113,0.2)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '1px 6px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <CoinIcon size={12} />
                              <span>-1 Último Espaço</span>
                            </span>
                          )}
                          {bonusDiscount > 0 && (
                            <span style={{ fontSize: 10, background: 'rgba(46,204,113,0.2)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '1px 6px', borderRadius: 4, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <CoinIcon size={12} />
                              <span>-1 Bônus de Movimento</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="resource-market-card__desc" style={{ fontSize: '0.84rem', color: '#ebdccb', lineHeight: 1.35, marginTop: 2 }}>
                        {resource.description}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`resource-buy-btn ${canAfford ? '' : 'resource-buy-btn--disabled'}`}
                      onClick={() => handleBuyResource(slotIdx)}
                      disabled={!canAfford}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: '0.88rem' }}
                      title={isPendingBonusChoice ? 'Escolha o bônus das Lojas acima antes de comprar' : isActionBlocked ? 'Finalize a decisão no modal ativo primeiro' : !isShoppingAtLojas ? 'Selecione as Lojas no mapa primeiro' : canAfford ? `Comprar por ${finalCost} moedas` : 'Moedas insuficientes'}
                    >
                      <CoinIcon size={16} />
                      <span>{finalCost}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Botão de Finalizar Compras */}
            {isShoppingAtLojas && !hasActedThisTurn && (
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', marginTop: 8, padding: '10px 14px', fontSize: '0.92rem', fontWeight: 700 }}
                onClick={handleFinishShopping}
              >
                ✓ Concluir Compras nas Lojas (Pronto p/ Passar Turno)
              </button>
            )}
          </div>
        )}

        {/* ─── TAB: CLUBES DE JAZZ (NOITE) ────────────────────── */}
        {activeTab === 'clubs' && (
          <div className="clubs-tab" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="market-note">
              Ir para um clube <strong>encerra seu Dia</strong>. Seu show acontecerá na <strong>Fase da Noite</strong>!
              {player.timeMarker >= 1 && ' (Bônus de chegada antecipada: +1 Inspiração)'}
            </p>

            {CLUBS.map(club => {
              const isEligible = player.renown >= club.minRenown;
              const isChosen = player.chosenClub === club.id;
              const maxCapacity = club.isUnlimited ? Infinity : (gameState.players.length === 2 ? 1 : 2);
              const otherOccupantsCount = gameState.players.filter(p => p.id !== player.id && p.chosenClub === club.id).length;
              const isFull = otherOccupantsCount >= maxCapacity;
              const canChoose = isEligible && !isFull && !isChosen && (!hasActedThisTurn || player.timeMarker < 1);
              const clubRewards = gameState.clubRewards ? gameState.clubRewards[club.id] || [] : [];

              return (
                <div
                  key={club.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '0.65rem 0.85rem',
                    borderRadius: 8,
                    background: isChosen ? 'rgba(46,204,113,0.12)' : 'rgba(255,255,255,0.04)',
                    border: isChosen ? '1.5px solid #2ecc71' : '1px solid rgba(255,255,255,0.1)',
                    opacity: !canChoose && !isChosen ? 0.45 : 1,
                  }}
                >
                  <ClubHoverPreview
                    club={club}
                    rewards={clubRewards}
                    players={gameState.players}
                  >
                    <div
                      style={{
                        cursor: 'help',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 3,
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        transition: 'transform 0.15s ease',
                      }}
                      title="Passe o mouse sobre este símbolo para ver detalhes e prêmios do clube"
                    >
                      <ClubBadgeIcon clubId={club.id} size={28} />
                    </div>
                  </ClubHoverPreview>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0ede8' }}>
                      {club.name}
                      {!club.isUnlimited && (
                        <span style={{ fontSize: 10, color: '#f3c343', marginLeft: 6 }}>
                          [{maxCapacity - otherOccupantsCount}/{maxCapacity} vaga{maxCapacity > 1 ? 's' : ''}]
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#ebdccb', marginTop: 2 }}>
                      Lotação: {club.maxCapacity} • Meta: {club.successThreshold} pts • Req: Renome {club.minRenown}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
                    onClick={() => handleGoToClub(club.id)}
                    disabled={!canChoose}
                    title={hasActedThisTurn ? 'Você já realizou uma ação neste turno. Passe a vez primeiro.' : isFull ? 'Clube com capacidade máxima atingida nesta noite' : !isEligible ? `Requer Renome ${club.minRenown}` : 'Ir para este clube'}
                  >
                    {isChosen ? 'Agendado ✓' : isFull ? 'Lotado 🚫' : hasActedThisTurn ? 'Ação feita' : !isEligible ? `Renome ${club.minRenown}` : 'Ir p/ Clube'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Imediato: Chapéu Estiloso */}
      {showChapeuModal && (
        <ChapeuEstilosoModal
          gameState={gameState}
          onConfirm={handleChapeuConfirm}
          onCancel={() => setShowChapeuModal(false)}
        />
      )}

      {/* Modal de Pilha de Descarte */}
      {showDiscardModal && (
        <DiscardPileModal
          type={showDiscardModal}
          musicians={gameState.decks.discardedMusicians || []}
          resources={gameState.decks.discardedResources || []}
          onClose={() => setShowDiscardModal(null)}
        />
      )}
    </div>
  );
}

function ActionButton({
  id, icon, label, description, disabled = false, onClick, highlight = false,
}: {
  id: string;
  icon: string;
  label: string;
  description: string;
  disabled?: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      className={`action-card-btn ${highlight ? 'action-card-btn--highlight' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span className="action-card-icon">{icon}</span>
      <div className="action-card-text">
        <span className="action-card-label">{label}</span>
        <span className="action-card-desc">{description}</span>
      </div>
      <span className="action-card-arrow">›</span>
    </button>
  );
}

const NOTE_COLORS: Record<string, string> = {
  red: '#c0392b', blue: '#2980b9', yellow: '#d4ac0d',
  purple: '#8e44ad', white: '#e8e0d0', wild: '#7f8c8d',
};
