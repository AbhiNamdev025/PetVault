import { API_BASE_URL } from "../../utils/constants";

const CART_API = `${API_BASE_URL}/cart`;

export const getCart = async (token) => {
  const res = await fetch(CART_API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch cart");
  const data = await res.json();
  return data.cartItems || [];
};

export const updateCartItem = async (id, quantity, token) => {
  const res = await fetch(`${CART_API}/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
};

export const removeCartItem = async (id, token) => {
  const res = await fetch(`${CART_API}/remove/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to remove item");
  return res.json();
};

export const clearCart = async (token) => {
  const res = await fetch(`${CART_API}/clear`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to clear cart");
  return res.json();
};
