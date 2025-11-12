import React from "react";
import styles from "./statusPopup.module.css";

const StatusPopup = ({ isOpen, onClose, onConfirm, status }) => {
  if (!isOpen) return null;

  const statusText =
    status === "confirmed"
      ? "Confirm this order?"
      : status === "delivered"
      ? "Mark this order as delivered?"
      : "Cancel this order?";

  const confirmText =
    status === "confirmed"
      ? "Confirm Order"
      : status === "delivered"
      ? "Mark Delivered"
      : "Cancel Order";

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupBox}>
        <h3>{statusText}</h3>
        <p>
          Are you sure you want to{" "}
          <strong>{status === "cancelled" ? "cancel" : "update"}</strong> this
          order? This action cannot be undone.
        </p>

        <div className={styles.popupActions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            No, Go Back
          </button>
          <button
            className={`${styles.confirmBtn} ${styles[status]}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusPopup;
