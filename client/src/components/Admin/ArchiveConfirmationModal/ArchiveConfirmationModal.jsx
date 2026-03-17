import React from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./archiveConfirmationModal.module.css";
import { Button, Modal } from "../../common";

const ArchiveConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemType = "item",
  itemName = "",
  isArchived = false, // To toggle text (Archive vs Unarchive)
  isLoading = false,
}) => {
  const action = isArchived ? "Unarchive" : "Archive";
  const actionLower = action.toLowerCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      closeOnClickOutside={false}
      closeOnEsc={!isLoading}
      hideContentPadding
      size="sm"
      backdropClassName={styles.modalOverlay}
      className={styles.modal}
    >
      <>
        <div className={styles.modalHeader}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={24} />
          </div>
          <h2>Confirm {action}</h2>
        </div>

        <div className={styles.modalContent}>
          <p>
            Are you sure you want to {actionLower}{" "}
            <span className={styles.itemName}>"{itemName}"</span>?
          </p>
          <p className={styles.warningText}>
            {isArchived
              ? "This will restore the user's access."
              : "This will deactivate the user's account and prevent them from logging in."}
          </p>
        </div>

        <div className={styles.modalActions}>
          <Button
            variant="secondary"
            size="sm"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {`${action} ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`}
          </Button>
        </div>
      </>
    </Modal>
  );
};

export default ArchiveConfirmationModal;
