import { create } from 'zustand';
import { WishlistAPI } from '../services/api';

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    const result = await WishlistAPI.getAll();

    if (result.success && result.data) {
      set({ wishlist: result.data, isLoading: false });
    } else {
      set({ wishlist: [], isLoading: false });
    }
  },

  addToWishlist: async (jogoId) => {
    const result = await WishlistAPI.add(jogoId);
    if (result.success) {
      await get().fetchWishlist();
    }
    return result;
  },

  removeFromWishlist: async (jogoId) => {
    const result = await WishlistAPI.remove(jogoId);
    if (result.success) {
      await get().fetchWishlist();
    }
    return result;
  },

  isInWishlist: (jogoId) => {
    const { wishlist } = get();
    return wishlist.some(item => item.fkJogo === jogoId);
  },

  clearWishlist: () => {
    set({ wishlist: [] });
  }
}));
