import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getLevelInfo, calculateLevel, type LevelInfo } from '@/lib/xpCalculator';
import { isValidUUID } from '@/lib/uuidGuard';

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  title_ru: string;
  description_ru: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_bonus: number;
  category: string;
  unlocked_at?: string;
}

export interface DailyMission {
  id: string;
  mission_type: string;
  title_ru: string;
  description_ru: string;
  target_count: number;
  current_count: number;
  xp_reward: number;
  is_completed: boolean;
}

export interface LeaderboardEntry {
  uuid: string;
  tsue_id: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  total_xp: number;
  tasks_solved: number;
  battles_won: number;
  battle_elo: number;
  current_streak: number;
  code_gpa: number;
  group: string;
  xp_rank: number;
}

export interface XPLogEntry {
  id: string;
  amount: number;
  source: string;
  description: string;
  created_at: string;
}

export function useXP(userId?: string) {
  const [levelInfo, setLevelInfo] = useState<LevelInfo>(getLevelInfo(0));
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedSlugs, setUnlockedSlugs] = useState<Set<string>>(new Set());
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentXP, setRecentXP] = useState<XPLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    tasks_solved: 0,
    battles_won: 0,
    battles_played: 0,
    battle_elo: 1000,
    current_streak: 0,
    code_gpa: 0,
  });

  const fetchAll = useCallback(async () => {
    if (!userId || !isValidUUID(userId)) { setLoading(false); return; }
    setLoading(true);
    try {
      // Fetch user gamification data
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp, level, tasks_solved, battles_won, battles_played, battle_elo, current_streak, longest_streak, code_gpa')
        .eq('uuid', userId)
        .single();

      if (userData) {
        setLevelInfo(getLevelInfo(userData.total_xp || 0));
        setUserStats({
          tasks_solved: userData.tasks_solved || 0,
          battles_won: userData.battles_won || 0,
          battles_played: userData.battles_played || 0,
          battle_elo: userData.battle_elo || 1000,
          current_streak: userData.current_streak || 0,
          code_gpa: userData.code_gpa || 0,
        });
      }

      // Fetch all achievements + user's unlocks
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      const { data: unlocks } = await supabase
        .from('achievements_unlock')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

      const unlockedMap = new Map(
        (unlocks || []).map(u => [u.achievement_id, u.unlocked_at])
      );
      const slugs = new Set<string>();

      const merged = (allAchievements || []).map(a => {
        const unlocked = unlockedMap.get(a.id);
        if (unlocked) slugs.add(a.slug);
        return { ...a, unlocked_at: unlocked || undefined };
      });
      setAchievements(merged);
      setUnlockedSlugs(slugs);

      // Fetch daily missions
      const { data: missions } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', userId)
        .eq('mission_date', new Date().toISOString().split('T')[0]);

      setDailyMissions(missions || []);

      // Fetch leaderboard (top 10)
      const { data: lb } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(10);

      setLeaderboard(lb || []);

      // Fetch recent XP
      const { data: xpEntries } = await supabase
        .from('xp_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentXP(xpEntries || []);
    } catch (err) {
      console.error('useXP fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** Add XP to current user */
  const addXP = useCallback(async (amount: number, source: string, description?: string) => {
    if (!userId || !isValidUUID(userId)) return;

    // Insert XP log
    await supabase.from('xp_log').insert({
      user_id: userId,
      amount,
      source,
      description: description || `+${amount} XP`,
    });

    // Update user's total_xp
    const newTotal = (levelInfo.currentXP || 0) + amount;
    const newLevel = calculateLevel(newTotal);

    await supabase.from('users').update({
      total_xp: newTotal,
      level: newLevel,
    }).eq('uuid', userId);

    setLevelInfo(getLevelInfo(newTotal));
  }, [userId, levelInfo.currentXP]);

  return {
    levelInfo,
    achievements,
    unlockedSlugs,
    dailyMissions,
    leaderboard,
    recentXP,
    userStats,
    loading,
    addXP,
    refresh: fetchAll,
  };
}
