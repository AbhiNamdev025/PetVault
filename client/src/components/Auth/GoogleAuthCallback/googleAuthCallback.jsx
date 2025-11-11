import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./GoogleAuthCallback.module.css";

const GoogleAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");
    const id = params.get("id");
    const error = params.get("error");

    if (error) {
      toast.error("Google login failed. Please try again.");
      navigate("/login");
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ _id: id, name, email, role })
      );
      toast.success(`Welcome ${name || "User"}!`);

      // Always navigate to home after login
      navigate("/");
    } else {
      toast.error("Google login failed!");
      navigate("/login");
    }
  }, [params, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.loadingContent}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Completing Google login...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
