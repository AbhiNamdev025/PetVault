import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./loginRequiredModal.module.css";
import { Modal, Button } from "..";
import { openAuthModal } from "../../../utils/authModalNavigation";

const LoginRequiredModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    onClose?.();
    openAuthModal(navigate, {
      location,
      view: "login",
      from: location.pathname,
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Login Required"
      size="sm"
      hideContentPadding
    >
      <div className={styles.modalContent}>
        <p>Please log in to continue accessing this feature.</p>

        <div className={styles.actions}>
          <Button variant="primary" onClick={handleLogin} size="md">
            Login
          </Button>
          <Button variant="outline" onClick={onClose} size="md">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal;
