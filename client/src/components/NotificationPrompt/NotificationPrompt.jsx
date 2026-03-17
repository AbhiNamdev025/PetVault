import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import usePushNotifications from "../../hooks/usePushNotifications";
import styles from "./NotificationPrompt.module.css";
import { Button } from "../common";
const NotificationPrompt = () => {
  const {
    permission,
    subscribeUser,
    loading
  } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  useEffect(() => {
    // Show prompt if permission is NOT granted
    // and user is logged in
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && permission !== "granted") {
      // Delay showing it slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [permission, location.pathname]); // Re-check on route change (login success)

  if (!isVisible || permission === "granted") {
    return null;
  }
  return <div className={styles.promptContainer}>
      <div className={styles.promptContent}>
        <div className={styles.iconWrapper}>
          <Bell size={24} />
        </div>
        <div className={styles.textWrapper}>
          <h4>Enable Notifications</h4>
          <p>Get updates on your appointments and orders.</p>
        </div>
        <div className={styles.actions}>
          <Button className={styles.allowBtn} onClick={subscribeUser} disabled={loading} variant="primary" size="md">
            {loading ? " enabling..." : "Allow"}
          </Button>
          <Button className={styles.dismissBtn} onClick={() => setIsVisible(false)} variant="primary" size="sm">
            Later
          </Button>
        </div>
      </div>
    </div>;
};
export default NotificationPrompt;
