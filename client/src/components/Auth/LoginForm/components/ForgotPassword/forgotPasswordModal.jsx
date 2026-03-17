import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import styles from "./forgotPasswordModal.module.css";
import { API_BASE_URL } from "../../../../../utils/constants";
import toast from "react-hot-toast";
import { Button, Input } from "../../../../../components/common";

const ForgotPasswordModal = ({
  onClose,
  showHeader = true,
  initialEmail = "",
}) => {
  const [step, setStep] = useState("forgot");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (e, i) => {
    const value = e.target.value.slice(-1);
    const updated = [...otp];
    updated[i] = value;
    setOtp(updated);

    if (value && i < otp.length - 1) {
      e.target.parentNode.children[i + 1].focus();
    } else if (!value && i > 0) {
      e.target.parentNode.children[i - 1].focus();
    }
  };

  const handleSendOtp = async () => {
    if (!email) return toast.error("Enter your email first");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent to your email");
        setStep("otp");
      } else toast.error(data.message);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 4) return toast.error("Enter 4-digit OTP");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP verified");
        setStep("reset");
      } else toast.error(data.message);
    } catch {
      toast.error("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6)
      return toast.error("Password must be 6+ chars");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successful");
        onClose(); // Go back to login
      } else toast.error(data.message);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalContent}>
      {step === "forgot" && (
        <>
          {showHeader && (
            <>
              <h2 className={styles.title}>Forgot Password?</h2>
              <p className={styles.subtitle}>
                Enter your registered email to receive an OTP.
              </p>
            </>
          )}

          <div className={styles.formGroup}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              fullWidth
              icon={<Mail size={20} />}
            />
          </div>

          <Button
            fullWidth
            onClick={handleSendOtp}
            isLoading={loading}
            loadingText="Sending..."
            variant="primary"
            size="md"
          >
            Send OTP
          </Button>

          <div className={styles.backLink}>
            Remember your password?
            <Button
              className={styles.link}
              onClick={onClose}
              variant="ghost"
              size="sm"
              usePresetStyle={false}
            >
              Log In
            </Button>
          </div>
        </>
      )}

      {step === "otp" && (
        <>
          {showHeader && (
            <>
              <h2 className={styles.title}>Enter OTP</h2>
              <p className={styles.subtitle}>
                Check your email for a 4-digit code.
              </p>
            </>
          )}
          <div className={styles.otpBox}>
            {otp.map((v, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                value={v}
                onChange={(e) => handleOtpChange(e, i)}
                className={styles.otpInput}
              />
            ))}
          </div>

          <Button
            fullWidth
            onClick={handleVerifyOtp}
            isLoading={loading}
            loadingText="Verifying..."
            variant="primary"
            size="md"
          >
            Verify OTP
          </Button>

          <div className={styles.backLink}>
            <Button
              className={styles.link}
              onClick={() => setStep("forgot")}
              variant="ghost"
              size="sm"
              usePresetStyle={false}
            >
              Resend / Change Email
            </Button>
          </div>
        </>
      )}

      {step === "reset" && (
        <>
          {showHeader && (
            <>
              <h2 className={styles.title}>Reset Password</h2>
              <p className={styles.subtitle}>Enter your new password below.</p>
            </>
          )}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className={styles.formGroup}>
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                fullWidth
                icon={<Lock size={20} />}
                autoComplete="new-password"
                rightElement={
                  <Button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="primary"
                    size="md"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                }
              />
            </div>
          </form>

          <Button
            fullWidth
            onClick={handleResetPassword}
            isLoading={loading}
            loadingText="Saving..."
            variant="primary"
            size="md"
          >
            Save Password
          </Button>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordModal;
