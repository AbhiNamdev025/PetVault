import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  PawPrint,
  UserCog,
} from "lucide-react";
import { toast } from "react-toastify";
import styles from "./registerForm.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user", // default role
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
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role, // <-- sending role
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

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
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
        <div className={styles.nameRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>First Name</label>
            <div className={styles.inputWrapper}>
              <User size={20} className={styles.inputIcon} />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="First name"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label>
            <div className={styles.inputWrapper}>
              <User size={20} className={styles.inputIcon} />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Last name"
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail size={20} className={styles.inputIcon} />
            <input
              type="email"
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
          <label className={styles.label}>Phone Number</label>
          <div className={styles.inputWrapper}>
            <Phone size={20} className={styles.inputIcon} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your phone number"
              required
              pattern="^[1-9][0-9]{9}$"
            />
          </div>
        </div>

        {/* ROLE SELECTOR */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Select Role</label>
          <div className={styles.inputWrapper}>
            <UserCog size={20} className={styles.inputIcon} />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.input}
              required
            >
              <option value="user">Normal User</option>
              <option value="doctor">Doctor</option>
              <option value="hospital">Hospital</option>
              <option value="daycare">Daycare</option>
              <option value="caretaker">Caretaker</option>
              <option value="shop">Pet Shop</option>

              <option value="ngo">NGO / Rescue</option>
            </select>
          </div>
        </div>

        <div className={styles.passwordRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Create a password"
                required
                minLength="6"
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
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={20} className={styles.inputIcon} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Confirm password"
                required
                minLength="6"
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
        </div>

        <button
          type="submit"
          className={`${styles.submitButton} ${
            isLoading ? styles.loading : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={styles.buttonSpinner}></div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className={styles.divider}>
        <span>Or continue with</span>
      </div>

      <div className={styles.socialLogin}>
        <button className={styles.socialButton} onClick={handleGoogleRegister}>
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className={styles.socialIcon}
          />{" "}
          Google
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
