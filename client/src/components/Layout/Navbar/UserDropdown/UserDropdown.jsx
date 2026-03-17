import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "../../../common";
import { BASE_URL } from "../../../../utils/constants";
import styles from "./UserDropdown.module.css";

const UserDropdown = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname, user?._id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className={styles.userMenu} ref={dropdownRef}>
      <Button
        className={styles.userButton}
        onClick={() => setDropdownOpen((p) => !p)}
        variant="primary"
        size="md"
      >
        <img
          src={
            user.avatar
              ? `${BASE_URL}/uploads/avatars/${user.avatar}`
              : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3485.jpg"
          }
          className={styles.avatar}
          alt="avatar"
        />
        <ChevronDown size={16} />
      </Button>

      {dropdownOpen && (
        <div className={styles.dropdownMenu}>
          {user.role === "admin" && (
            <Link to="/admin" className={styles.dropdownItem}>
              <LayoutDashboard size={16} /> Admin Panel
            </Link>
          )}
          <Link to="/profile" className={styles.dropdownItem}>
            Profile
          </Link>
          <Link to="/my-orders" className={styles.dropdownItem}>
            My Orders
          </Link>

          <Button
            onClick={onLogout}
            className={styles.dropdownItem}
            variant="ghost"
            size="md"
            fullWidth
            style={{ justifyContent: "flex-start" }}
          >
            <LogOut size={16} /> Logout
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
