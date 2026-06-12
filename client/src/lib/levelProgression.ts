/**
 * Level Progression System for Bubble Match Timer
 * Supports 100 levels with dynamic difficulty scaling
 * 
 * Progression Tiers:
 * - Levels 1-20: Easy (large bubbles, slow speed)
 * - Levels 21-40: Medium (medium bubbles, medium speed)
 * - Levels 41-60: Hard (small bubbles, fast speed)
 * - Levels 61-80: Very Hard (smaller bubbles, very fast speed)
 * - Levels 81-100: Extreme (tiny bubbles, extreme speed)
 */

export interface LevelConfig {
  level: number;
  goalScore: number;
  bubbleRadius: number;
  bubbleSpeed: number;
  bubbleCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'VeryHard' | 'Extreme';
}

/**
 * Get level configuration based on level number
 * @param level - Level number (1-100)
 * @returns LevelConfig with all difficulty parameters
 */
export function getLevelConfig(level: number): LevelConfig {
  // Clamp level to valid range
  const validLevel = Math.max(1, Math.min(level, 100));

  // Calculate goal score: 300 + (50 × level)
  const goalScore = 300 + 50 * validLevel;

  // Determine difficulty tier and calculate parameters
  let bubbleRadius: number;
  let bubbleSpeed: number;
  let bubbleCount: number;
  let difficulty: 'Easy' | 'Medium' | 'Hard' | 'VeryHard' | 'Extreme';

  if (validLevel <= 20) {
    // Easy: Levels 1-20
    difficulty = 'Easy';
    bubbleRadius = 25; // Large bubbles
    bubbleSpeed = 1.0; // Slow speed
    bubbleCount = 12 + Math.floor((validLevel - 1) / 2); // 12-18 bubbles
  } else if (validLevel <= 40) {
    // Medium: Levels 21-40
    difficulty = 'Medium';
    bubbleRadius = 20; // Medium bubbles
    bubbleSpeed = 1.0 + (validLevel - 20) * 0.05; // 1.0 to 2.0
    bubbleCount = 16 + Math.floor((validLevel - 21) / 2); // 16-26 bubbles
  } else if (validLevel <= 60) {
    // Hard: Levels 41-60
    difficulty = 'Hard';
    bubbleRadius = 20 - (validLevel - 40) * 0.25; // 20 to 15
    bubbleSpeed = 2.0 + (validLevel - 40) * 0.05; // 2.0 to 3.0
    bubbleCount = 18 + Math.floor((validLevel - 41) / 2); // 18-28 bubbles
  } else if (validLevel <= 80) {
    // Very Hard: Levels 61-80
    difficulty = 'VeryHard';
    bubbleRadius = 15 - (validLevel - 60) * 0.15; // 15 to 12
    bubbleSpeed = 3.0 + (validLevel - 60) * 0.05; // 3.0 to 4.0
    bubbleCount = 20 + Math.floor((validLevel - 61) / 2); // 20-30 bubbles
  } else {
    // Extreme: Levels 81-100
    difficulty = 'Extreme';
    bubbleRadius = 12 - (validLevel - 80) * 0.1; // 12 to 10
    bubbleSpeed = 4.0 + (validLevel - 80) * 0.05; // 4.0 to 5.0
    bubbleCount = 22 + Math.floor((validLevel - 81) / 2); // 22-32 bubbles
  }

  return {
    level: validLevel,
    goalScore,
    bubbleRadius: Math.max(10, bubbleRadius), // Minimum 10px radius
    bubbleSpeed: Math.min(bubbleSpeed, 5.0), // Maximum 5.0x speed
    bubbleCount,
    difficulty,
  };
}

/**
 * Get difficulty description for UI display
 * @param level - Level number
 * @returns Human-readable difficulty description
 */
export function getDifficultyDescription(level: number): string {
  if (level <= 20) return '⭐ Easy';
  if (level <= 40) return '⭐⭐ Medium';
  if (level <= 60) return '⭐⭐⭐ Hard';
  if (level <= 80) return '⭐⭐⭐⭐ Very Hard';
  return '⭐⭐⭐⭐⭐ Extreme';
}

/**
 * Get progress percentage through all 100 levels
 * @param level - Current level number
 * @returns Progress percentage (0-100)
 */
export function getLevelProgress(level: number): number {
  return Math.min((level / 100) * 100, 100);
}

/**
 * Check if level is a milestone (25, 50, 75, 100)
 * @param level - Level number
 * @returns True if level is a milestone
 */
export function isMilestoneLevel(level: number): boolean {
  return level === 25 || level === 50 || level === 75 || level === 100;
}

/**
 * Get milestone reward message
 * @param level - Level number
 * @returns Milestone message or empty string
 */
export function getMilestoneMessage(level: number): string {
  switch (level) {
    case 25:
      return '🎉 Quarter Way There! You\'ve reached Level 25!';
    case 50:
      return '🏆 Halfway to Mastery! You\'ve reached Level 50!';
    case 75:
      return '⚡ Almost There! You\'ve reached Level 75!';
    case 100:
      return '👑 ULTIMATE MASTER! You\'ve conquered all 100 levels!';
    default:
      return '';
  }
}

/**
 * Get all level configs for reference (for debugging)
 * @returns Array of all 100 level configurations
 */
export function getAllLevelConfigs(): LevelConfig[] {
  const configs: LevelConfig[] = [];
  for (let i = 1; i <= 100; i++) {
    configs.push(getLevelConfig(i));
  }
  return configs;
}
