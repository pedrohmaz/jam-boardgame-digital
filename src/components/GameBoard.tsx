/**
 * GameBoard — Layout principal do jogo
 * Integra: Tabuleiro central, PlayerMat do jogador ativo, ActionPanel e PresentationModal
 */

import { useState, useCallback, useEffect } from 'react';
import type { GameState } from '../types/game';
import { GameEngine } from '../engine/gameEngine';
import { processBotStep } from '../engine/botAI';
import MainBoard from './board/MainBoard';
import ActionPanel from './board/ActionPanel';
import PlayerMat from './player/PlayerMat';
import PresentationModal from './modals/PresentationModal';
import EventAnnouncementModal from './modals/EventAnnouncementModal';
import SponsorshipModal from './modals/SponsorshipModal';
import EscolhasEsteticasModal from './modals/EscolhasEsteticasModal';
import InitialMusicianDraftModal from './modals/InitialMusicianDraftModal';
import CubeSelectionModal from './modals/CubeSelectionModal';
import StyleSelectionModal from './modals/StyleSelectionModal';
import FinalScoreModal from './modals/FinalScoreModal';
import BicicletaDecisionModal from './modals/BicicletaDecisionModal';
import LuthierModal from './modals/LuthierModal';
import CardHoverPreview from './common/CardHoverPreview';
import { CoinIcon, PointsIcon } from './common/GameIcons';

interface GameBoardProps {
  gameState: GameState;
  onStateUpdate: (newState: GameState) => void;
  onResetGame?: () => void;
}

