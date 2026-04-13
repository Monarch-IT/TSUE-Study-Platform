// ═══════════════════════════════════════
// XP Calculator — Level & Rank Engine
// ═══════════════════════════════════════

/** XP required for each level (cumulative thresholds) */
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  850,    // Level 5
  1300,   // Level 6
  1900,   // Level 7
  2700,   // Level 8
  3700,   // Level 9
  5000,   // Level 10
  6500,   // Level 11
  8500,   // Level 12
  11000,  // Level 13
  14000,  // Level 14
  18000,  // Level 15
  23000,  // Level 16
  29000,  // Level 17
  37000,  // Level 18
  47000,  // Level 19
  60000,  // Level 20 (Monarch)
];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  rank: string;
  rankColor: string;
  rankGlow: string;
}

/** Rank names and colors by level ranges */
const RANKS: { min: number; max: number; name: string; color: string; glow: string }[] = [
  { min: 1, max: 3, name: 'Новичок', color: '#94a3b8', glow: 'rgba(148,163,184,0.3)' },
  { min: 4, max: 6, name: 'Ученик', color: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
  { min: 7, max: 9, name: 'Кодер', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { min: 10, max: 12, name: 'Мастер', color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
  { min: 13, max: 15, name: 'Эксперт', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  { min: 16, max: 18, name: 'Легенда', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  { min: 19, max: 19, name: 'Грандмастер', color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
  { min: 20, max: 20, name: 'Монарх', color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' },
];

/** Calculate level from total XP */
export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/** Get detailed level info for a user's XP */
export function getLevelInfo(totalXP: number): LevelInfo {
  const level = calculateLevel(totalXP);
  const xpForCurrentLevel = LEVEL_THRESHOLDS[level - 1] || 0;
  const xpForNextLevel = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpIntoLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100));

  const rankData = RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];

  return {
    level,
    currentXP: totalXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpIntoLevel,
    xpNeededForNext,
    progressPercent,
    rank: rankData.name,
    rankColor: rankData.color,
    rankGlow: rankData.glow,
  };
}

/** XP rewards for various actions */
export const XP_REWARDS = {
  task_easy: 25,
  task_medium: 50,
  task_hard: 100,
  task_legendary: 250,
  battle_win: 75,
  battle_loss: 15,
  daily_login: 10,
  streak_bonus_per_day: 5,
  peer_help: 20,
  first_attempt_perfect: 50,
} as const;

/** ELO rating adjustment */
export function calculateEloChange(playerElo: number, opponentElo: number, won: boolean): number {
  const K = 32;
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actual = won ? 1 : 0;
  return Math.round(K * (actual - expected));
}

/** Get ELO rank name */
export function getEloRank(elo: number): { name: string; color: string; icon: string } {
  if (elo >= 2200) return { name: 'Monarch', color: '#fbbf24', icon: '👑' };
  if (elo >= 1800) return { name: 'Diamond', color: '#38bdf8', icon: '💎' };
  if (elo >= 1500) return { name: 'Gold', color: '#f59e0b', icon: '🥇' };
  if (elo >= 1200) return { name: 'Silver', color: '#94a3b8', icon: '🥈' };
  return { name: 'Bronze', color: '#cd7f32', icon: '🥉' };
}
