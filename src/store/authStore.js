import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      login: async (credentials) => {
        set({ loading: true });
        try {
          const res = await authApi.login(credentials);
          set({ user: res.data.user, token: res.data.token, loading: false });
          return res.data.user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const res = await authApi.register(payload);
          set({ user: res.data.user, token: res.data.token, loading: false });
          return res.data.user;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, token: null });
      },

      updateUserProfile: async (updates) => {
        const currentUser = get().user;
        if (!currentUser) return null;
        set({ loading: true });
        try {
          const res = await authApi.updateProfile(currentUser.id, updates);
          set({ user: res.data, loading: false });
          return res.data;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'sable-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
