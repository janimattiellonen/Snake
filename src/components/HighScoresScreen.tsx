import { type HighScoreEntry } from '../highScores';

interface HighScoresScreenProps {
  scores: HighScoreEntry[];
  onBack: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HighScoresScreen({ scores, onBack }: HighScoresScreenProps) {
  return (
    <div className="help-screen">
      <h1 className="help-title">High Scores</h1>

      {scores.length === 0 ? (
        <p className="high-scores-empty">No scores yet. Play a game!</p>
      ) : (
        <div className="high-scores-table-wrapper">
          <table className="high-scores-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, i) => (
                <tr key={`${entry.name}-${entry.date}-${i}`}>
                  <td className="high-scores-rank">{i + 1}</td>
                  <td className="high-scores-name">{entry.name}</td>
                  <td className="high-scores-score">{entry.score}</td>
                  <td className="high-scores-date">{formatDate(entry.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button className="help-back-button" onClick={onBack}>
        Back to main
      </button>
    </div>
  );
}
