import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            // Normalization: if stored in old format (i.e. with .product and .cantidad), convert to new format
            if (item && item.product && item.product.id && item.cantidad !== undefined) {
              return {
                ...item.product,
                quantity: item.cantidad
              };
            }
            return item;
          }).filter(item => item && item.id);
        }
      }
      // Fallback to old 'cart' key for backward compatibility on first load
      const oldSaved = localStorage.getItem('cart');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            if (item && item.product && item.product.id) {
              return {
                ...item.product,
                quantity: item.cantidad || 1
              };
            } else if (item && item.id) {
              return {
                ...item,
                quantity: item.quantity || 1
              };
            }
            return null;
          }).filter(item => item && item.id);
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  // Sync state with localStorage on any cart modification immediately
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
    // Dispatch standard storage event so other non-context elements (like custom toast) are notified
    window.dispatchEvent(new Event('storage'));
  }, [items]);

  // Add an item to the cart (optimistic local state update first)
  const addItem = (product, quantity = 1) => {
    if (!product || !product.id) return;

    // Actualizar estado local INMEDIATAMENTE
    setItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id)
      if (existing) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevItems, { ...product, quantity }]
    })
    // Mostrar feedback visual inmediato (toast o badge)
  };

  // Remove an item from the cart completely (optimistic local state update first)
  const removeItem = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
  };

  // Update quantity of an item in the cart (optimistic local state update first)
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  };

  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Compatibility layers for components expecting the old cart structure:
  // Convert `items` (which are `{ ...product, quantity }`) back to `cart` format `[{ product, cantidad }]`
  const cart = items.map(item => {
    const { quantity, ...product } = item;
    return {
      product,
      cantidad: quantity
    };
  });

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = items.reduce((sum, item) => {
    const price = item.is_offer && item.offer_price != null
      ? item.offer_price
      : item.precio;
    return sum + (price * item.quantity);
  }, 0);

  const value = {
    items,
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartItemsCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

