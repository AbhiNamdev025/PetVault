import React from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import styles from "./Logo.module.css";

const Logo = () => {
  return (
    <Link to="/" className={styles.logo}>
      <PawPrint className={styles.logoIcon} />
      <span>PetVault</span>
    </Link>
  );
};

export default Logo;
