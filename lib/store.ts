import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  key: string;
  quantity: number;
  total: string;
  subtotal: string;
  product: {
    node: {
      id: string;
      databaseId: number;
      name: string;
      slug: string;
      image: {
        sourceUrl: string;
        altText: string;
      };
      price: string;
    };
  };
  variation?: {
    node: {
      id: string;
      databaseId: number;
      name: string;
      price: string;
    };
  };
}

interface CartState {
  items: CartItem[];
  subtotal: string;
  total: string;
  isEmpty: boolean;
  sessionToken: string | null;
  setSessionToken: (token: string | null) => void;
  setCart: (cart: {
    contents: { nodes: CartItem[] };
    subtotal: string;
    total: string;
    isEmpty: boolean;
  }) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      subtotal: '0',
      total: '0',
      isEmpty: true,
      sessionToken: null,
      setSessionToken: (token) => set({ sessionToken: token }),
      setCart: (cart) =>
        set({
          items: cart.contents.nodes,
          subtotal: cart.subtotal,
          total: cart.total,
          isEmpty: cart.isEmpty,
        }),
      clearCart: () =>
        set({
          items: [],
          subtotal: '0',
          total: '0',
          isEmpty: true,
          sessionToken: null, // Clear session token to start fresh
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
