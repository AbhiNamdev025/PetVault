import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PawPrint,
  Menu,
  X,
  User,
  ShoppingCart,
  ChevronDown,
  LogOut,
} from "lucide-react";
import styles from "./navbar.module.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    checkUserLogin();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkUserLogin = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    setUser(null);
    navigate("/login");
  };

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

        <div className={styles.navActions}>
          {user ? (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.userButton}
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                <User size={18} />
                <span className={styles.userName}>
                  {user.name.length > 10
                    ? `${user.name.slice(0, 10)}...`
                    : user.name}
                </span>
                <ChevronDown size={16} />
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link
                    to="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/my-appointments"
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Appointments
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`${styles.dropdownItem} ${styles.mobileItem}`}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.authLink}>
              <User size={18} />
              <span>Login</span>
            </Link>
          )}

          <button className={styles.cartBtn} onClick={() => navigate("/cart")}>
            <ShoppingCart size={18} />
            <span className={styles.cartCount}>●</span>
          </button>
        </div>

        <button
          className={styles.mobileToggle}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {isOpen && (
          <div className={styles.mobileDropdown}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={styles.mobileItem}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className={styles.divider}></div>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className={styles.mobileItem}
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>

                <Link
                  to="/my-orders"
                  className={styles.mobileItem}
                  onClick={() => setIsOpen(false)}
                >
                  Orders
                </Link>

                <Link
                  to="/my-appointments"
                  className={styles.mobileItem}
                  onClick={() => setIsOpen(false)}
                >
                  Appointments
                </Link>

                <Link
                  to="/cart"
                  className={styles.mobileItem}
                  onClick={() => setIsOpen(false)}
                >
                  Cart
                </Link>

                <button
                  className={styles.mobileItem}
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={styles.mobileItem}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to="/cart"
                  className={styles.mobileItem}
                  onClick={() => setIsOpen(false)}
                >
                  Cart
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
