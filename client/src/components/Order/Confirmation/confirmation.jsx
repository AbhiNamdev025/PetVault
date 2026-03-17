import React from "react";
import { CheckCircle } from "lucide-react";
import styles from "./confirmation.module.css";
import { useNavigate } from "react-router-dom";
import { Button } from "../../common";
const OrderConfirmation = ({ order }) => {
  const navigate = useNavigate();
  return (
    <div className={styles.confirmationContainer}>
      <div className={styles.card}>
        <CheckCircle className={styles.icon} size={72} />
        <h2>Order Placed Successfully!</h2>
        <p>
          Thank you for shopping with <span>PetVault</span>. Your order has been
          received and is being processed.
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
              {order.coinsValue > 0 && (
                <div className={styles.summaryRow}>
                  <strong>Coins Discount:</strong>
                  <span>-₹{order.coinsValue.toFixed(2)}</span>
                </div>
              )}
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
          <Button
            className={styles.primaryBtn}
            onClick={() => navigate("/my-orders")}
            variant="primary"
            size="md"
          >
            View My Orders
          </Button>
          <Button
            className={styles.secondaryBtn}
            onClick={() => navigate("/pet-products")}
            variant="secondary"
            size="md"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};
export default OrderConfirmation;
