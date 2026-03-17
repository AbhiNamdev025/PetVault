import React from "react";
import { User } from "lucide-react";
import { Button } from "../../../common";
import styles from "./LoginButton.module.css";

const LoginButton = ({ onClick }) => {
  return (
    <Button
      className={styles.authLink}
      onClick={onClick}
      variant="ghost"
      size="sm"
    >
      <User size={18} />
      <span>Login</span>
    </Button>
  );
};

export default LoginButton;
