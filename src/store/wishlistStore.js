import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (productId) => {
        const exists = get().items.includes(productId);
        set({
          items: exists
            ? get().items.filter((id) => id !== productId)
            : [productId, ...get().items],
        });
        return !exists;
      },

      hasItem: (productId) => get().items.includes(productId),

      removeItem: (productId) =>
        set({ items: get().items.filter((id) => id !== productId) }),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'sable-wishlist-storage',
    }
  )
);
