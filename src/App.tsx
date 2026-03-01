import { useState } from 'react';
import { GameState } from './types';
import { useSnakeGame } from './useSnakeGame';
import { TitleScreen } from './components/TitleScreen';
import { HelpScreen } from './components/HelpScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { GameBoard } from './components/GameBoard';
import { PauseDialog } from './components/PauseDialog';
import { PauseScreen } from './components/PauseScreen';
import { GameOverScreen } from './components/GameOverScreen';
import './App.css';

type TitleSubscreen = 'main' | 'help' | 'settings';

function loadDarkMode(): boolean {
  try {
    return localStorage.getItem('snake-dark-mode') === 'true';
  } catch {
    return false;
  }
}

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

  const [titleSubscreen, setTitleSubscreen] = useState<TitleSubscreen>('main');
  const [darkMode, setDarkMode] = useState(loadDarkMode);

  function handleDarkModeChange(enabled: boolean) {
    setDarkMode(enabled);
    try {
      localStorage.setItem('snake-dark-mode', String(enabled));
    } catch {
      // ignore storage errors
    }
  }

  const isInGame = gameState === GameState.PLAYING
    || gameState === GameState.PAUSED
    || gameState === GameState.SIMPLE_PAUSED;

  return (
    <div className="app">
      <div className="game-canvas">
        {gameState === GameState.TITLE && titleSubscreen === 'main' && (
          <TitleScreen
            onStart={startGame}
            onHelp={() => setTitleSubscreen('help')}
            onSettings={() => setTitleSubscreen('settings')}
          />
        )}

        {gameState === GameState.TITLE && titleSubscreen === 'help' && (
          <HelpScreen onBack={() => setTitleSubscreen('main')} />
        )}

        {gameState === GameState.TITLE && titleSubscreen === 'settings' && (
          <SettingsScreen
            darkMode={darkMode}
            onDarkModeChange={handleDarkModeChange}
            onBack={() => setTitleSubscreen('main')}
          />
        )}

        {isInGame && (
          <div className="game-wrapper">
            <GameBoard
              score={score}
              darkMode={darkMode}
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
              darkMode={darkMode}
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
