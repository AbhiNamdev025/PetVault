import React from "react";
import styles from "./dashboardTabs.module.css";

const TAB_LABELS = {
  hospital: "Hospital",
  doctor: "Doctors",
  daycare: "Daycare",
  caretaker: "Caretakers",
  shop: "Products",
  pets: "Pets",
  orders: "Orders",
  ngo: "Adoption",
  user: "Users",
};

const DashboardTabs = ({ allowedTabs, activeTab, setActiveTab }) => {
  return (
    <div className={styles.tabRow}>
      {allowedTabs.map((tab) => (
        <button
          key={tab}
          className={`${styles.tab} ${
            activeTab === tab ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab(tab)}
        >
          {TAB_LABELS[tab] || tab}
        </button>
      ))}
    </div>
  );
};

export default DashboardTabs;
