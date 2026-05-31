import { create } from 'zustand';
import { gamificationAPI } from '../services/api';
import { showBadgeUnlockToast } from '../lib/gamificationToast';

const initialSummary = { stats: null, recentBadges: [] };

export const useGamificationStore = create((set, get) => ({
  summary: initialSummary,
  badges: [],
  groupInsights: {},
  groupHeatmap: {},
  groupLeaderboard: {},
  loading: false,
  groupLoading: false,
  lastKnownBadgeCount: 0,

  fetchMySummary: async () => {
    set({ loading: true });
    try {
      const res = await gamificationAPI.getMySummary();
      const prevCount = get().lastKnownBadgeCount;
      const newBadges = res.data.recentBadges || [];
      if (prevCount > 0 && newBadges.length > prevCount) {
        showBadgeUnlockToast(newBadges[0].badgeType);
      }
      set({
        summary: res.data,
        badges: newBadges,
        lastKnownBadgeCount: newBadges.length,
        loading: false,
      });
      return res.data;
    } catch {
      set({ loading: false });
      return null;
    }
  },

  fetchMyBadges: async () => {
    try {
      const res = await gamificationAPI.getMyBadges();
      set({ badges: res.data });
      return res.data;
    } catch {
      return [];
    }
  },

  fetchGroupGamification: async (groupId) => {
    if (!groupId) return;
    set({ groupLoading: true });
    try {
      const [insightsRes, heatRes, boardRes] = await Promise.all([
        gamificationAPI.getGroupInsights(groupId),
        gamificationAPI.getGroupActivity(groupId),
        gamificationAPI.getLeaderboard(groupId, 'active'),
      ]);
      set((state) => ({
        groupInsights: { ...state.groupInsights, [groupId]: insightsRes.data },
        groupHeatmap: { ...state.groupHeatmap, [groupId]: heatRes.data },
        groupLeaderboard: { ...state.groupLeaderboard, [groupId]: boardRes.data },
        groupLoading: false,
      }));
    } catch {
      set({ groupLoading: false });
    }
  },

  refreshAfterAction: async () => {
    await get().fetchMySummary();
  },
}));
