import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./deleteConfirmationModal.module.css";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemType = "item",
  itemName = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={24} />
          </div>
          <h2>Confirm Deletion</h2>
        </div>

        <div className={styles.modalContent}>
          <p>
            Are you sure you want to delete{" "}
            <span className={styles.itemName}>"{itemName}"</span>?
          </p>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
