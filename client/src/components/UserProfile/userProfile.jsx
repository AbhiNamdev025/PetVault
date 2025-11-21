import React, { useEffect, useState } from "react";
import styles from "./userProfile.module.css";
import { API_BASE_URL } from "../../utils/constants";

import ProfileInfo from "./components/ProfileInfo/profileInfo";
import EditProfileForm from "./components/EditProfileForm/editProfileForm";
import Appointments from "./components/Appointments/appointments";
import Orders from "./components/Orders/orders";

import Management from "./components/Management/management";

const UserProfile = () => {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);

  const savedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user")
  );
  const userId = savedUser?._id;
  const userRole = savedUser?.role;

  useEffect(() => {
    if (!userId) return;

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        let endpoint = `${API_BASE_URL}/appointments/my-appointments`;

        if (["caretaker", "daycare", "doctor", "hospital"].includes(userRole)) {
          endpoint = `${API_BASE_URL}/appointments/provider-appointments`;
        }

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setAppointments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    const fetchOrders = async () => {
      try {
        if (userRole === "user" || userRole === "shop") {
          const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchUser();
    fetchAppointments();
    fetchOrders();
  }, [userId, userRole]);

  const handleAppointmentStatusUpdate = async (appointmentId, newStatus) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );
        return true;
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
    return false;
  };

  const refreshUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    setTab("profile");
  };

  const getAvailableTabs = () => {
    if (userRole === "user") {
      return [
        { id: "profile", label: "Profile" },
        { id: "edit", label: "Edit" },
      ];
    }

    const tabs = [
      { id: "profile", label: "Profile" },
      { id: "edit", label: "Edit" },
    ];

    if (
      userRole !== "doctor" &&
      userRole !== "caretaker" &&
      userRole !== "admin"
    ) {
      tabs.push({ id: "management", label: "Management" });
    }

    if (!["shop", "ngo", "admin", "hospital", "daycare"].includes(userRole)) {
      tabs.push({ id: "appointments", label: "Appointments" });
    }

    if (userRole === "shop") {
      tabs.push({ id: "orders", label: "Orders" });
    }

    return tabs;
  };

  if (!user) return <div className={styles.loader}>Loading...</div>;

  const availableTabs = getAvailableTabs();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>

        <div className={styles.tabRow}>
          {availableTabs.map((tabItem) => (
            <button
              key={tabItem.id}
              className={`${styles.tab} ${
                tab === tabItem.id ? styles.activeTab : ""
              }`}
              onClick={() => setTab(tabItem.id)}
            >
              {tabItem.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "profile" && <ProfileInfo user={user} />}
      {tab === "edit" && <EditProfileForm user={user} onUpdate={refreshUser} />}
      {tab === "role" && userRole !== "user" && <RoleInfo user={user} />}

      {tab === "appointments" && (
        <Appointments
          list={appointments}
          onUpdateStatus={handleAppointmentStatusUpdate}
          userRole={userRole}
        />
      )}

      {tab === "orders" && <Orders list={orders} />}
      {tab === "management" && userRole !== "user" && (
        <Management user={user} userRole={userRole} />
      )}
    </div>
  );
};

export default UserProfile;
