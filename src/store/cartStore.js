import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const makeKey = (productId, color, size) => `${productId}__${color}__${size}`;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      promo: null,

      addItem: (item) => {
        const key = makeKey(item.productId, item.color, item.size);
        const existing = get().items.find((i) => i.key === key);
        const maxStock = Number(item.maxStock || 99);

        if (existing) {
          const nextQty = Math.min(maxStock, existing.quantity + (item.quantity || 1));
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: nextQty, maxStock } : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                key,
                productId: item.productId,
                slug: item.slug,
                name: item.name,
                price: Number(item.price),
                color: item.color,
                size: item.size,
                quantity: Math.min(maxStock, Math.max(1, item.quantity || 1)),
                maxStock,
                image: item.image,
              },
            ],
          });
        }
      },

      updateQuantity: (key, quantity) => {
        const qty = Number(quantity);
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity: Math.min(i.maxStock || 99, qty) } : i
          ),
        });
      },

      removeItem: (key) => {
        const removed = get().items.find((i) => i.key === key);
        set({ items: get().items.filter((i) => i.key !== key) });
        return removed;
      },

      restoreItem: (item, index = 0) => {
        if (!item) return;
        const exists = get().items.some((i) => i.key === item.key);
        if (exists) return;
        const next = [...get().items];
        next.splice(Math.min(index, next.length), 0, item);
        set({ items: next });
      },

      applyPromo: (promo) => set({ promo }),
      removePromo: () => set({ promo: null }),
      clearCart: () => set({ items: [], promo: null }),
    }),
    {
      name: 'sable-cart-storage',
    }
  )
);
