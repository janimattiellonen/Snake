interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  return (
    <div className="overlay">
      <div className="game-over-dialog">
        <h2 className="game-over-text">GAME OVER!</h2>
        <p className="game-over-score">Score: {score}</p>
        <button className="start-button" onClick={onRestart}>
          Start a new game
        </button>
      </div>
    </div>
  );
}
