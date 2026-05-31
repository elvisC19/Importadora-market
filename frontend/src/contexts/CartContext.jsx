import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      // Ensure the parsed structure matches [{ product: {...}, cantidad: N }]
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          // Backward compatibility / robustness: if stored in old format, normalize it
          if (item && item.id && !item.product) {
            const { quantity, ...product } = item;
            return {
              product,
              cantidad: quantity || 1
            };
          }
          return item;
        }).filter(item => item && item.product && item.product.id);
      }
      return [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  // Sync state with localStorage on any cart modification
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Dispatch standard storage event so other non-context elements (like custom toast) are notified
    window.dispatchEvent(new Event('storage'));
  }, [cart]);

  // Add an item to the cart
  const addItem = (product, quantity) => {
    if (!product || !product.id) return;
    const qtyToAdd = Math.max(1, quantity);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIndex].cantidad + qtyToAdd;
        // Limit quantity to available stock if available
        const maxStock = product.stock != null ? product.stock : Infinity;
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          cantidad: Math.min(newQty, maxStock),
        };
        return newCart;
      } else {
        const maxStock = product.stock != null ? product.stock : Infinity;
        return [...prevCart, { product, cantidad: Math.min(qtyToAdd, maxStock) }];
      }
    });
  };

  // Remove an item from the cart completely
  const removeItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Update quantity of an item in the cart
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock != null ? item.product.stock : Infinity;
          return {
            ...item,
            cantidad: Math.min(quantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Helper selectors
  const cartItemsCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product.is_offer && item.product.offer_price != null
      ? item.product.offer_price
      : item.product.precio;
    return sum + (price * item.cantidad);
  }, 0);

  const value = {
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
