import { useState, useEffect } from "react";
import { Modal } from "../../common";
import LoginForm from "../LoginForm/loginForm";
import RegisterForm from "../RegisterForm/registerForm";
import ForgotPasswordModal from "../LoginForm/components/ForgotPassword/forgotPasswordModal";
import VerificationModal from "../VerificationModal/VerificationModal";
import RegistrationSuccessModal from "../RegistrationSuccessModal/RegistrationSuccessModal";
import styles from "./authModal.module.css";

const AuthModal = ({
  isOpen,
  onClose,
  defaultView = "login",
  onAuthSuccess,
  selectedRole,
}) => {
  const [view, setView] = useState(defaultView);
  const [verificationData, setVerificationData] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [initialEmail, setInitialEmail] = useState("");

  useEffect(() => {
    if (isOpen) {
      setView(defaultView);
      setVerificationData(null);
      setRegistrationData(null);
      setInitialEmail("");
    }
  }, [isOpen, defaultView]);

  const getModalTitle = () => {
    switch (view) {
      case "signup":
        return "Create Account";
      case "forgot-password":
        return "Forgot Password";
      case "verification":
        return verificationData?.status === "archived"
          ? "Account Deactivated"
          : verificationData?.status === "rejected"
            ? "Verification Rejected"
            : "Verification Pending";
      case "registration-success":
        return "Status Update";
      case "login":
      default:
        return "Sign In";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      hideContentPadding
      size={view === "signup" ? "lg" : "md"}
      className={styles.authModal}
    >
      {view === "login" && (
        <LoginForm
          showHeader={false}
          onSwitchToSignup={() => setView("signup")}
          onForgotPassword={(email) => {
            setInitialEmail(email);
            setView("forgot-password");
          }}
          onVerificationRequired={(data) => {
            setVerificationData(data);
            setView("verification");
          }}
          onSuccess={() => {
            if (onAuthSuccess) onAuthSuccess();
            onClose();
          }}
          onLoginSuccess={onAuthSuccess}
        />
      )}

      {view === "signup" && (
        <RegisterForm
          showHeader={false}
          onSwitchToLogin={() => setView("login")}
          onRegistrationSuccess={(data) => {
            setRegistrationData(data);
            setView("registration-success");
          }}
          initialRole={selectedRole}
        />
      )}

      {view === "forgot-password" && (
        <ForgotPasswordModal
          onClose={() => setView("login")}
          showHeader={false}
          initialEmail={initialEmail}
        />
      )}

      {view === "verification" && verificationData && (
        <VerificationModal
          isOpen={true}
          onClose={() => setView("login")}
          isInsideModal={true}
          showHeader={false}
          {...verificationData}
        />
      )}

      {view === "registration-success" && registrationData && (
        <RegistrationSuccessModal
          isOpen={true}
          onClose={() => {
            setRegistrationData(null);
            setView("login");
          }}
          isInsideModal={true}
          showHeader={false}
          {...registrationData}
        />
      )}
    </Modal>
  );
};

export default AuthModal;
