import Modal from "../common/Modal/Modal";
import Button from "../common/Button/Button";
import styles from "./loginPopup.module.css";

const LoginPopup = ({ onClose, onLogin }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Login Required" size="sm">
      <div className={styles.loginContent}>
        <p className={styles.loginMessage}>
          Please login to book an appointment with the doctor. This helps us
          provide you with the best pet care experience.
        </p>

        <div className={styles.buttonGroup}>
          <Button variant="primary" onClick={onLogin} fullWidth>
            Login Now
          </Button>
          <Button variant="secondary" onClick={onClose} fullWidth>
            Maybe Later
          </Button>
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
    </Modal>
  );
};

export default LoginPopup;
