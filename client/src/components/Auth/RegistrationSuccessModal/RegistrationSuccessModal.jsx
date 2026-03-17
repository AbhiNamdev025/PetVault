import React from "react";
import { CheckCircle, Mail } from "lucide-react";
import Modal from "../../common/Modal/Modal";
import styles from "./registrationSuccessModal.module.css";
import { Button } from "../../common";
const RegistrationSuccessModal = ({
  isOpen,
  onClose,
  email,
  role,
  isInsideModal = false,
  showHeader = true,
}) => {
  const content = (
    <div className={styles.modalContent}>
      <div className={styles.iconWrapper}>
        <CheckCircle className={styles.successIcon} />
      </div>

      {showHeader && <h2 className={styles.title}>Application Received!</h2>}

      <div className={styles.message}>
        <p>
          Your request to join as a{" "}
          <strong>
            {role === "ngo"
              ? "NGO"
              : role?.charAt(0).toUpperCase() + role?.slice(1)}
          </strong>{" "}
          is now being processed.
        </p>

        <p>Confirmation sent to:</p>
        <span className={styles.emailHighlight}>{email}</span>
      </div>

      <div className={styles.infoBox}>
        <p>
          Status: <strong>Verification Pending</strong>
          <br />
          Our team will review your application. You will be notified via email
          within 24-48 hours.
        </p>
      </div>

      <p className={styles.supportText}>
        Need help? Reach out to{" "}
        <a href="mailto:support@petvault.com" className={styles.supportLink}>
          support@petvault.com
        </a>
      </p>

      <div className={styles.actions}>
        <Button
          fullWidth
          onClick={onClose}
          variant="primary"
          className={styles.btnGradient}
          size="md"
        >
          I'll wait for the email
        </Button>
      </div>
    </div>
  );
  if (isInsideModal) return content;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Status Update"
      size="md"
      hideContentPadding
    >
      {content}
    </Modal>
  );
};
export default RegistrationSuccessModal;
