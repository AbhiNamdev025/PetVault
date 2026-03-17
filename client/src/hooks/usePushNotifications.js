import { useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";

const usePushNotifications = () => {
  const [permission, setPermission] = useState("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
    // Register sw if not already
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Auto-sync subscription if already granted
  useEffect(() => {
    const syncSubscription = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token || Notification.permission !== "granted") return;

      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          console.log(
            "Permission is granted but no subscription found. Subscribing now...",
          );
          const res = await fetch(
            `${BASE_URL}/api/notifications/vapid-public-key`,
          );
          const { publicKey } = await res.json();
          if (publicKey) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
          }
        }

        if (subscription) {
          // Send existing or new subscription to backend to ensure it's saved
          await fetch(`${BASE_URL}/api/notifications/subscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ subscription }),
          });
          console.log("Synced push subscription with server");
        }
      } catch (err) {
        console.error("Failed to sync subscription:", err);
      }
    };

    if (permission === "granted") {
      syncSubscription();
    }
  }, [permission]);

  const subscribeUser = async () => {
    console.log("subscribeUser called...");
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications are not supported by your browser");
      return;
    }

    setLoading(true);
    try {
      // 1. Get VAPID public key from backend
      console.log("Fetching VAPID key...");
      const res = await fetch(`${BASE_URL}/api/notifications/vapid-public-key`);
      const { publicKey } = await res.json();

      if (!publicKey) throw new Error("VAPID public key not found");

      // 2. Request permission
      console.log("Requesting permission...");
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        throw new Error("Notification permission denied");
      }

      // 3. Register service worker (if redundant, ensure it's ready)
      console.log("Waiting for SW ready...");
      const registration = await navigator.serviceWorker.ready;

      // 4. Subscribe
      console.log("Subscribing to PushManager...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 5. Send subscription to backend
      console.log("Sending subscription to backend...");
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        console.warn("No token found, cannot save subscription");
        return;
      }

      const subRes = await fetch(`${BASE_URL}/api/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription }), // Wrapped in object
      });

      if (!subRes.ok) throw new Error("Failed to save subscription on server");

      // Trigger a test notification to confirm it works
      console.log("Triggering test notification...");
      const response = await fetch(`${BASE_URL}/api/notifications/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error("Test notification failed:", await response.text());
        toast.error("Could not send test notification");
      } else {
        console.log("Test notification triggered successfully");
      }

      toast.success("Notifications enabled!");
    } catch (error) {
      console.error("Subscription failed:", error);
      if (error.message === "Notification permission denied") {
        toast.error(
          "Permission blocked. Please enable notifications in your browser settings.",
          { duration: 5000 },
        );
      } else {
        toast.error("Failed to enable notifications: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { permission, subscribeUser, loading };
};

export default usePushNotifications;
