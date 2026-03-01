interface TitleScreenProps {
  onStart: () => void;
  onHelp: () => void;
  onSettings: () => void;
  onHighScores: () => void;
}

export function TitleScreen({ onStart, onHelp, onSettings, onHighScores }: TitleScreenProps) {
  return (
    <div className="title-screen">
      <h1 className="title-text">Snake</h1>
      <button className="start-button" onClick={onStart}>
        Start game
      </button>
      <button className="help-button" onClick={onHighScores}>
        High Scores
      </button>
      <button className="help-button" onClick={onHelp}>
        Help
      </button>
      <button className="help-button" onClick={onSettings}>
        Settings
      </button>
    </div>
  );
}
