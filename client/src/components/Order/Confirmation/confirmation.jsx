import React from "react";
import { CheckCircle } from "lucide-react";
import styles from "./confirmation.module.css";
import { useNavigate } from "react-router-dom";

const OrderConfirmation = ({ order }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.confirmationContainer}>
      <div className={styles.card}>
        <CheckCircle className={styles.icon} size={72} />
        <h2>Order Placed Successfully!</h2>
        <p>
          Thank you for shopping with <span>PetVault</span>. Your order has been received and is being processed.
        </p>

        {order && (
          <>
            <p className={styles.orderId}>
              Order ID: <span>#{order._id}</span>
            </p>

            <div className={styles.miniSummary}>
              <div className={styles.summaryRow}>
                <strong>Items:</strong>
                <span>{order.items.length}</span>
              </div>
              <div className={styles.summaryRow}>
                <strong>Total:</strong>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <strong>Payment:</strong>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </>
        )}

        <div className={styles.buttons}>
          <button className={styles.primaryBtn} onClick={() => navigate("/my-orders")}>
            View My Orders
          </button>
          <button className={styles.secondaryBtn} onClick={() => navigate("/products")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
