import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { Button } from "../../../common";
import styles from "./MobileMenu.module.css";

const MobileMenu = ({ user, navItems, onClose, onLogout, onLogin }) => {
  return (
    <div className={styles.mobileDropdown}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={styles.mobileItem}
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}

      <div className={styles.divider}></div>

      {user ? (
        <>
          {user.role === "admin" && (
            <Link
              to="/admin"
              className={`${styles.mobileItem} ${styles.adminMobileItem}`}
              onClick={onClose}
            >
              <LayoutDashboard size={18} /> Admin Panel
            </Link>
          )}
          <Link to="/profile" className={styles.mobileItem} onClick={onClose}>
            Profile
          </Link>
          <Link to="/my-orders" className={styles.mobileItem} onClick={onClose}>
            Orders
          </Link>

          <Link to="/cart" className={styles.mobileItem} onClick={onClose}>
            Cart
          </Link>
          <Button
            className={styles.mobileItem}
            onClick={() => {
              onLogout();
              onClose();
            }}
            variant="primary"
            size="md"
          >
            Logout
          </Button>
        </>
      ) : (
        <Button
          className={styles.mobileItem}
          onClick={() => {
            onLogin();
            onClose();
          }}
          variant="primary"
          size="md"
        >
          Login
        </Button>
      )}
    </div>
  );
};

export default MobileMenu;
