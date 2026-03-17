import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import styles from "./deletionReasonModal.module.css";
import { Button, Modal, Textarea } from "../../common";
const DeletionReasonModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemType,
  itemName
}) => {
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  if (!isOpen) return null;
  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError("Deletion reason must be at least 10 characters");
      return;
    }
    setIsDeleting(true);
    setError("");
    try {
      await onConfirm(reason.trim());
      setReason("");
    } catch (err) {
      setError(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };
  const handleClose = () => {
    if (!isDeleting) {
      setReason("");
      setError("");
      onClose();
    }
  };
  return <Modal isOpen={isOpen} onClose={handleClose} showCloseButton={false} closeOnClickOutside={false} closeOnEsc={!isDeleting} hideContentPadding size="sm" backdropClassName={styles.overlay} className={styles.modal}>
      <>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={24} />
          </div>
          <h2>Delete {itemType}</h2>
          <Button className={styles.closeBtn} onClick={handleClose} disabled={isDeleting} variant="ghost" size="sm">
            <X size={20} />
          </Button>
        </div>

        <div className={styles.content}>
          <p className={styles.itemName}>
            <strong>{itemName}</strong>
          </p>
          <p className={styles.warning}>
            This action cannot be undone. The owner will be notified via email.
          </p>

          <div className={styles.formGroup}>
            <Textarea
              label="Deletion Reason"
              required
              className={styles.reasonTextarea}
              placeholder="Please provide a detailed reason for deleting this listing (minimum 10 characters)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              disabled={isDeleting}
              rows={4}
              fullWidth
            />
            <div className={styles.charCount}>
              {reason.length} / 10 minimum characters
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" size="sm" className={styles.cancelBtn} onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" className={styles.deleteBtn} onClick={handleSubmit} disabled={isDeleting || reason.trim().length < 10}>
            {isDeleting ? "Deleting..." : "Delete & Notify Owner"}
          </Button>
        </div>
      </>
    </Modal>;
};
export default DeletionReasonModal;
