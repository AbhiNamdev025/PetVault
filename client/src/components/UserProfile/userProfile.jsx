import React, { useEffect, useState } from "react";
import styles from "./userProfile.module.css";
import { API_BASE_URL } from "../../utils/constants";

import ProfileInfo from "./components/profileInfo";
import EditProfileForm from "./components/editProfileForm";
import RoleInfo from "./components/roleInfo";
import Appointments from "./components/appointments";
import Orders from "./components/orders";

const Profile = () => {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);

  const savedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );
  const userId = savedUser?._id;

  useEffect(() => {
    if (!userId) return;

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchUser = async () => {
      const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(await res.json());
    };

    const fetchAppointments = async () => {
      const res = await fetch(`${API_BASE_URL}/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAppointments(await res.json());
    };

    const fetchOrders = async () => {
      const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    };

    fetchUser();
    fetchAppointments();
    fetchOrders();
  }, [userId]);

  const refreshUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setTab("profile");
  };

  if (!user) return <div className={styles.loader}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>

        <div className={styles.tabRow}>
          <button
            className={`${styles.tab} ${
              tab === "profile" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("profile")}
          >
            Profile
          </button>

          <button
            className={`${styles.tab} ${
              tab === "edit" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("edit")}
          >
            Edit
          </button>

          {user?.role !== "user" && (
            <button
              className={`${styles.tab} ${
                tab === "role" ? styles.activeTab : ""
              }`}
              onClick={() => setTab("role")}
            >
              Role Info
            </button>
          )}

          <button
            className={`${styles.tab} ${
              tab === "appointments" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("appointments")}
          >
            Appointments
          </button>

          <button
            className={`${styles.tab} ${
              tab === "orders" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("orders")}
          >
            Orders
          </button>
        </div>
      </div>

      {tab === "profile" && <ProfileInfo user={user} />}
      {tab === "edit" && <EditProfileForm user={user} onUpdate={refreshUser} />}
      {tab === "role" && user?.role !== "user" && <RoleInfo user={user} />}
      {tab === "appointments" && <Appointments list={appointments} />}
      {tab === "orders" && <Orders list={orders} />}
    </div>
  );
};

export default Profile;
