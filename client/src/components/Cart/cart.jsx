import React, { useEffect, useState } from "react";
import {
  getCart,
  removeCartItem,
  updateCartItem,
  clearCart,
} from "./cartServices";
import CartItem from "./CartItems/cartItem";
import EmptyCart from "./EmptyCart/emptyCart";
import styles from "./cart.module.css";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const data = await getCart(token);
      setCartItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    await removeCartItem(id, token);
    fetchCart();
  };

  const handleUpdate = async (id, quantity) => {
    if (quantity < 1) return;
    await updateCartItem(id, quantity, token);
    fetchCart();
  };

  const handleClear = async () => {
    await clearCart(token);
    fetchCart();
  };

  const handleContinueShopping = () => {
    navigate("/pet-products");
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading)
    return <div className={styles.loading}>Loading your cart...</div>;

  if (cartItems.length === 0) return <EmptyCart />;

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gstRate = 0.10; // 18% GST
  const gstAmount = totalPrice * gstRate;
  const finalAmount = totalPrice + gstAmount;

  return (
    <section className={styles.cartSection}>
      <h1 className={styles.title}>Your Shopping Cart</h1>

      <div className={styles.cartContainer}>
        <div className={styles.itemsContainer}>
          {cartItems.map((item) => (
            <CartItem
              key={item._id}
              item={item}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryBox}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.free}>Free</span>
            </div>
            <div className={styles.summaryRow}>
              <span>GST (10%)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total (Incl. GST)</span>
              <span>₹{finalAmount.toFixed(2)}</span>
            </div>

            <div className={styles.summaryActions}>
              <button className={styles.checkoutBtn}>
                Proceed to Checkout
              </button>
              <button onClick={handleClear} className={styles.clearBtn}>
                Clear Cart
              </button>

              <button
                onClick={handleContinueShopping}
                className={styles.continueBtn}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
