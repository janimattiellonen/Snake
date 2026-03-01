import { useState } from 'react';
import { GameState } from './types';
import { useSnakeGame } from './useSnakeGame';
import { loadHighScores, saveHighScore } from './highScores';
import { TitleScreen } from './components/TitleScreen';
import { HelpScreen } from './components/HelpScreen';
import { HighScoresScreen } from './components/HighScoresScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { GameBoard } from './components/GameBoard';
import { PauseDialog } from './components/PauseDialog';
import { PauseScreen } from './components/PauseScreen';
import { GameOverScreen } from './components/GameOverScreen';
import './App.css';

type TitleSubscreen = 'main' | 'help' | 'settings' | 'highscores';

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
    triggerBomb,
    spawnPowerupNow,
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

  function handleSubmitHighScore(name: string) {
    saveHighScore(name, score);
    quitGame();
  }

  function handleBackToMain() {
    quitGame();
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
            onHighScores={() => setTitleSubscreen('highscores')}
          />
        )}

        {gameState === GameState.TITLE && titleSubscreen === 'help' && (
          <HelpScreen onBack={() => setTitleSubscreen('main')} />
        )}

        {gameState === GameState.TITLE && titleSubscreen === 'highscores' && (
          <HighScoresScreen
            scores={loadHighScores()}
            onBack={() => setTitleSubscreen('main')}
          />
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
              onTriggerBomb={triggerBomb}
            />
            {gameState === GameState.PAUSED && (
              <PauseDialog onQuit={quitGame} onContinue={togglePause} onSpawnPowerup={spawnPowerupNow} />
            )}
            {gameState === GameState.SIMPLE_PAUSED && (
              <PauseScreen onResume={simpleResume} onSpawnPowerup={spawnPowerupNow} />
            )}
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="game-wrapper">
            <GameBoard
              score={score}
              darkMode={darkMode}
              disableKeyboard
              renderStateRef={renderStateRef}
              onDirectionChange={() => {}}
              onPause={() => {}}
              onSimplePause={() => {}}
              onTriggerBomb={() => {}}
            />
            <GameOverScreen
              score={score}
              onRestart={startGame}
              onSubmitHighScore={handleSubmitHighScore}
              onBackToMain={handleBackToMain}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
