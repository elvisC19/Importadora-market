import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 5. Al inicializar el carrito carga desde localStorage primero
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items') || localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(item => {
            // Normalización: si viene en formato estructurado viejo [{ product, cantidad }], convertir a [{ ...product, quantity }]
            if (item && item.product && item.product.id && item.cantidad !== undefined) {
              return {
                ...item.product,
                quantity: item.cantidad
              };
            }
            // Formato directo [{ ...product, quantity }]
            if (item && item.id) {
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

  // 4. Persiste en localStorage inmediatamente cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
    // Escribir también a la clave antigua 'cart' para mantener compatibilidad absoluta con ProductCard, HomePage, etc.
    localStorage.setItem('cart', JSON.stringify(items));
    // Propagar evento standard para notificar a otras vistas o toasts
    window.dispatchEvent(new Event('storage'));
  }, [items]);

  // Escuchar cambios de localStorage en tiempo real para sincronizar clics externos en 'Add to cart'
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('cart_items') || localStorage.getItem('cart');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const normalized = parsed.map(item => {
              if (item && item.product && item.product.id && item.cantidad !== undefined) {
                return {
                  ...item.product,
                  quantity: item.cantidad
                };
              }
              if (item && item.id) {
                return {
                  ...item,
                  quantity: item.quantity || 1
                };
              }
              return null;
            }).filter(item => item && item.id);

            setItems(prevItems => {
              // Evitar ciclos de re-renderizado infinitos comparando valores id/quantity
              const isIdentical = prevItems.length === normalized.length && 
                prevItems.every((item, idx) => 
                  item.id === normalized[idx].id && 
                  item.quantity === normalized[idx].quantity
                );
              if (isIdentical) {
                return prevItems;
              }
              return normalized;
            });
          }
        }
      } catch (error) {
        console.error('Failed to sync cart on storage event:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 1. En la función addItem actualiza el estado local primero y luego sincroniza
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

  // 2. En la función removeItem igual, actualiza primero
  const removeItem = (productId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
  };

  // 3. En la función updateQuantity actualiza primero
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

  // Vaciar el carrito
  const clearCart = () => {
    setItems([]);
  };

  // Capas de compatibilidad para componentes de páginas existentes (CartPage, CheckoutPage, etc.)
  // Convierte los items [{ ...product, quantity }] de vuelta al formato estructurado viejo [{ product, cantidad }]
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

