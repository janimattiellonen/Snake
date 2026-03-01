import { GameState } from './types';
import { useSnakeGame } from './useSnakeGame';
import { TitleScreen } from './components/TitleScreen';
import { GameBoard } from './components/GameBoard';
import { PauseDialog } from './components/PauseDialog';
import { PauseScreen } from './components/PauseScreen';
import { GameOverScreen } from './components/GameOverScreen';
import './App.css';

function App() {
  const {
    gameState,
    score,
    renderStateRef,
    startGame,
    togglePause,
    simplePause,
    simpleResume,
    quitGame,
    changeDirection,
  } = useSnakeGame();

  const isInGame = gameState === GameState.PLAYING
    || gameState === GameState.PAUSED
    || gameState === GameState.SIMPLE_PAUSED;

  return (
    <div className="app">
      <div className="game-canvas">
        {gameState === GameState.TITLE && (
          <TitleScreen onStart={startGame} />
        )}

        {isInGame && (
          <div className="game-wrapper">
            <GameBoard
              score={score}
              renderStateRef={renderStateRef}
              onDirectionChange={changeDirection}
              onPause={togglePause}
              onSimplePause={simplePause}
            />
            {gameState === GameState.PAUSED && (
              <PauseDialog onQuit={quitGame} onContinue={togglePause} />
            )}
            {gameState === GameState.SIMPLE_PAUSED && (
              <PauseScreen onResume={simpleResume} />
            )}
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="game-wrapper">
            <GameBoard
              score={score}
              renderStateRef={renderStateRef}
              onDirectionChange={() => {}}
              onPause={() => {}}
              onSimplePause={() => {}}
            />
            <GameOverScreen score={score} onRestart={startGame} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
