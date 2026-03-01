const STORAGE_KEY = 'snake-high-scores';
const MAX_SCORES = 10;

export interface HighScoreEntry {
  name: string;
  score: number;
  date: string;
}

export function loadHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HighScoreEntry[];
    return parsed
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);
  } catch {
    return [];
  }
}

export function saveHighScore(name: string, score: number): void {
  const scores = loadHighScores();
  scores.push({
    name,
    score,
    date: new Date().toISOString(),
  });
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, MAX_SCORES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}
