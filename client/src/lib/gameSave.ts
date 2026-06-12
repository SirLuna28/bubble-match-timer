// Game save/load system using localStorage

export interface GameSaveData {
  level: number;
  score: number;
  timeLeft: number;
  goalScore: number;
  bubbleCount: number;
  difficulty: 'easy' | 'normal' | 'hard';
  timestamp: number;
}

const SAVE_KEY = 'bubble_match_timer_save';

export const saveGameProgress = (gameData: GameSaveData): void => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
  } catch (error) {
    console.error('Failed to save game progress:', error);
  }
};

export const loadGameProgress = (): GameSaveData | null => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load game progress:', error);
  }
  return null;
};

export const clearGameProgress = (): void => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear game progress:', error);
  }
};

export const hasGameProgress = (): boolean => {
  try {
    return localStorage.getItem(SAVE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check game progress:', error);
    return false;
  }
};

export const getSaveTimestamp = (): string => {
  const saved = loadGameProgress();
  if (saved) {
    const date = new Date(saved.timestamp);
    return date.toLocaleTimeString();
  }
  return '';
};
