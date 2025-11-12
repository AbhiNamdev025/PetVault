import React, { useEffect, useState } from "react";
import CheckoutForm from "../checkoutForm/checkoutForm";
import OrderConfirmation from "../Confirmation/confirmation";
import { getCart, clearCart } from "../../Cart/cartServices";
import styles from "./checkoutPage.module.css";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [order, setOrder] = useState(null);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getCart(token);
      setCartItems(data || []);
    } catch (e) {
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const gstRate = 0.1;
  const gstAmount = totalPrice * gstRate;
  const finalAmount = totalPrice + gstAmount;

  const handleSuccess = async (orderData) => {
    try {
      const token = localStorage.getItem("token");
      await clearCart(token);
      setCartItems([]);
      setOrder(orderData);
    } catch (error) {
      toast.error("Order placed, but failed to clear cart.");
    }
  };

  if (loadingCart) return <div className={styles.loading}>Loading...</div>;
  if (cartItems.length === 0 && !order)
    return <div className={styles.empty}>Your cart is empty</div>;

  return order ? (
    <OrderConfirmation order={order} />
  ) : (
    <div className={styles.checkoutWrapper}>
      <div className={styles.left}>
        <CheckoutForm
          cartItems={cartItems}
          totalAmount={finalAmount}
          onSuccess={handleSuccess}
        />
      </div>

      <aside className={styles.right}>
        <div className={styles.summaryBox}>
          <h3>Order Summary</h3>
          <div className={styles.row}>
            <span>Subtotal</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className={styles.row}>
            <span>GST (10%)</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <strong>₹{finalAmount.toFixed(2)}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CheckoutPage;
