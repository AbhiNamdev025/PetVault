import React from "react";
import styles from "../../appointments.module.css";
import { Button } from "../../../../../common";
const AppointmentTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === "upcoming" ? styles.activeTab : ""}`}
        onClick={() => onTabChange("upcoming")}
      >
        Upcoming
      </button>
      <button
        className={`${styles.tab} ${activeTab === "history" ? styles.activeTab : ""}`}
        onClick={() => onTabChange("history")}
      >
        History
      </button>
    </div>
  );
};
export default AppointmentTabs;
