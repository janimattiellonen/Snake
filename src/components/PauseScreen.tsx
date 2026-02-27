import { useEffect } from 'react';

interface PauseScreenProps {
  onResume: () => void;
}

export function PauseScreen({ onResume }: PauseScreenProps) {
  useEffect(() => {
    function handleKeyDown() {
      onResume();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  return (
    <div className="overlay">
      <div className="game-over-dialog">
        <h2 className="pause-text">PAUSED!</h2>
      </div>
    </div>
  );
}
