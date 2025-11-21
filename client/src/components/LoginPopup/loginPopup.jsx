import React from "react";
import styles from "./loginPopup.module.css";

const LoginPopup = ({ onClose, onLogin }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.formHeader}>
          <h2 className={styles.title}>Login Required</h2>
          <p className={styles.subtitle}>
            Please login to book an appointment with the doctor
          </p>
        </div>

        <div className={styles.loginContent}>
          <p className={styles.loginMessage}>
            You need to be logged in to schedule an appointment. This helps us
            provide you with the best pet care experience.
          </p>

          <div className={styles.buttonGroup}>
            <button className={styles.loginButton} onClick={onLogin}>
              Login Now
            </button>
            <button className={styles.cancelButton} onClick={onClose}>
              Maybe Later
            </button>
          </div>

          <div className={styles.features}>
            <h4>Benefits of logging in:</h4>
            <ul>
              <li>✓ Book and manage appointments</li>
              <li>✓ Secure and personalized experience</li>
              <li>✓ Faster booking process</li>
              <li>✓ Access to exclusive features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
