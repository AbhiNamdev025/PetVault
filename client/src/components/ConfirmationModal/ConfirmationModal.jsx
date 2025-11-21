import React from "react";
import styles from "./confirmationModal.module.css";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

const ConfirmationModal = ({ config, onConfirm, onCancel }) => {
  const getIcon = () => {
    switch (config.type) {
      case "confirm":
        return <CheckCircle size={24} className={styles.confirmIcon} />;
      case "complete":
        return <Info size={24} className={styles.completeIcon} />;
      case "cancel":
        return <AlertTriangle size={24} className={styles.cancelIcon} />;
      default:
        return <AlertTriangle size={24} className={styles.cancelIcon} />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (config.type) {
      case "confirm":
        return styles.confirmButton;
      case "complete":
        return styles.completeButton;
      case "cancel":
        return styles.dangerButton;
      default:
        return styles.dangerButton;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          {getIcon()}
          <h3>{config.title}</h3>
        </div>
        
        <div className={styles.modalContent}>
          <p>{config.message}</p>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.secondaryButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={getConfirmButtonClass()} onClick={onConfirm}>
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;