/**
 * MainBoard — Tabuleiro principal interativo do JAM
 *
 * Circuito de locais na cidade:
 * 0: Casa (ponto de partida da rodada)
 * 1: Rádio 📻
 * 2: Conservatório 🏛️ (exibe os 2 cubos disponíveis para o bônus)
 * 3: Ruas 🎻
 * 4: Gravadora 💿
 * 5: Lojas 🏪
 * 6: Parque 🌳
 *
 * Área dos Clubes de Jazz para onde os jogadores agendam o show da Fase da Noite.
 */

import type { GameState } from '../../types/game';
import { BOARD_LOCATIONS, CLUBS } from '../../types/board';
import { GameEngine } from '../../engine/gameEngine';
import Dice3D from '../common/Dice3D';
import CubeToken from '../common/CubeToken';
import { CoinIcon, ClubBadgeIcon } from '../common/GameIcons';
import CardHoverPreview from '../common/CardHoverPreview';
import ClubHoverPreview from '../common/ClubHoverPreview';
interface MainBoardProps {
  gameState: GameState;
  onLocationSelect: (locationId: number) => void;
  onSelectClub?: (clubId: string) => void;
  currentPlayerId?: string;
  disabled?: boolean;
}

const LOCATION_COORDS: Record<number, { x: number; y: number }> = {
  0: { x: 14, y: 78 },  // 0: Casa (Início)
  1: { x: 12, y: 44 },  // 1: Rádio
  2: { x: 26, y: 16 },  // 2: Gravadora
  3: { x: 50, y: 10 },  // 3: Conservatório
  4: { x: 74, y: 16 },  // 4: Lojas
  5: { x: 88, y: 44 },  // 5: Ruas
  6: { x: 72, y: 78 },  // 6: Parque
};

const FORWARD_ARROWS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
];

function PlayerPawn({ color, size = 29, isActive = false }: { color: string; size?: number; isActive?: boolean }) {
  const colorMap: Record<string, string> = {
    orange: '#e67e22',
    pink: '#e84393',
    green: '#27ae60',
    brown: '#8d5524',
    gray: '#7f8c8d',
  };
  const hex = colorMap[color] || '#7f8c8d';
  return (
    <div
      className={`player-pawn ${isActive ? 'player-pawn--active' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: isActive
          ? hex
          : `radial-gradient(circle at 35% 30%, ${hex}dd, ${hex}77)`,
        border: isActive
          ? '2.5px solid #ffffff'
          : '1.5px solid rgba(255,255,255,0.7)',
        boxShadow: isActive
          ? `0 0 12px ${hex}, 0 0 6px #ffffff, 0 4px 10px rgba(0,0,0,0.85)`
          : '0 2px 6px rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: isActive ? 10 : 2,
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease',
      }}
      title={isActive ? 'Jogador com o Turno Ativo' : undefined}
    >
      {isActive && (
        <span style={{ fontSize: 15, fontWeight: 900, color: '#ffffff', lineHeight: 1, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}>
          !
        </span>
      )}
    </div>
  );
}

