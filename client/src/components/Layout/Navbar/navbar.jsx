import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PawPrint, Menu, X, User, ShoppingCart } from "lucide-react";
import styles from "./navbar.module.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/pet-shop", label: "Pet Shop" },
    { path: "/vet-services", label: "Vet Services" },
    { path: "/pet-adoption", label: "Adoption" },
    { path: "/pet-daycare", label: "Daycare" },
    { path: "/pet-products", label: "Products" },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link to="/" className={styles.logo}>
          <PawPrint className={styles.logoIcon} />
          <span>PetVault</span>
        </Link>

        <div className={`${styles.navMenu} ${isOpen ? styles.active : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${
                location.pathname === item.path ? styles.activeLink : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className={styles.mobileActions}>
            <Link to="/login" className={styles.authLink}>
              <User size={18} />
              <span>Login</span>
            </Link>
            <button className={styles.cartBtn}>
              <ShoppingCart size={18} />
              <span className={styles.cartCount}>0</span>
            </button>
          </div>
        </div>

        <div className={styles.navActions}>
          <Link to="/login" className={styles.authLink}>
            <User size={18} />
            <span>Login</span>
          </Link>
          <button className={styles.cartBtn}>
            <ShoppingCart size={18} />
            <span className={styles.cartCount}>0</span>
          </button>
        </div>

        <button
          className={styles.mobileToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
