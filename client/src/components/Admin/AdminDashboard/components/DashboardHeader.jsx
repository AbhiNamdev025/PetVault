import React from "react";
import { Clock, ExternalLink } from "lucide-react";
import styles from "../adminDashboard.module.css";

const DashboardHeader = ({ onGoToWeb }) => {
  return (
    <div className={styles.dashboardHeader}>
      <div className={styles.headerTitle}>
        <h1>Admin Command Center</h1>
        <p>Real-time platform insights and system management.</p>
      </div>
      <div className={styles.headerMeta}>
        <div className={styles.dateSelector}>
          <Clock size={14} />
          <span>
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <div className={styles.filterBtn} onClick={onGoToWeb}>
          <ExternalLink size={14} />
          Go to Web
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
