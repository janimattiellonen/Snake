import { useEffect, useRef, useState } from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onSubmitHighScore: (name: string) => void;
  onBackToMain: () => void;
}

export function GameOverScreen({ score, onRestart, onSubmitHighScore, onBackToMain }: GameOverScreenProps) {
  const restartRef = useRef<HTMLButtonElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    restartRef.current?.focus();
  }, []);

  useEffect(() => {
    if (showForm) {
      nameInputRef.current?.focus();
    }
  }, [showForm]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmitHighScore(trimmed);
  }

  if (showForm) {
    return (
      <div className="overlay">
        <div className="game-over-dialog">
          <h2 className="game-over-text">Submit High Score</h2>
          <p className="game-over-score">Score: {score}</p>
          <form onSubmit={handleSubmit} className="high-score-form">
            <label className="high-score-label" htmlFor="player-name">
              Player name
            </label>
            <input
              ref={nameInputRef}
              id="player-name"
              name="name"
              type="text"
              className="high-score-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
            <div className="pause-buttons">
              <button type="submit" ref={submitRef} className="high-score-submit-button">
                Submit high score!
              </button>
              <button type="button" className="quit-button" onClick={onBackToMain}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay">
      <div className="game-over-dialog">
        <h2 className="game-over-text">GAME OVER!</h2>
        <p className="game-over-score">Score: {score}</p>
        <div className="game-over-buttons">
          <button ref={restartRef} className="start-button" onClick={onRestart}>
            Start a new game
          </button>
          {score > 0 && (
            <button className="high-score-button" onClick={() => setShowForm(true)}>
              Submit high score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
