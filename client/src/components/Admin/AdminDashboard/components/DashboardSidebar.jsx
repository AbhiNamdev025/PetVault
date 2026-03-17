import React from "react";
import { BarChart3, Bell, Calendar, IndianRupee, Users } from "lucide-react";
import styles from "../adminDashboard.module.css";
import { Button } from "../../../common";
const DashboardSidebar = ({
  pendingApps = [],
  activities = [],
  onNavigate,
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>
          Review Alerts
          {pendingApps.length > 0 && (
            <span className={styles.badge}>{pendingApps.length} TASK</span>
          )}
        </div>
        <div className={styles.activityFeed}>
          {pendingApps.slice(0, 4).map((app) => (
            <div key={app._id} className={styles.feedItem}>
              <div className={styles.feedDot}></div>
              <div className={styles.feedContent}>
                <h5>{app.name}</h5>
                <p>{app.role?.toUpperCase()} enrollment review required.</p>
                <Button
                  className={styles.btnFullView}
                  onClick={() => onNavigate(`/admin/tenants/${app._id}`)}
                  variant="ghost"
                  size="md"
                >
                  Check Documents
                </Button>
              </div>
            </div>
          ))}
          {pendingApps.length === 0 && (
            <div className={styles.noAct}>
              <Bell size={24} opacity={0.2} />
              <p>No pending alerts</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>System Activity</div>
        <div className={styles.activityFeed}>
          {activities.slice(0, 4).map((act) => (
            <div key={act._id} className={styles.feedItem}>
              <div className={styles.feedDot}></div>
              <div className={styles.feedContent}>
                <h5>{act.user?.name || "Customer"}</h5>
                <p>
                  {act.activityType === "order"
                    ? `Paid ₹${act.totalAmount}`
                    : "Booked appointment"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>Quick Navigation</div>
        <div className={styles.shortcutsContainer}>
          <div
            className={styles.shortcutCard}
            onClick={() => onNavigate("/admin/tenants")}
          >
            <Users size={16} />
            <span>Tenants</span>
          </div>
          <div
            className={styles.shortcutCard}
            onClick={() => onNavigate("/admin/services")}
          >
            <BarChart3 size={16} />
            <span>Services</span>
          </div>
          <div
            className={styles.shortcutCard}
            onClick={() => onNavigate("/admin/orders")}
          >
            <IndianRupee size={16} />
            <span>Orders</span>
          </div>
          <div
            className={styles.shortcutCard}
            onClick={() => onNavigate("/admin/appointments")}
          >
            <Calendar size={16} />
            <span>Schedules</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardSidebar;
