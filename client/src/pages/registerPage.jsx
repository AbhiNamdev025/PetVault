import React from "react";
import RegisterForm from "../components/Auth/RegisterForm/registerForm";
import styles from "./registerPage.module.css";

const RegisterPage = () => {
  return (
    <div className={styles.registerPage}>
      <div className={styles.container}>
        <div className={styles.registerWrapper}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
