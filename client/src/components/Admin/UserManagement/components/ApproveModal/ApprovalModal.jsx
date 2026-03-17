import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, Modal } from "../../../../common";
import styles from "./approvalModal.module.css";

const ApprovalModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Verification"
      size="sm"
      closeOnEsc={!isLoading}
      footer={
        <div className={styles.footerActions}>
          <Button
            className={styles.actionButton}
            onClick={onClose}
            disabled={isLoading}
            variant="secondary"
            size="md"
          >
            Cancel
          </Button>
          <Button
            className={styles.actionButton}
            onClick={onConfirm}
            disabled={isLoading}
            variant="primary"
            size="md"
            isLoading={isLoading}
            loadingText="Processing..."
          >
            Confirm Approval
          </Button>
        </div>
      }
    >
      <div className={styles.modalBody}>
        <div className={styles.iconWrapper}>
          <CheckCircle2 size={36} />
        </div>

        <h3 className={styles.title}>Confirm Approval</h3>

        <p className={styles.message}>
          Are you sure you want to approve <strong>{userName}</strong>? This
          will grant them full access to the platform as a provider.
        </p>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
