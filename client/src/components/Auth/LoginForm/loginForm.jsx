import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, PawPrint } from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../utils/constants.jsx";
import styles from "./loginForm.module.css";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
          })
        );

        toast.success("Login successful!");

        if (data.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Login failed");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <div className={styles.formHeader}>
        <div className={styles.logo}>
          <PawPrint className={styles.logoIcon} />
          <span>PetVault</span>
        </div>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
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
              placeholder="Enter your password"
              required
              autoComplete="password"
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

        <div className={styles.formOptions}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className={`${styles.submitButton} ${
            isLoading ? styles.loading : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? <div className={styles.spinner}></div> : "Sign In"}
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

      <div className={styles.signupLink}>
        Don't have an account?{" "}
        <Link to="/register" className={styles.link}>
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
