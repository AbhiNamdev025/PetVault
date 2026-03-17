import React from "react";
import Modal from "../../../../../common/Modal/Modal";
import { Button } from "../../../../../common";
import styles from "../../appointments.module.css";

const CancelReasonModal = ({
  isOpen,
  onClose,
  isStatusUpdating,
  cancelReason,
  setCancelReason,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (isStatusUpdating) return;
        onClose();
      }}
      title="Cancel Appointment"
      size="md"
      footerClassName={styles.cancelReasonActions}
      footer={
        <>
          <Button
            className={styles.cancelReasonKeepBtn}
            onClick={onClose}
            disabled={isStatusUpdating}
            variant="ghost"
            size="md"
          >
            Keep Appointment
          </Button>
          <Button
            className={styles.cancelReasonSubmitBtn}
            onClick={onSubmit}
            disabled={isStatusUpdating || cancelReason.trim().length < 10}
            variant="ghost"
            size="md"
          >
            {isStatusUpdating ? "Cancelling..." : "Cancel Now"}
          </Button>
        </>
      }
    >
      <div className={styles.cancelReasonWrap}>
        <p className={styles.cancelReasonHint}>
          Please provide a proper reason for cancellation. This reason will be
          visible to the other party.
        </p>
        <textarea
          className={styles.cancelReasonInput}
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Example: Pet is not stable for travel and needs rest for 2 days."
          maxLength={500}
          disabled={isStatusUpdating}
        />
        <div className={styles.cancelReasonMeta}>
          {cancelReason.length}/500 (min 10)
        </div>
      </div>
    </Modal>
  );
};

export default CancelReasonModal;
