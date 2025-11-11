import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PawPrint, Menu, X, User, ShoppingCart, LogOut } from "lucide-react";
import styles from "./navbar.module.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserLogin();
  }, []);

  const checkUserLogin = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/pet-shop", label: "Pet Shop" },
    { path: "/vet-services", label: "Vet Services" },
    { path: "/pet-adoption", label: "Adoption" },
    { path: "/pet-daycare", label: "Daycare" },
    { path: "/pet-products", label: "Products" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
    setIsOpen(false);
  };

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
            {user ? (
              <>
                <Link to="/profile" className={styles.authLink}>
                  <User size={18} />
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className={styles.authLink}>
                <User size={18} />
                <span>Login</span>
              </Link>
            )}
            <button className={styles.cartBtn}>
              <ShoppingCart size={18} />
              <span className={styles.cartCount}>0</span>
            </button>
          </div>
        </div>

        <div className={styles.navActions}>
          {user ? (
            <>
              <Link to="/profile" className={styles.authLink}>
                <User size={18} />
                <span>{user.name}</span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className={styles.authLink}>
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
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
