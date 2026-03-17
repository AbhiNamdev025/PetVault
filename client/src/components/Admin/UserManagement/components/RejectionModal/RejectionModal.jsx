import React, { useState } from "react";
import { Button, Modal, Textarea } from "../../../../common";
import styles from "./rejectionModal.module.css";

const RejectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading,
}) => {
  const [remark, setRemark] = useState("");

  const handleClose = () => {
    setRemark("");
    onClose?.();
  };

  const handleSubmit = () => {
    if (!remark.trim()) return;
    onConfirm(remark.trim());
    setRemark("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Verification"
      size="sm"
      closeOnEsc={!isLoading}
      footer={
        <div className={styles.footerActions}>
          <Button
            className={styles.actionButton}
            onClick={handleClose}
            disabled={isLoading}
            variant="secondary"
            size="md"
          >
            Cancel
          </Button>
          <Button
            className={styles.actionButton}
            onClick={handleSubmit}
            disabled={!remark.trim() || isLoading}
            variant="primary"
            size="md"
            isLoading={isLoading}
            loadingText="Processing..."
          >
            Confirm Rejection
          </Button>
        </div>
      }
    >
      <div className={styles.modalBody}>
        <p className={styles.description}>
          Please provide a reason for rejecting <strong>{userName}</strong>'s
          verification request. This will be shared with the user.
        </p>

        <Textarea
          placeholder="Enter rejection reason..."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          autoFocus
          disabled={isLoading}
          rows={4}
          maxLength={200}
          fullWidth
          className={styles.reasonField}
        />
      </div>
    </Modal>
  );
};

export default RejectionModal;
