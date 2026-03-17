import React from "react";
import Modal from "../../common/Modal/Modal";
import styles from "./loginSuccessModal.module.css";
import { Button } from "../../common";
import { PartyPopper } from "lucide-react";
const LoginSuccessModal = ({
  isOpen,
  onClose,
  userName
}) => {
  return <Modal isOpen={isOpen} onClose={onClose} title="Verified Successfully" size="sm" hideContentPadding>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <PartyPopper size={48} className={styles.icon} />
        </div>

        <h2 className={styles.title}>Welcome to PetVault!</h2>

        <div className={styles.content}>
          <p className={styles.welcomeText}>
            Hi <strong>{userName}</strong>, your account has been verified
            successfully!
          </p>
          <p className={styles.message}>
            You can now start using our pet loving community Features.
          </p>
        </div>

        <div className={styles.actions}>
          <Button fullWidth onClick={onClose} variant="primary" size="md">
            Start Exploring
          </Button>
        </div>
      </div>
    </Modal>;
};
export default LoginSuccessModal;