export default function GameBoard({ gameState, onStateUpdate, onResetGame }: GameBoardProps) {
  const [showManualGig, setShowManualGig] = useState(false);
  const [showScorePreview, setShowScorePreview] = useState(false);
  const [activePlayerTab, setActivePlayerTab] = useState(gameState.currentPlayerIndex);
  const [lastAnnouncedEventRound, setLastAnnouncedEventRound] = useState<number | null>(null);

  // Sincroniza a aba do jogador com o jogador ativo no início de cada turno ou show
  useEffect(() => {
    setActivePlayerTab(gameState.currentPlayerIndex);
  }, [gameState.currentPlayerIndex, gameState.phase]);

  // ── LOOP DE EXECUÇÃO AUTOMATIZADA PARA JOGADORES BOT ────────────
  useEffect(() => {
    if (gameState.isGameOver || gameState.phase === 'end') return;

    let isBotActing = false;

    if (gameState.isInitialDraftActive && gameState.draftPlayerIndices && gameState.draftPlayerIndices.length > 0) {
      const p = gameState.players[gameState.draftPlayerIndices[0]];
      if (p?.isBot) isBotActing = true;
    } else if (gameState.pendingCubeChoice) {
      const p = gameState.players[gameState.pendingCubeChoice.playerIndex];
      if (p?.isBot) isBotActing = true;
    } else if (gameState.pendingStyleChoice) {
      const p = gameState.players[gameState.pendingStyleChoice.playerIndex];
      if (p?.isBot) isBotActing = true;
    } else if (gameState.pendingLuthierChoice) {
      const p = gameState.players[gameState.pendingLuthierChoice.playerIndex];
      if (p?.isBot) isBotActing = true;
    } else if (gameState.pendingBicicletaDecision) {
      const p = gameState.players[gameState.pendingBicicletaDecision.ownerPlayerIndex];
      if (p?.isBot) isBotActing = true;
    } else if (gameState.phase === 'night') {
      // Apresentações da Noite são gerenciadas visualmente pelo PresentationModal
      isBotActing = false;
    } else {
      const current = gameState.players[gameState.currentPlayerIndex];
      if (current?.isBot) isBotActing = true;
    }

    if (!isBotActing) return;

    const timer = setTimeout(() => {
      const nextState = processBotStep(gameState);
      onStateUpdate(nextState);
    }, 600);

    return () => clearTimeout(timer);
  }, [gameState, onStateUpdate]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isNightPhase = gameState.phase === 'night';

  const activePendingStyleChoice = gameState.pendingStyleChoicesQueue?.[0] || gameState.pendingStyleChoice || null;
  const activePendingCubeChoice = gameState.pendingCubeChoicesQueue?.[0] || gameState.pendingCubeChoice || null;
  const hasBlockingPendingChoice = Boolean(
    activePendingStyleChoice ||
    activePendingCubeChoice ||
    gameState.pendingLuthierChoice ||
    gameState.pendingBicicletaDecision
  );

  const shouldShowPresentationModal = !hasBlockingPendingChoice && (isNightPhase || showManualGig);
  const shouldShowEventModal = !hasBlockingPendingChoice && gameState.round >= 2 && gameState.currentEvent && lastAnnouncedEventRound !== gameState.round;
  const isModalActive = Boolean(gameState.isInitialDraftActive || hasBlockingPendingChoice || shouldShowPresentationModal || shouldShowEventModal);

  // ── Pré-selecionar localização (sem penalidade) ──────────────────
  const handleLocationSelect = useCallback((locationId: number) => {
    if (isModalActive) return;
    const newState = GameEngine.selectTargetLocation(gameState, locationId);
    onStateUpdate(newState);
  }, [gameState, onStateUpdate, isModalActive]);

  // ── Apresentação concluída ──────────────────────────────────────
  const handlePresentationComplete = useCallback((newState: GameState) => {
    setShowManualGig(false);
    onStateUpdate(newState);
  }, [onStateUpdate]);

  return (
    <div className="game-board-v2">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header className="game-header-v2">
        <div className="game-header-v2__logo">
          <img src="/assets/logo/JAM_logo.png" alt="JAM" style={{ height: 32, width: 'auto' }} />
        </div>

        <div className="game-header-v2__round">
          <span className="round-pill">
            Rodada {gameState.round} / {gameState.maxRounds} • {isNightPhase ? '🌙 Fase da Noite (Shows)' : gameState.phase === 'club_selection' ? '🎪 Escolha de Clubes (Casa)' : '☀️ Fase de Dia (Ações)'}
          </span>
          {gameState.currentEvent && (
            <CardHoverPreview event={gameState.currentEvent}>
              <span className="event-pill" style={{ cursor: 'pointer' }}>
                🎭 {gameState.currentEvent.name}
              </span>
            </CardHoverPreview>
          )}
        </div>

        {/* ── ESTOQUE DO SACO PRINCIPAL ───────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(201,146,43,0.35)',
            borderRadius: 20,
            padding: '3px 12px',
            fontSize: 11,
            fontWeight: 700,
            color: '#f0ede8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
          title={`Saco Principal: ${(gameState.mainBag.red || 0) + (gameState.mainBag.blue || 0) + (gameState.mainBag.yellow || 0) + (gameState.mainBag.purple || 0)} cubos restantes`}
        >
          <span style={{ color: '#f3c343', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            🎒 Saco:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} title={`Vermelho: ${gameState.mainBag.red} no saco`}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: '#c0392b', display: 'inline-block', boxShadow: '0 0 4px rgba(192,57,43,0.8)' }} />
              <span>{gameState.mainBag.red}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} title={`Azul: ${gameState.mainBag.blue} no saco`}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: '#2980b9', display: 'inline-block', boxShadow: '0 0 4px rgba(41,128,185,0.8)' }} />
              <span>{gameState.mainBag.blue}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} title={`Amarelo: ${gameState.mainBag.yellow} no saco`}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: '#d4ac0d', display: 'inline-block', boxShadow: '0 0 4px rgba(212,172,13,0.8)' }} />
              <span>{gameState.mainBag.yellow}</span>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} title={`Roxo: ${gameState.mainBag.purple} no saco`}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: '#8e44ad', display: 'inline-block', boxShadow: '0 0 4px rgba(142,68,173,0.8)' }} />
              <span>{gameState.mainBag.purple}</span>
            </span>
            <span style={{ fontSize: 9.5, color: '#c2ab8f', marginLeft: 2 }}>
              ({(gameState.mainBag.red || 0) + (gameState.mainBag.blue || 0) + (gameState.mainBag.yellow || 0) + (gameState.mainBag.purple || 0)})
            </span>
          </div>
        </div>

        {/* ── JOGADOR DO TURNO ATUAL ──────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: `linear-gradient(135deg, ${getColorHex(currentPlayer.color)}22, rgba(0,0,0,0.65))`,
            border: `2px solid ${getColorHex(currentPlayer.color)}`,
            borderRadius: 20,
            padding: '3px 14px',
            boxShadow: `0 0 14px ${getColorHex(currentPlayer.color)}55, 0 2px 8px rgba(0,0,0,0.5)`,
          }}
          title={`Vez atual de jogar: ${currentPlayer.name}`}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: getColorHex(currentPlayer.color),
              boxShadow: `0 0 8px ${getColorHex(currentPlayer.color)}`,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 10, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Vez de:
          </span>
          <span style={{ fontSize: 12.5, color: '#ffffff', fontWeight: 800 }}>
            {currentPlayer.name}
          </span>
        </div>

        <div className="game-header-v2__players">
          {gameState.players.map((p, i) => (
            <button
              key={p.id}
              type="button"
              id={`player-tab-${i}`}
              className={`player-tab ${i === gameState.currentPlayerIndex ? 'player-tab--active' : ''} ${i === activePlayerTab ? 'player-tab--viewing' : ''}`}
              onClick={() => setActivePlayerTab(i)}
              title={p.name}
              style={{
                borderBottomColor: i === gameState.currentPlayerIndex ? getColorHex(p.color) : 'transparent',
              }}
            >
              <span
                className="player-tab-dot"
                style={{ backgroundColor: getColorHex(p.color) }}
              />
              <span className="player-tab-score" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <PointsIcon size={14} />
                <span>{p.score}</span>
              </span>
              <span style={{ fontSize: 11, color: '#f1c40f', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <CoinIcon size={13} />
                <span>{p.coins}</span>
              </span>
            </button>
          ))}
        </div>

        {/* ── BOTÃO DE PREVIEW DA PONTUAÇÃO FINAL ── */}
        <button
          type="button"
          id="score-preview-btn"
          onClick={() => setShowScorePreview(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, rgba(243,195,67,0.18), rgba(0,0,0,0.5))',
            border: '1px solid rgba(243,195,67,0.45)',
            borderRadius: 20,
            padding: '4px 12px',
            color: '#f3c343',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          title="Ver projeção completa da pontuação final em tempo real"
        >
          <span>📊 Placar Final</span>
        </button>
      </header>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────── */}
      <div className="game-layout-v2">

        {/* ── COL 1: Player Mat do jogador visualizado ── */}
        <aside className="game-col-playermat">
          <PlayerMat
            player={gameState.players[activePlayerTab]}
            isActive={activePlayerTab === gameState.currentPlayerIndex}
          />
        </aside>

        {/* ── COL 2: Tabuleiro Central ── */}
        <main className="game-col-board">
          <div className="board-wrapper">
            <MainBoard
              gameState={gameState}
              onLocationSelect={handleLocationSelect}
              currentPlayerId={currentPlayer.id}
              disabled={isModalActive}
            />
          </div>

          {/* Log de jogo embaixo do tabuleiro */}
          <div className="game-log-strip">
            <div className="game-log-entries" id="game-log">
              {[...gameState.log].reverse().slice(0, 8).map((entry, i) => (
                <div key={i} className={`log-pill ${entry.startsWith('───') ? 'log-pill--divider' : ''} ${entry.startsWith('⚠️') ? 'log-pill--warn' : ''}`}>
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ── COL 3: Action Panel ── */}
        <aside className="game-col-actions">
          <ActionPanel
            gameState={gameState}
            onStateUpdate={onStateUpdate}
            onOpenPresentation={() => setShowManualGig(true)}
            isActionBlocked={isModalActive}
          />
        </aside>
      </div>

      {/* ── MODAL DE DRAFT INICIAL DE MÚSICOS (ORDEM REVERSA) ──── */}
      {gameState.isInitialDraftActive && !gameState.players[gameState.draftPlayerIndices?.[0] ?? 0]?.isBot && (
        <InitialMusicianDraftModal
          gameState={gameState}
          onSelectMusician={(musicianId) => {
            const newState = GameEngine.selectStartingMusician(gameState, musicianId);
            onStateUpdate(newState);
          }}
        />
      )}

      {/* ── MODAL REUTILIZÁVEL DE ESCOLHA DE CUBO DO SACO PRINCIPAL ── */}
      {activePendingCubeChoice && !gameState.players[activePendingCubeChoice.playerIndex]?.isBot && (
        <CubeSelectionModal
          gameState={gameState}
          onConfirm={(choice) => {
            const { newState } = GameEngine.resolvePendingCubeChoice(gameState, choice);
            onStateUpdate(newState);
          }}
        />
      )}

      {/* ── MODAL DE ESCOLHA DE ESTILO (OBJETIVOS) ───────────────── */}
      {activePendingStyleChoice && !gameState.players[activePendingStyleChoice.playerIndex]?.isBot && (
        <StyleSelectionModal
          pendingChoice={activePendingStyleChoice}
          player={gameState.players[activePendingStyleChoice.playerIndex]}
          onConfirm={(chosenStyleId) => {
            const { newState } = GameEngine.resolvePendingStyleChoice(gameState, chosenStyleId);
            onStateUpdate(newState);
          }}
        />
      )}

      {/* ── MODAL DE ESCOLHA DO LUTHIER (RECURSO 15) ──────────────── */}
      {gameState.pendingLuthierChoice && !gameState.players[gameState.pendingLuthierChoice.playerIndex]?.isBot && (
        <LuthierModal
          pendingChoice={gameState.pendingLuthierChoice}
          gameState={gameState}
          onConfirm={(chosenInstrumentId) => {
            const { newState } = GameEngine.resolvePendingLuthierChoice(gameState, chosenInstrumentId);
            onStateUpdate(newState);
          }}
        />
      )}

      {/* ── MODAL DE DECISÃO DA BICICLETA (RECURSO 14) ─────────────── */}
      {gameState.pendingBicicletaDecision && !gameState.players[gameState.pendingBicicletaDecision.ownerPlayerIndex]?.isBot && (
        <BicicletaDecisionModal
          decision={gameState.pendingBicicletaDecision}
          gameState={gameState}
          onResolve={(waiveFee) => {
            const { newState } = GameEngine.resolveBicicletaDecision(gameState, waiveFee);
            onStateUpdate(newState);
          }}
        />
      )}

      {/* ── MODAL DE APRESENTAÇÃO (NOITE OU MANUAL) ─────────────── */}
      {shouldShowPresentationModal && (
        <PresentationModal
          key={`gig-modal-${gameState.round}-${gameState.currentPlayerIndex}-${gameState.nightPresentationPlayerIndex}`}
          gameState={gameState}
          onComplete={handlePresentationComplete}
          onCancel={() => setShowManualGig(false)}
        />
      )}

      {/* ── MODAL DE ANÚNCIO DE NOVO EVENTO, PATROCÍNIO OU ESCOLHAS ESTÉTICAS (RODADAS 2 A 6) ──────── */}
      {shouldShowEventModal && gameState.currentEvent && (
        gameState.currentEvent.id === 'evento_04' || gameState.currentEvent.effectType === 'sponsorship_choice' ? (
          <SponsorshipModal
            event={gameState.currentEvent}
            round={gameState.round}
            gameState={gameState}
            onComplete={(newState) => {
              setLastAnnouncedEventRound(gameState.round);
              onStateUpdate(newState);
            }}
          />
        ) : gameState.currentEvent.id === 'evento_02' || gameState.currentEvent.effectType === 'remove_nonwhite_cube' ? (
          <EscolhasEsteticasModal
            event={gameState.currentEvent}
            round={gameState.round}
            gameState={gameState}
            onComplete={(newState) => {
              setLastAnnouncedEventRound(gameState.round);
              onStateUpdate(newState);
            }}
          />
        ) : (
          <EventAnnouncementModal
            event={gameState.currentEvent}
            round={gameState.round}
            onClose={() => setLastAnnouncedEventRound(gameState.round)}
          />
        )
      )}

      {/* ── MODAL DE PREVIEW DA PONTUAÇÃO FINAL ───────────────────── */}
      {showScorePreview && (
        <FinalScoreModal
          gameState={gameState}
          mode="preview"
          onClose={() => setShowScorePreview(false)}
        />
      )}

      {/* ── MODAL DE FIM DE JOGO (GAME OVER) ───────────────────────── */}
      {(gameState.isGameOver || gameState.phase === 'end') && (
        <FinalScoreModal
          gameState={gameState}
          mode="game_over"
          onClose={() => {}}
          onResetGame={onResetGame}
        />
      )}
    </div>
  );
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    orange: '#e67e22',
    pink: '#e84393',
    green: '#27ae60',
    brown: '#8d5524',
    gray: '#7f8c8d',
  };
  return map[color] || '#c9922b';
}
