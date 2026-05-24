import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  authAPI, groupAPI, expenseAPI, settlementAPI,
  analyticsAPI, activityAPI, messageAPI, userAPI
} from '../services/api';
import toast from 'react-hot-toast';

// =============================================
// AUTH STORE
// =============================================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      signup: async (data) => {
        set({ loading: true });
        try {
          const res = await authAPI.signup(data);
          const { token, user } = res.data;
          localStorage.setItem('splitly_token', token);
          set({ user, token, isAuthenticated: true, loading: false });
          toast.success(`Welcome to Splitly, ${user.fullName}! 🎉`);
          return true;
        } catch (err) {
          const msg = err.response?.data?.message || 'Signup failed';
          toast.error(msg);
          set({ loading: false });
          return false;
        }
      },

      login: async (data) => {
        set({ loading: true });
        try {
          const res = await authAPI.login(data);
          const { token, user } = res.data;
          localStorage.setItem('splitly_token', token);
          set({ user, token, isAuthenticated: true, loading: false });
          toast.success(`Welcome back, ${user.fullName}!`);
          return true;
        } catch (err) {
          const msg = err.response?.data?.message || 'Invalid email or password';
          toast.error(msg);
          set({ loading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('splitly_token');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      refreshUser: async () => {
        try {
          const res = await userAPI.getMe();
          set({ user: res.data });
        } catch {}
      },

      updateProfile: async (data) => {
        try {
          const res = await userAPI.updateProfile(data);
          set({ user: res.data });
          toast.success('Profile updated!');
          return true;
        } catch {
          toast.error('Failed to update profile');
          return false;
        }
      },
    }),
    {
      name: 'splitly_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// =============================================
// GROUP STORE
// =============================================
export const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  membersLoading: false,

  fetchGroups: async () => {
    set({ loading: true });
    try {
      const res = await groupAPI.getAll();
      set({ groups: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchGroup: async (id) => {
    set({ loading: true });
    try {
      const res = await groupAPI.getById(id);
      set({ currentGroup: res.data, loading: false });
      return res.data;
    } catch {
      set({ loading: false });
      return null;
    }
  },

  createGroup: async (data) => {
    try {
      const res = await groupAPI.create(data);
      set(state => ({ groups: [res.data, ...state.groups] }));
      toast.success(`Group "${res.data.groupName}" created!`);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
      return null;
    }
  },

  updateGroup: async (id, data) => {
    try {
      const res = await groupAPI.update(id, data);
      set(state => ({
        groups: state.groups.map(g => g.id === id ? res.data : g),
        currentGroup: state.currentGroup?.id === id ? res.data : state.currentGroup,
      }));
      toast.success('Group updated!');
      return res.data;
    } catch {
      toast.error('Failed to update group');
      return null;
    }
  },

  archiveGroup: async (id) => {
    try {
      await groupAPI.archive(id);
      set(state => ({ groups: state.groups.filter(g => g.id !== id) }));
      toast.success('Group archived');
    } catch {
      toast.error('Failed to archive group');
    }
  },

  inviteMember: async (groupId, email) => {
    try {
      await groupAPI.invite(groupId, { email });
      toast.success(`Invitation sent to ${email}`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
      return false;
    }
  },

  acceptInvite: async (groupId) => {
    try {
      await groupAPI.accept(groupId);
      await get().fetchGroups();
      toast.success('You joined the group!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invite');
      return false;
    }
  },

  removeMember: async (groupId, userId) => {
    try {
      await groupAPI.removeMember(groupId, userId);
      await get().fetchGroup(groupId);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
}));

// =============================================
// EXPENSE STORE
// =============================================
export const useExpenseStore = create((set, get) => ({
  expenses: [],
  balances: [],
  loading: false,

  fetchExpenses: async (groupId) => {
    set({ loading: true });
    try {
      const res = await expenseAPI.getByGroup(groupId);
      set({ expenses: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchBalances: async (groupId) => {
    try {
      const res = await expenseAPI.getBalances(groupId);
      set({ balances: res.data });
    } catch {}
  },

  createExpense: async (data) => {
    try {
      const res = await expenseAPI.create(data);
      set(state => ({ expenses: [res.data, ...state.expenses] }));
      toast.success(`Expense "${res.data.description}" added!`);
      await get().fetchBalances(data.groupId);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
      return null;
    }
  },

  updateExpense: async (id, data) => {
    try {
      const res = await expenseAPI.update(id, data);
      set(state => ({
        expenses: state.expenses.map(e => e.id === id ? res.data : e),
      }));
      toast.success('Expense updated!');
      await get().fetchBalances(data.groupId);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update expense');
      return null;
    }
  },

  deleteExpense: async (id, groupId) => {
    try {
      await expenseAPI.delete(id);
      set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
      toast.success('Expense deleted');
      if (groupId) await get().fetchBalances(groupId);
    } catch {
      toast.error('Failed to delete expense');
    }
  },

  clearExpenses: () => set({ expenses: [], balances: [] }),
}));

// =============================================
// SETTLEMENT STORE
// =============================================
export const useSettlementStore = create((set) => ({
  settlements: [],
  optimizedDebts: [],
  loading: false,

  fetchSettlements: async (groupId) => {
    set({ loading: true });
    try {
      const [sRes, dRes] = await Promise.all([
        settlementAPI.getByGroup(groupId),
        settlementAPI.getOptimized(groupId),
      ]);
      set({ settlements: sRes.data, optimizedDebts: dRes.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  initiatePayment: async (data) => {
    try {
      const res = await settlementAPI.initiatePayment(data);
      set(state => ({ settlements: [res.data, ...state.settlements] }));
      toast.success('Payment marked as sent! Waiting for confirmation.');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      return null;
    }
  },

  confirmPayment: async (settlementId, groupId) => {
    try {
      const res = await settlementAPI.confirmPayment({ settlementId });
      set(state => ({
        settlements: state.settlements.map(s => s.id === settlementId ? res.data : s),
      }));
      toast.success('Payment confirmed! ✅');
      // Refresh optimized debts
      const dRes = await settlementAPI.getOptimized(groupId);
      set({ optimizedDebts: dRes.data });
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm payment');
      return null;
    }
  },

  declinePayment: async (settlementId) => {
    try {
      const res = await settlementAPI.declinePayment(settlementId);
      set(state => ({
        settlements: state.settlements.map(s => s.id === settlementId ? res.data : s),
      }));
      toast.error('Payment declined.');
      return res.data;
    } catch {
      toast.error('Failed to decline payment');
      return null;
    }
  },
}));

// =============================================
// ANALYTICS STORE
// =============================================
export const useAnalyticsStore = create((set) => ({
  monthly: [],
  category: [],
  loading: false,

  fetchAnalytics: async (groupId) => {
    set({ loading: true });
    try {
      const [mRes, cRes] = await Promise.all([
        analyticsAPI.getMonthly(groupId),
        analyticsAPI.getCategory(groupId),
      ]);
      set({ monthly: mRes.data, category: cRes.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

// =============================================
// ACTIVITY STORE
// =============================================
export const useActivityStore = create((set) => ({
  activities: [],
  groupActivities: [],
  loading: false,

  fetchMyActivities: async () => {
    set({ loading: true });
    try {
      const res = await activityAPI.getMy();
      set({ activities: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchGroupActivities: async (groupId) => {
    try {
      const res = await activityAPI.getByGroup(groupId);
      set({ groupActivities: res.data });
    } catch {}
  },
}));

// =============================================
// MESSAGE STORE
// =============================================
export const useMessageStore = create((set) => ({
  messages: [],
  loading: false,

  fetchMessages: async (groupId) => {
    set({ loading: true });
    try {
      const res = await messageAPI.getByGroup(groupId);
      set({ messages: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  sendMessage: async (groupId, content) => {
    try {
      const res = await messageAPI.send({ groupId, content });
      set(state => ({ messages: [...state.messages, res.data] }));
      return res.data;
    } catch {
      toast.error('Failed to send message');
      return null;
    }
  },
}));

// =============================================
// USER SEARCH STORE
// =============================================
export const useUserStore = create((set) => ({
  searchResults: [],
  friends: [],
  searching: false,

  searchUsers: async (query) => {
    if (!query || query.length < 2) {
      set({ searchResults: [] });
      return;
    }
    set({ searching: true });
    try {
      const res = await userAPI.search(query);
      set({ searchResults: res.data, searching: false });
    } catch {
      set({ searching: false });
    }
  },

  fetchFriends: async () => {
    try {
      const res = await userAPI.getFriends();
      set({ friends: res.data });
    } catch {}
  },

  clearSearch: () => set({ searchResults: [] }),
}));
