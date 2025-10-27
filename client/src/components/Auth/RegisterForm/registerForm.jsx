import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, PawPrint } from "lucide-react";
import { toast } from "react-toastify";
import styles from "./registerForm.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(data.message || "Registration failed!");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.registerForm}>
      <div className={styles.formHeader}>
        <div className={styles.logo}>
          <PawPrint className={styles.logoIcon} />
          <span>PetVault</span>
        </div>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Join our pet loving community</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Full Name
          </label>
          <div className={styles.inputWrapper}>
            <User size={20} className={styles.inputIcon} />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <div className={styles.inputWrapper}>
            <Mail size={20} className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone" className={styles.label}>
            Phone Number
          </label>
          <div className={styles.inputWrapper}>
            <Phone size={20} className={styles.inputIcon} />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your phone number"
              required
              pattern="^[1-9][0-9]{9}$"
              title="Phone number must be 10 digits and not start with 0"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <Lock size={20} className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Create a password"
              required
              autoComplete="password"
              pattern="^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$"
              title="Password must be at least 6 characters with 1 letter, 1 number & 1 special character"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <div className={styles.inputWrapper}>
            <Lock size={20} className={styles.inputIcon} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.input}
              placeholder="Confirm your password"
              required
              autoComplete="password"
              pattern="^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$"
              title="Password must be at least 6 characters with 1 letter, 1 number & 1 special character"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.terms}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} required />
            <span>
              I agree to the{" "}
              <Link to="/terms" className={styles.termsLink}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className={styles.termsLink}>
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className={styles.divider}>
        <span>Or continue with</span>
      </div>

      <div className={styles.socialLogin}>
        <button type="button" className={styles.socialButton}>
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className={styles.socialIcon}
          />
          Google
        </button>
        <button type="button" className={styles.socialButton}>
          <img
            src="https://www.facebook.com/favicon.ico"
            alt="Facebook"
            className={styles.socialIcon}
          />
          Facebook
        </button>
      </div>

      <div className={styles.loginLink}>
        Already have an account?{" "}
        <Link to="/login" className={styles.link}>
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
