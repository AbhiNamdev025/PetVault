import React, { useState } from "react";
import styles from "./confirmationModal.module.css";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button, Modal } from "../common";

const ConfirmationModal = ({ config, onConfirm, onCancel, isLoading }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  if (!config) return null;

  const getIcon = () => {
    switch (config.type) {
      case "confirm":
        return <CheckCircle size={32} className={styles.confirmIcon} />;
      case "complete":
        return <Info size={32} className={styles.completeIcon} />;
      case "cancel":
        return <AlertTriangle size={32} className={styles.cancelIcon} />;
      default:
        return <AlertTriangle size={32} className={styles.cancelIcon} />;
    }
  };

  const getToneClass = () => {
    switch (config.type) {
      case "confirm":
        return styles.confirmTone;
      case "complete":
        return styles.completeTone;
      case "cancel":
        return styles.cancelTone;
      default:
        return styles.cancelTone;
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

  const handleConfirm = () => {
    if (config.showInput) {
      if (config.inputValidator) {
        const validationError = config.inputValidator(inputValue);
        if (validationError) {
          setError(validationError);
          return;
        }
      } else if (config.required && !inputValue.trim()) {
        setError("This field is required");
        return;
      }
    }

    // Pass inputValue if input is shown
    onConfirm(config.showInput ? inputValue : undefined);
  };

  return (
    <Modal
      isOpen={Boolean(config)}
      onClose={onCancel}
      showCloseButton={false}
      closeOnClickOutside={false}
      closeOnEsc={!isLoading}
      hideContentPadding
      size="sm"
      backdropClassName={styles.modalOverlay}
      className={styles.modal}
      footerClassName={styles.modalFooter}
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            className={styles.secondaryButton}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            size="sm"
            className={getConfirmButtonClass()}
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {config.confirmText || "Confirm"}
          </Button>
        </>
      }
    >
      <>
        <div className={styles.modalContent}>
          <div className={`${styles.iconBadge} ${getToneClass()}`}>
            {getIcon()}
          </div>

          <div className={styles.modalHeader}>
            <h3>{config.title}</h3>
            {config.message && <p>{config.message}</p>}
          </div>

          {config.showInput && (
            <div className={styles.inputContainer}>
              <textarea
                className={styles.reasonInput}
                placeholder={config.inputPlaceholder || "Enter reason..."}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (error) setError("");
                }}
                rows={4}
              />
              {error && <span className={styles.errorText}>{error}</span>}
            </div>
          )}
        </div>
      </>
    </Modal>
  );
};

export default ConfirmationModal;
