import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./navbar.module.css";
import { BASE_URL } from "../../../utils/constants";
import AuthModal from "../../Auth/AuthModal/authModal";
import {
  AUTH_STATE_CHANGED_EVENT,
  emitAuthStateChanged,
} from "../../../utils/authState";

// Subcomponents
import Logo from "./Logo/Logo";
import DesktopMenu from "./DesktopMenu/DesktopMenu";
import AdminButton from "./AdminButton/AdminButton";
import CartButton from "./CartButton/CartButton";
import UserDropdown from "./UserDropdown/UserDropdown";
import LoginButton from "./LoginButton/LoginButton";
import MobileToggle from "./MobileToggle/MobileToggle";
import MobileMenu from "./MobileMenu/MobileMenu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultView, setAuthDefaultView] = useState("login");
  const [storedUser, setStoredUser] = useState(null);
  const refreshRequestIdRef = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  const readStoredUser = () => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"))
      );
    } catch {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      return null;
    }
  };

  const normalizeAvatarUser = useCallback(async () => {
    const stored = readStoredUser();
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!stored || !token) return null;
    if (stored.avatar) return stored;

    try {
      const res = await fetch(`${BASE_URL}/api/user/${stored._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          return null;
        }
        return stored;
      }

      const freshUser = await res.json();
      localStorage.setItem("user", JSON.stringify(freshUser));
      sessionStorage.setItem("user", JSON.stringify(freshUser));
      return freshUser;
    } catch {
      return stored;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const requestId = ++refreshRequestIdRef.current;
    const user = await normalizeAvatarUser();
    if (requestId !== refreshRequestIdRef.current) return;
    setStoredUser(user);
  }, [normalizeAvatarUser]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    refreshUser();
  }, [location.pathname, location.search, refreshUser]);

  useEffect(() => {
    const handleAuthStateChanged = () => {
      refreshUser();
    };
    const handleStorageChange = (event) => {
      if (!event.key || event.key === "token" || event.key === "user") {
        refreshUser();
      }
    };
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(
        AUTH_STATE_CHANGED_EVENT,
        handleAuthStateChanged,
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshUser]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle automatic auth modal opening from route state/query.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryAuth = params.get("auth");
    const shouldOpenFromState =
      location.state?.openAuthModal || location.state?.openLogin;
    const shouldOpen = Boolean(shouldOpenFromState || queryAuth);

    if (!shouldOpen) return;

    const nextView =
      queryAuth === "signup" || location.state?.authView === "signup"
        ? "signup"
        : "login";
    setAuthDefaultView(nextView);
    setShowAuthModal(true);

    const cleanState =
      location.state && typeof location.state === "object"
        ? { ...location.state }
        : {};
    delete cleanState.openAuthModal;
    delete cleanState.openLogin;
    delete cleanState.authView;

    if (queryAuth) {
      params.delete("auth");
      const nextSearch = params.toString();
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : "",
        },
        { replace: true, state: cleanState },
      );
    } else {
      navigate(`${location.pathname}${location.search}`, {
        replace: true,
        state: cleanState,
      });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  const handleOpenLoginModal = () => {
    setAuthDefaultView("login");
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setAuthDefaultView("login");
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    refreshRequestIdRef.current += 1;
    localStorage.clear();
    sessionStorage.clear();
    setStoredUser(null);
    emitAuthStateChanged({ status: "logged_out", source: "navbar" });
    navigate("/", { state: { openLogin: true } });
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
        {/* LOGO */}
        <Logo />

        {/* DESKTOP MENU */}
        <DesktopMenu navItems={navItems} />

        {/* ACTIONS */}
        <div className={styles.navActions}>
          <AdminButton user={storedUser} />

          {storedUser ? (
            <UserDropdown user={storedUser} onLogout={handleLogout} />
          ) : (
            <LoginButton onClick={handleOpenLoginModal} />
          )}

          <CartButton />
        </div>

        {/* MOBILE TOGGLE */}
        <MobileToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <MobileMenu
          navItems={navItems}
          user={storedUser}
          onLogout={handleLogout}
          onLogin={handleOpenLoginModal}
          onClose={() => setIsOpen(false)}
        />
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        defaultView={authDefaultView}
        onAuthSuccess={refreshUser}
      />
    </nav>
  );
};

export default Navbar;
