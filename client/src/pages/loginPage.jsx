import React from "react";
import LoginForm from "../components/Auth/LoginForm/loginForm";
import styles from "./loginPage.module.css";

const LoginPage = () => {
  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.loginWrapper}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
