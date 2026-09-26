import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
  quantity: number;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => {
        const currentItems = get().items;
        const exists = currentItems.some(
          (item) => item.variantId === newItem.variantId,
        );

        if (exists) {
          return;
        }

        set({ items: [...currentItems, newItem] });
      },
      removeItem: (variantId) => {
        set({
          items: get().items.filter((item) => item.variantId !== variantId),
        });
      },
      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      totalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
      totalPrice: () => {
        return get().items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "luxe-furniture-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
