import { GameState } from './types';
import { useSnakeGame } from './useSnakeGame';
import { TitleScreen } from './components/TitleScreen';
import { GameBoard } from './components/GameBoard';
import { PauseDialog } from './components/PauseDialog';
import { GameOverScreen } from './components/GameOverScreen';
import './App.css';

function App() {
  const {
    gameState,
    score,
    renderStateRef,
    startGame,
    togglePause,
    quitGame,
    changeDirection,
  } = useSnakeGame();

  return (
    <div className="app">
      <div className="game-canvas">
        {gameState === GameState.TITLE && (
          <TitleScreen onStart={startGame} />
        )}

        {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
          <div className="game-wrapper">
            <GameBoard
              score={score}
              renderStateRef={renderStateRef}
              onDirectionChange={changeDirection}
              onPause={togglePause}
            />
            {gameState === GameState.PAUSED && (
              <PauseDialog onQuit={quitGame} onContinue={togglePause} />
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
            />
            <GameOverScreen score={score} onRestart={startGame} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
