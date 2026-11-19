import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      currency: 'USD',
      language: 'en',
      mobileMenuOpen: false,
      miniCartOpen: false,
      bagBumpKey: 0,

      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      setMiniCartOpen: (open) => set({ miniCartOpen: open }),
      triggerBagBump: () => set((state) => ({ bagBumpKey: state.bagBumpKey + 1 })),
    }),
    {
      name: 'sable-ui-storage',
      partialize: (state) => ({
        currency: state.currency,
        language: state.language,
      }),
    }
  )
);
