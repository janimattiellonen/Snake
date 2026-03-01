import { useEffect, useRef } from 'react';

interface PauseDialogProps {
  onQuit: () => void;
  onContinue: () => void;
}

export function PauseDialog({ onQuit, onContinue }: PauseDialogProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  return (
    <div className="overlay">
      <div className="pause-dialog">
        <p>Do you want to quit?</p>
        <div className="pause-buttons">
          <button className="quit-button" onClick={onQuit}>
            Quit
          </button>
          <button ref={continueRef} className="continue-button" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
