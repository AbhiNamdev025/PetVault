import React from "react";
import styles from "./dashboardTabs.module.css";
import { Button } from "../../../common";
const TAB_LABELS = {
  dashboard: "Overview",
  hospital: "Hospital",
  doctor: "Doctors",
  daycare: "Daycare",
  caretaker: "Caretakers",
  shop: "Products",
  pets: "Pets",
  orders: "Orders",
  ngo: "Adoption",
  user: "Users"
};
const DashboardTabs = ({
  allowedTabs,
  activeTab,
  setActiveTab
}) => {
  return <div className={styles.tabRow}>
      {allowedTabs.map(tab => <Button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`} onClick={() => setActiveTab(tab)} variant="ghost" size="sm">
          {TAB_LABELS[tab] || tab}
        </Button>)}
    </div>;
};
export default DashboardTabs;
