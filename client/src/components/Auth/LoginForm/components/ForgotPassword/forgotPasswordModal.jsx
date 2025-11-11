import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import styles from "./ForgotPasswordModal.module.css";
import { API_BASE_URL } from "../../../../../utils/constants";
import { toast } from "react-toastify";

const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (e, i) => {
    const value = e.target.value.slice(-1); // cuts last digit
    const updated = [...otp];
    updated[i] = value;
    setOtp(updated);

    if (value && i < otp.length - 1) {
      e.target.parentNode.children[i + 1].focus(); // next
    } else if (!value && i > 0) {
      e.target.parentNode.children[i - 1].focus(); // back
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
        onClose();
      } else toast.error(data.message);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22} />
        </button>
        {/* Forgot pass */}
        {step === "forgot" && (
          <>
            <h2 className={styles.title}>Forgot Password?</h2>
            <p className={styles.subtitle}>
              Enter your registered email to receive an OTP.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
            />
            <button
              className={styles.btn}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}
        {/* OTP */}
        {step === "otp" && (
          <>
            <h2 className={styles.title}>Enter OTP</h2>
            <p className={styles.subtitle}>
              Check your email for a 4-digit code.
            </p>
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
            <button
              className={styles.btn}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
        {/* Reset pass */}
        {step === "reset" && (
          <>
            <h2 className={styles.title}>Reset Password</h2>
            <p className={styles.subtitle}>Enter your new password below.</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className={styles.input}
                  autoComplete="password"
                />
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </form>

            <button
              className={styles.btn}
              onClick={handleResetPassword}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
