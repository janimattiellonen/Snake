import { useEffect } from 'react';

interface PauseScreenProps {
  onResume: () => void;
}

export function PauseScreen({ onResume }: PauseScreenProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        onResume();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  return (
    <div className="overlay" onClick={onResume}>
      <div className="game-over-dialog">
        <h2 className="pause-text">PAUSED!</h2>
        <p className="pause-hint">Press <span className="help-key">P</span> or <span className="help-key">Esc</span> key or click mouse to continue</p>
      </div>
    </div>
  );
}