export default function MainBoard({ gameState, onLocationSelect, disabled }: MainBoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const { selectedLocation, hasActedThisTurn } = gameState.turnActionState;

  const isInvertArrows = gameState.currentEvent?.effectType === 'invert_arrow_direction';
  const activeArrows: [number, number][] = isInvertArrows
    ? [
        [6, 5],
        [5, 4],
        [4, 3],
        [3, 2],
        [2, 1],
        [1, 0],
      ]
    : FORWARD_ARROWS;

  return (
    <div className="main-board">
      {/* SVG com as setas direcionais douradas */}
      <svg
        className="main-board__arrows"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <marker id="arrowhead-gold" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#c9922b" />
          </marker>
        </defs>
        {activeArrows.map(([fromIdx, toIdx], i) => {
          const from = LOCATION_COORDS[fromIdx];
          const to = LOCATION_COORDS[toIdx];
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#c9922b"
              strokeWidth="0.8"
              strokeDasharray="2,1.5"
              markerEnd="url(#arrowhead-gold)"
              opacity="0.65"
            />
          );
        })}
      </svg>

      {/* Locais do Circuito da Cidade */}
      {BOARD_LOCATIONS.map((loc) => {
        const coords = LOCATION_COORDS[loc.index];
        const isCurrent = currentPlayer.boardPosition === loc.index && currentPlayer.chosenClub === null;
        const isSelected = selectedLocation === loc.index;
        const playersHere = gameState.players.filter(p => p.boardPosition === loc.index && p.chosenClub === null);

        const moveInfo = (!hasActedThisTurn && !disabled)
          ? GameEngine.calculateMovement(currentPlayer, loc.index, gameState.players, isInvertArrows, gameState.neutralDie)
          : null;

        const isReachable = !disabled && (moveInfo?.isReachable ?? false);

        return (
          <button
            key={loc.id}
            id={`board-loc-${loc.id}`}
            type="button"
            className={`board-location ${isCurrent ? 'board-location--current' : ''} ${isSelected ? 'board-location--selected' : ''} ${isReachable ? 'board-location--reachable' : ''}`}
            style={{
              position: 'absolute',
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: 'translate(-50%, -50%)',
              width: loc.index === 0 ? 68 : 80,
              height: loc.index === 0 ? 68 : 80,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 30%, ${loc.color}ee, ${loc.color}99)`,
              border: isSelected
                ? '3.5px solid #f1c40f'
                : isCurrent
                  ? '3px solid #c9922b'
                  : isReachable
                    ? '2px solid rgba(201,146,43,0.7)'
                    : '2px solid rgba(255,255,255,0.15)',
              boxShadow: isSelected
                ? `0 0 22px #f1c40faa, 0 4px 14px rgba(0,0,0,0.6)`
                : isCurrent
                  ? `0 0 16px ${loc.color}aa, 0 4px 12px rgba(0,0,0,0.5)`
                  : isReachable
                    ? `0 0 10px rgba(201,146,43,0.35), 0 4px 10px rgba(0,0,0,0.4)`
                    : '0 4px 10px rgba(0,0,0,0.3)',
              cursor: isReachable ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'all 0.2s ease',
              zIndex: isSelected ? 6 : isCurrent ? 5 : 2,
              padding: 0,
              opacity: !isCurrent && !isSelected && !isReachable && loc.index !== 0 ? 0.65 : 1,
            }}
            onClick={() => isReachable && onLocationSelect(loc.index)}
            disabled={!isReachable}
            title={`${loc.name}: ${loc.description}${moveInfo ? `\nClique para pré-selecionar (Custo: ${moveInfo.timeCost} tempo)` : ''}`}
          >
            <span style={{ fontSize: loc.index === 0 ? 22 : 26, lineHeight: 1 }}>{loc.icon}</span>
            <span
              style={{
                fontSize: 8.5,
                color: 'rgba(255,255,255,0.95)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textAlign: 'center',
                lineHeight: 1.1,
                padding: '0 4px',
              }}
            >
              {loc.name}
            </span>

            {/* Dado Neutro Bloqueador (Exclusivo para 2 Jogadores) */}
            {gameState.neutralDie && gameState.neutralDie.position === loc.index && (
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -10,
                  zIndex: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.85))',
                }}
                title={`🎲 Dado Neutro (${gameState.neutralDie.color}): Face ${gameState.neutralDie.value} • Ocupa o local gerando taxa de 1 moeda (paga ao banco)`}
              >
                <Dice3D
                  value={gameState.neutralDie.value}
                  size={26}
                  color={getPlayerColorHex(gameState.neutralDie.color)}
                />
              </div>
            )}

            {/* Peões dos jogadores presentes (aumentados em ~75%) */}
            {playersHere.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 3,
                }}
              >
                {playersHere.map(p => (
                  <PlayerPawn
                    key={p.id}
                    color={p.color}
                    size={29}
                    isActive={p.id === currentPlayer.id}
                  />
                ))}
              </div>
            )}

            {/* Badge de custo de tempo & taxa de moedas */}
            {isReachable && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -6,
                  background: moveInfo?.isForward ? '#1a1008' : '#3a1010',
                  border: `1.5px solid ${moveInfo?.isForward ? '#c9922b' : '#e74c3c'}`,
                  borderRadius: 10,
                  padding: '1px 6px',
                  fontSize: 9,
                  color: moveInfo?.isForward ? '#c9922b' : '#ff7979',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                }}
                title={`${moveInfo?.isForward ? '1 tempo (no sentido das setas c/ bônus)' : '2 tempos (contra as setas s/ bônus)'}${moveInfo && moveInfo.visitingFee > 0 ? ` + ${moveInfo.visitingFee} moeda(s) de taxa de visitação` : ''}`}
              >
                <span>{moveInfo?.isForward ? '➔' : '⮌'}</span>
                <span>{moveInfo?.timeCost}t</span>
                {moveInfo && moveInfo.visitingFee > 0 && (
                  <span style={{ color: '#f1c40f', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: 3, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                    <CoinIcon size={10} />
                    {moveInfo.visitingFee}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}

      {/* ── PLACA DO EVENTO ATIVO DA RODADA (Canto Superior Direito) ── */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          maxWidth: 190,
          background: 'linear-gradient(135deg, rgba(20,15,10,0.92), rgba(30,20,10,0.95))',
          border: '1.5px solid rgba(243,195,67,0.4)',
          borderRadius: 8,
          padding: '6px 10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#f3c343', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            🎭 Evento Rodada {gameState.round}
          </span>
        </div>
        {gameState.currentEvent ? (
          <CardHoverPreview event={gameState.currentEvent}>
            <div style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {gameState.currentEvent.name}
              </div>
              <div style={{ fontSize: 9, color: '#ebdccb', lineHeight: 1.25, marginTop: 2 }}>
                {gameState.currentEvent.description}
              </div>
            </div>
          </CardHoverPreview>
        ) : (
          <div style={{ fontSize: 9, color: '#8a7a6e', fontStyle: 'italic' }}>
            Nenhum evento na 1ª rodada (iniciam na Rodada 2).
          </div>
        )}
      </div>

      {/* Cubos Visíveis do Conservatório */}
      {gameState.conservatorioCubes.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '22%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(20,15,10,0.85)',
            border: '1px solid rgba(52,152,219,0.5)',
            borderRadius: 6,
            padding: '2px 5px',
            zIndex: 3,
            pointerEvents: 'none',
          }}
          title="Cubos disponíveis no Conservatório para o bônus das setas"
        >
          <span style={{ fontSize: 8, color: '#3498db', fontWeight: 700 }}>🏛️ Bônus:</span>
          {gameState.conservatorioCubes.map((c, i) => (
            <CubeToken key={i} color={c} size="sm" />
          ))}
        </div>
      )}

      {/* Centro do Tabuleiro: Status & Dado do Jogador */}
      {/* Centro do Tabuleiro: Status & Dado do Jogador */}
      <div className="main-board__center-dice">
        <Dice3D value={currentPlayer.timeMarker} size={48} color={getPlayerColorHex(currentPlayer.color)} />
        <div style={{ textAlign: 'center' }}>
          <span className="main-board__center-label">{currentPlayer.name}</span>
          <div style={{ fontSize: 9.5, color: '#c9922b', fontWeight: 600, marginTop: 2 }}>
            {currentPlayer.chosenClub !== null
              ? `🎪 Em um Clube: ${CLUBS.find(c => c.id === currentPlayer.chosenClub)?.name}`
              : hasActedThisTurn
                ? '✓ Ação feita! Passe a vez'
                : selectedLocation !== null
                  ? `Destino: ${BOARD_LOCATIONS.find(l => l.index === selectedLocation)?.name}`
                  : currentPlayer.boardPosition === 0
                    ? 'Escolha um local no mapa'
                    : `Em: ${BOARD_LOCATIONS.find(l => l.index === currentPlayer.boardPosition)?.name}`}
          </div>
        </div>
      </div>

      {/* ── ESPAÇO DESIGNADO: "EM UM CLUBE" (Aguardando a Noite) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          background: 'linear-gradient(135deg, rgba(15,10,5,0.96), rgba(28,18,8,0.96))',
          border: '1.5px solid rgba(201,146,43,0.5)',
          borderRadius: 10,
          padding: '4px 10px',
          zIndex: 4,
          alignItems: 'center',
          maxWidth: '96%',
          overflowX: 'auto',
          boxShadow: '0 4px 14px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginRight: 2 }}>
          <span style={{ fontSize: 9, color: '#f3c343', fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🎪</span>
            <span>Em um Clube:</span>
          </span>
          <span style={{ fontSize: 7.5, color: '#ebdccb', whiteSpace: 'nowrap' }}>
            {gameState.players.filter(p => p.chosenClub !== null).length > 0
              ? `${gameState.players.filter(p => p.chosenClub !== null).length} no clube`
              : 'Nenhum músico'}
          </span>
        </div>
        {CLUBS.map(club => {
          const isEligible = currentPlayer.renown >= club.minRenown;
          const isChosenByMe = currentPlayer.chosenClub === club.id;
          const playersAtThisClub = gameState.players.filter(p => p.chosenClub === club.id);
          const rewards = gameState.clubRewards ? gameState.clubRewards[club.id] || [] : [];
          const claimedCount = rewards.filter(r => !!r.claimedByPlayerId).length;

          return (
            <div
              key={club.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 8.5,
                color: isChosenByMe ? '#2ecc71' : isEligible ? '#f0ede8' : 'rgba(255,255,255,0.4)',
                padding: '3px 7px',
                borderRadius: 6,
                background: isChosenByMe
                  ? 'rgba(46,204,113,0.25)'
                  : playersAtThisClub.length > 0
                    ? 'rgba(201,146,43,0.2)'
                    : 'rgba(255,255,255,0.05)',
                border: isChosenByMe
                  ? '1.5px solid #2ecc71'
                  : playersAtThisClub.length > 0
                    ? '1.5px solid rgba(243,195,67,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                whiteSpace: 'nowrap',
                position: 'relative',
              }}
              title={`${club.name}: Lotação máx ${club.maxCapacity}, Sucesso ${club.successThreshold} pts, Requer Renome ${club.minRenown}. Prêmios resgatados: ${claimedCount}/${rewards.length}`}
            >
              <ClubHoverPreview
                club={club}
                rewards={rewards}
                players={gameState.players}
              >
                <div style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                  <ClubBadgeIcon clubId={club.id} size={15} />
                </div>
              </ClubHoverPreview>
              <span style={{ fontWeight: 600 }}>{club.name}</span>

              {/* Peões dos jogadores que escolheram este clube */}
              {playersAtThisClub.length > 0 && (
                <div style={{ display: 'inline-flex', gap: 3, marginLeft: 2, alignItems: 'center' }}>
                  {playersAtThisClub.map(p => (
                    <PlayerPawn
                      key={p.id}
                      color={p.color}
                      size={18}
                      isActive={p.id === currentPlayer.id}
                    />
                  ))}
                </div>
              )}

              {/* Mini-cubos dos prêmios */}
              {rewards.length > 0 && (
                <div style={{ display: 'inline-flex', gap: 2, marginLeft: 2 }}>
                  {rewards.map((r, rIdx) => {
                    const claimingPlayer = r.claimedByPlayerId ? gameState.players.find(p => p.id === r.claimedByPlayerId) : null;
                    return (
                      <span
                        key={rIdx}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 1.5,
                          background: claimingPlayer ? getPlayerColorHex(claimingPlayer.color) : 'transparent',
                          border: claimingPlayer ? '1px solid rgba(255,255,255,0.7)' : '1px solid rgba(243,195,67,0.5)',
                          display: 'inline-block',
                        }}
                        title={claimingPlayer ? `${r.label} (Reclamado por ${claimingPlayer.name})` : `${r.label} (Disponível)`}
                      />
                    );
                  })}
                </div>
              )}
              {isChosenByMe && <span style={{ color: '#2ecc71', fontWeight: 800 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
