import { useCallback, useReducer } from 'react';
import './App.css';
import { createInitialState } from './engine/gameEngine';
import type { GameState } from './types/game';
import SetupScreen from './components/SetupScreen';
import GameBoard from './components/GameBoard';

// ─── TIPOS DO SETUP ────────────────────────────────────────────────────────────

export interface PlayerSetup {
  name: string;
  color: string;
  isBot: boolean;
}

const PLAYER_COLORS = ['orange', 'pink', 'green', 'brown', 'gray'];

// ─── REDUCER DO JOGO ──────────────────────────────────────────────────────────

type GameAction =
  | { type: 'START_GAME'; setup: PlayerSetup[] }
  | { type: 'UPDATE_STATE'; newState: GameState }
  | { type: 'RESET' };

interface AppState {
  screen: 'setup' | 'game' | 'end';
  gameState: GameState | null;
}

function appReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    case 'START_GAME': {
      const gameState = createInitialState({
        playerNames: action.setup.map(p => p.name),
        playerColors: action.setup.map(p => p.color),
        isBots: action.setup.map(p => p.isBot),
      });
      return { screen: 'game', gameState };
    }
    case 'UPDATE_STATE':
      return {
        ...state,
        screen: 'game',
        gameState: action.newState,
      };
    case 'RESET':
      return { screen: 'setup', gameState: null };
    default:
      return state;
  }
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(appReducer, {
    screen: 'setup',
    gameState: null,
  });

  const handleStartGame = useCallback((setup: PlayerSetup[]) => {
    dispatch({ type: 'START_GAME', setup });
  }, []);

  const handleStateUpdate = useCallback((newState: GameState) => {
    dispatch({ type: 'UPDATE_STATE', newState });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <div id="app-root">
      {state.screen === 'setup' && (
        <SetupScreen
          onStart={handleStartGame}
          playerColors={PLAYER_COLORS}
        />
      )}
      {state.screen === 'game' && state.gameState && (
        <GameBoard
          gameState={state.gameState}
          onStateUpdate={handleStateUpdate}
          onResetGame={handleReset}
        />
      )}
    </div>
  );
}
