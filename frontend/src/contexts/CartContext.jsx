import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { cartAPI, productAPI } from '../services/API';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    try {
      const cart = await cartAPI.getCart();
      const rows = await Promise.all(
        (cart || []).map(async (entry) => {
          const product = await productAPI.getProductById(entry.productId);
          return { ...entry, product };
        })
      );
      setItems(rows.filter((row) => row.product));
    } catch (err) {
      console.error("Erreur chargement panier", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) throw new Error("Vous devez être connecté.");
    await cartAPI.addToCart({ productId, quantity });
    await loadCart();
    setIsCartOpen(true);
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await cartAPI.removeCartItem(productId);
    } else {
      await cartAPI.updateCartItem(productId, { quantity });
    }
    await loadCart();
  };

  const removeItem = async (productId) => {
    await cartAPI.removeCartItem(productId);
    await loadCart();
  };

  const clearCart = async () => {
    await cartAPI.clearCart();
    await loadCart();
  };

  const cartCount = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [items]);

  const cartTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const p = item.product;
      const unitPrice = (p?.promotionalPrice && Number(p.promotionalPrice) > 0) ? Number(p.promotionalPrice) : Number(p?.price || 0);
      return acc + (unitPrice * Number(item.quantity || 0));
    }, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      cartCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider.');
  }
  return context;
}
