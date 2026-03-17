import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./DesktopMenu.module.css";

const DesktopMenu = ({ navItems }) => {
  const location = useLocation();

  return (
    <div className={styles.navMenu}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`${styles.navLink} ${
            location.pathname === item.path ? styles.activeLink : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default DesktopMenu;
