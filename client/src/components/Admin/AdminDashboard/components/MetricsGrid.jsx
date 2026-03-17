import React from "react";
import { IndianRupee, ShoppingBag, TrendingUp, Users } from "lucide-react";
import styles from "../adminDashboard.module.css";

const formatCurrency = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num?.toString() || "0";
};

const getRevenueTrend = (dailyRevenue = []) => {
  if (!dailyRevenue || dailyRevenue.length < 2) return "+0%";
  const last = dailyRevenue[dailyRevenue.length - 1]?.revenue || 0;
  const prev = dailyRevenue[dailyRevenue.length - 2]?.revenue || 0;

  if (prev === 0) return last === 0 ? "0%" : "+100%";
  const diff = ((last - prev) / prev) * 100;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
};

const MetricsGrid = ({ stats, onNavigate }) => {
  return (
    <div className={styles.metricsGrid}>
      <div
        className={styles.metricCard}
        onClick={() => onNavigate("/admin/orders")}
        title={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
      >
        <div className={`${styles.metricIcon} ${styles.revenueIcon}`}>
          <IndianRupee size={18} />
        </div>
        <div className={styles.metricValue}>
          <p>Total Revenue</p>
          <h3>₹{formatCurrency(stats?.totalRevenue || 0)}</h3>
      </div>
        <div className={`${styles.metricTrend} ${styles.statusPending}`}>
          Pending
        </div>
      </div>

      <div
        className={styles.metricCard}
        title={`₹${(stats?.platformFee || 0).toLocaleString()} (Platform Earnings)`}
      >
        <div className={`${styles.metricIcon} ${styles.feeIcon}`}>
          <TrendingUp size={18} />
        </div>
        <div className={styles.metricValue}>
          <p>Platform Fee</p>
          <h3>₹{formatCurrency(stats?.platformFee || 0)}</h3>
        </div>
        <div className={`${styles.metricTrend} ${styles.statusPending}`}>
          Pending
        </div>
      </div>

      <div
        className={styles.metricCard}
        onClick={() => onNavigate("/admin/tenants")}
      >
        <div className={`${styles.metricIcon} ${styles.tenantsIcon}`}>
          <ShoppingBag size={18} />
        </div>
        <div className={styles.metricValue}>
          <p>Partners</p>
          <h3>{stats?.activeTenants || 0}</h3>
        </div>
        <div className={`${styles.metricTrend} ${styles.statusPending}`}>
          Pending
        </div>
      </div>

      <div
        className={styles.metricCard}
        onClick={() => onNavigate("/admin/users")}
      >
        <div className={`${styles.metricIcon} ${styles.usersIcon}`}>
          <Users size={18} />
        </div>
        <div className={styles.metricValue}>
          <p>Platform Users</p>
          <h3>{stats?.totalUsers?.toLocaleString() || 0}</h3>
        </div>
        <div className={`${styles.metricTrend} ${styles.statusPending}`}>
          Pending
        </div>
      </div>
    </div>
  );
};

export default MetricsGrid;
