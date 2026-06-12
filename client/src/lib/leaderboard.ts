// Leaderboard management utilities
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  timestamp: number;
  date: string;
}

const LEADERBOARD_KEY = 'bubble_match_leaderboard';
const MAX_ENTRIES = 10;

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    return [];
  }
}

export function addScore(playerName: string, score: number, level: number): LeaderboardEntry {
  const leaderboard = getLeaderboard();
  
  const entry: LeaderboardEntry = {
    id: `${Date.now()}_${Math.random()}`,
    playerName: playerName || 'Anonymous',
    score,
    level,
    timestamp: Date.now(),
    date: new Date().toLocaleDateString(),
  };
  
  // Add new entry
  leaderboard.push(entry);
  
  // Sort by score descending
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Keep only top 10
  const topScores = leaderboard.slice(0, MAX_ENTRIES);
  
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
  } catch (error) {
    console.error('Error saving leaderboard:', error);
  }
  
  return entry;
}

export function isHighScore(score: number): boolean {
  const leaderboard = getLeaderboard();
  
  if (leaderboard.length < MAX_ENTRIES) {
    return true;
  }
  
  const lowestScore = leaderboard[leaderboard.length - 1]?.score || 0;
  return score > lowestScore;
}

export function getRankForScore(score: number): number {
  const leaderboard = getLeaderboard();
  const rank = leaderboard.findIndex(entry => entry.score <= score) + 1;
  return rank || leaderboard.length + 1;
}

export function clearLeaderboard(): void {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
}
