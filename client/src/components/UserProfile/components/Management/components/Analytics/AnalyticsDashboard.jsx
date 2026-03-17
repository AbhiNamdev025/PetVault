import React, { useEffect, useState } from "react";
import styles from "./AnalyticsDashboard.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import {
  IndianRupee,
  Calendar,
  Users,
  ShoppingBag,
  CheckCircle,
  Clock,
} from "lucide-react";
import BarChart from "./BarChart";
import { DashboardSkeleton } from "../../../../../Skeletons";
import Notifications from "../../../Notifications/notifications";
import {
  formatCompactCurrency,
  formatCurrency,
} from "../../../../../Order/Orders/orderUtils";
import { Button } from "../../../../../common";
const AnalyticsDashboard = ({ user, setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState(
    user?.role === "ngo" ? "appointments" : "earnings",
  );
  const handleCardClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);
  if (loading) {
    return <DashboardSkeleton statsCount={4} />;
  }
  if (!stats) {
    return <div className={styles.loading}>Failed to load statistics</div>;
  }
  const role = user?.role;
  const isShop = role === "shop";
  const isProvider = ["hospital", "daycare", "ngo"].includes(role);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome back, {user?.name || "User"}</h2>
        <p className={styles.subtitle}>
          Here's what happening with your {role} business.
        </p>
      </div>

      <div className={styles.grid}>
        {/* Earnings Card - Hide for NGO */}
        {role !== "ngo" && (
          <div
            className={styles.card}
            title={`Total Exact Earnings: ${formatCurrency(stats.totalEarnings)}`}
          >
            <div className={`${styles.cardIcon} ${styles.greenIcon}`}>
              <IndianRupee size={20} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardLabel}>Total Earnings</div>
              <div className={styles.cardValue}>
                {formatCompactCurrency(stats.totalEarnings)}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Card */}
        <div
          className={styles.card}
          onClick={() => handleCardClick("appointments")}
          style={{
            cursor: "pointer",
          }}
        >
          <div className={`${styles.cardIcon} ${styles.blueIcon}`}>
            <Calendar size={20} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Total Appointments</div>
            <div className={styles.cardValue}>{stats.totalAppointments}</div>
          </div>
        </div>

        {/* Shop Specific: Orders */}
        {isShop && (
          <div
            className={styles.card}
            onClick={() => handleCardClick("management")} // Ideally jump to orders
            style={{
              cursor: "pointer",
            }}
          >
            <div className={`${styles.cardIcon} ${styles.purpleIcon}`}>
              <ShoppingBag size={20} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardLabel}>Total Orders</div>
              <div className={styles.cardValue}>{stats.totalOrders}</div>
            </div>
          </div>
        )}

        {/* Provider Specific: Staff */}
        {isProvider && (
          <div
            className={styles.card}
            onClick={() => handleCardClick("management")}
            style={{
              cursor: "pointer",
            }}
          >
            <div className={`${styles.cardIcon} ${styles.orangeIcon}`}>
              <Users size={20} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardLabel}>Total Team Members</div>
              <div className={styles.cardValue}>{stats.staffCount}</div>
            </div>
          </div>
        )}

        {/* Pending Card */}
        <div
          className={styles.card}
          onClick={() => handleCardClick("appointments")}
          style={{
            cursor: "pointer",
          }}
        >
          <div className={`${styles.cardIcon} ${styles.redIcon}`}>
            <Clock size={20} />
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardLabel}>Pending Actions</div>
            <div className={styles.cardValue}>{stats.pendingAppointments}</div>
          </div>
        </div>

        {((!isShop && !isProvider) || role === "ngo") && (
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.greenIcon}`}>
              <CheckCircle size={20} />
            </div>
            <div className={styles.cardContent}>
              <div className={styles.cardLabel}>Completed Sessions</div>
              <div className={styles.cardValue}>
                {stats.completedAppointments}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>
            Performance Overview (Last 6 Months)
          </h3>
          <div className={styles.toggleContainer}>
            {role !== "ngo" && (
              <Button
                className={`${styles.toggleBtn} ${chartMetric === "earnings" ? styles.activeToggle : ""}`}
                onClick={() => setChartMetric("earnings")}
                variant="primary"
                size="md"
              >
                Earnings
              </Button>
            )}
            <Button
              className={`${styles.toggleBtn} ${chartMetric === "appointments" ? styles.activeToggle : ""}`}
              onClick={() => setChartMetric("appointments")}
              variant="primary"
              size="md"
            >
              Appointments
            </Button>
          </div>
        </div>
        <div
          style={{
            height: "var(--size-chart-height)",
            width: "100%",
          }}
        >
          <BarChart data={stats.graphData} metric={chartMetric} />
        </div>
      </div>

      <div className={styles.alertsSection}>
        <Notifications
          compact
          maxItems={4}
          title="Recent Alerts"
          onViewAll={() => handleCardClick("alerts")}
        />
      </div>
    </div>
  );
};
export default AnalyticsDashboard;
