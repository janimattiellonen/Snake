interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="title-screen">
      <h1 className="title-text">Snake</h1>
      <button className="start-button" onClick={onStart}>
        Start game
      </button>
    </div>
  );
}
