import { create } from 'zustand';
import { CartAPI } from '../services/api';

export const useCartStore = create((set, get) => ({
  cart: null,
  cartCount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    const result = await CartAPI.getAll();

    if (result.success && result.data?.carrinhosComItens) {
      const carrinhosAtivos = result.data.carrinhosComItens.filter(c => c.status === 'A');
      const cart = carrinhosAtivos.length > 0 ? carrinhosAtivos[0] : null;
      const cartCount = cart?.itens?.length || 0;

      set({ cart, cartCount, isLoading: false });
    } else {
      set({ cart: null, cartCount: 0, isLoading: false });
    }
  },

  addToCart: async (jogoId) => {
    const result = await CartAPI.add(jogoId);
    if (result.success) {
      await get().fetchCart();
    }
    return result;
  },

  removeFromCart: async (gameId) => {
    const result = await CartAPI.remove(gameId);
    if (result.success) {
      await get().fetchCart();
    }
    return result;
  },

  clearCart: () => {
    set({ cart: null, cartCount: 0 });
  }
}));
