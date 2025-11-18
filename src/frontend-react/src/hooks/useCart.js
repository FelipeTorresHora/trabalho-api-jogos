import { useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';

export function useCart() {
  const { cart, cartCount, isLoading, fetchCart, addToCart, removeFromCart, clearCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    items: cart?.itens || [],
    cartCount,
    isLoading,
    fetchCart,
    addToCart,
    removeFromCart,
    removeItem: removeFromCart,
    refreshCart: fetchCart,
    clearCart
  };
}
