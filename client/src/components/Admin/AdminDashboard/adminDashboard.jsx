import React, { useState, useEffect } from "react";
import {
  Users,
  PawPrint,
  ShoppingBag,
  Calendar,
  Plus,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../utils/constants";
import styles from "./adminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin! Manage your pet care platform.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <PawPrint size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats?.totalPets || 0}</h3>
            <p>Total Pets</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats?.totalProducts || 0}</h3>
            <p>Products</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats?.totalAppointments || 0}</h3>
            <p>Appointments</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ClipboardList size={24} />
          </div>
          <div className={styles.statContent}>
            <h3>{stats?.totalOrders || 0}</h3>
            <p>Orders</p>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Quick Actions</h3>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={() => navigate("/admin/pets")}
            >
              <PawPrint size={18} />
              <span>Manage Pets</span>
              <Plus size={16} />
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => navigate("/admin/products")}
            >
              <ShoppingBag size={18} />
              <span>Manage Products</span>
              <Plus size={16} />
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => navigate("/admin/services")}
            >
              <Calendar size={18} />
              <span>Manage Services</span>
              <Plus size={16} />
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => navigate("/admin/users")}
            >
              <Users size={18} />
              <span>View Users</span>
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Recent Activity</h3>
          </div>
          <div className={styles.activities}>
            <div className={styles.activityPlaceholder}>
              <p>Recent activities will appear here</p>
              <span>Appointments, new users, and updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
