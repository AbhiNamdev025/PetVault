import React, { createContext, useContext, useState, useEffect } from "react";
import { getCart } from "../components/Cart/cartServices";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to refresh cart data
  const refreshCart = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getCart(token);
      setCartItems(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Don't clear cart on error, might just be network
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();

    // Listen to storage events for token changes
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        refreshCart();
      }
    };

    // Custom event for cart updates
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  const cartCount = cartItems.length; // Or sum of quantities if preferred

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, refreshCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};
