import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./deleteConfirmationModal.module.css";
import { Button, Modal } from "../../common";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemType = "item",
  itemName = "",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      size="sm"
      footer={
        <div className={styles.footerActions}>
          <Button
            variant="secondary"
            size="sm"
            className={styles.actionButton}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className={styles.actionButton}
            onClick={onConfirm}
          >
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </Button>
        </div>
      }
    >
      <div className={styles.modalBody}>
        <div className={styles.iconBadge}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <p className={styles.message}>
          Are you sure you want to delete{" "}
          <span className={styles.itemName}>"{itemName}"</span>?
        </p>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
