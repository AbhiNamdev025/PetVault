import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, PawPrint } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../utils/constants";
import { emitAuthStateChanged } from "../../../utils/authState";
import styles from "./loginForm.module.css";
import { Button, Input } from "../../common";
const LoginForm = ({
  onSwitchToSignup,
  onSuccess,
  onLoginSuccess,
  onForgotPassword,
  onVerificationRequired,
  showHeader = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        const userData = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
        };
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("user", JSON.stringify(userData));
        if (rememberMe) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        emitAuthStateChanged({
          status: "logged_in",
          source: "login_form",
        });
        toast.success("Login successful!");
        if (onLoginSuccess) onLoginSuccess();
        let targetPath = "/profile";
        let state = {};
        if (data.role === "admin") {
          targetPath = "/admin";
        } else if (data.role !== "user") {
          state = {
            activeTab: "dashboard",
          };
        }
        if (onSuccess) {
          onSuccess(); // Close modal logic
        }

        const from = location.state?.from;

        if (from && from !== location.pathname) {
          navigate(from, { replace: true });
        } else {
          navigate(targetPath, {
            state,
            replace: true,
          });
        }
      } else {
        if (response.status === 403) {
          if (
            data.status === "pending" ||
            data.status === "rejected" ||
            data.status === "archived"
          ) {
            if (onVerificationRequired) {
              onVerificationRequired({
                status: data.status,
                message: data.message,
                userId: data.userId,
                token: data.token,
              });
            }
            return;
          }
        }
        const errorMsg = data.message || "Invalid email or password";
        // Show inline under the password field (most relevant for "invalid credentials")
        setErrors({ password: errorMsg });
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };
  return (
    <div className={styles.loginForm}>
      {showHeader && (
        <div className={styles.formHeader}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <Input
            label="Email Address"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            required
            fullWidth
            icon={<Mail size={20} />}
            error={errors.email}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            fullWidth
            icon={<Lock size={20} />}
            error={errors.password}
            rightElement={
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                variant="primary"
                size="md"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </Button>
            }
          />
        </div>

        <div className={styles.formOptions}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Remember me</span>
          </label>
          <Button
            type="button"
            className={styles.forgotLink}
            onClick={() => onForgotPassword(formData.email)}
            variant="ghost"
            size="sm"
            usePresetStyle={false}
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className={styles.submitButton}
          variant="primary"
          size="md"
        >
          Sign In
        </Button>
      </form>

      <div className={styles.divider}>
        <span>Or continue with</span>
      </div>

      <div className={styles.socialLogin}>
        <Button
          type="button"
          className={styles.socialButton}
          onClick={handleGoogleLogin}
          variant="primary"
          size="md"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className={styles.socialIcon}
          />
          Google
        </Button>
      </div>

      <div className={styles.signupLink}>
        Don't have an account?{" "}
        <Button
          type="button"
          className={styles.link}
          onClick={onSwitchToSignup}
          variant="ghost"
          size="sm"
          usePresetStyle={false}
        >
          Sign up
        </Button>
      </div>
    </div>
  );
};
export default LoginForm;
