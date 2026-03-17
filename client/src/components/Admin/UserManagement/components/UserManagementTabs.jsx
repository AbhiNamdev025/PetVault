import React from "react";
import styles from "../userManagement.module.css";
import { Button } from "../../../common";
const UserManagementTabs = ({
  tabs,
  activeTab,
  onTabChange,
  users
}) => {
  return <div className={styles.tabsContainer}>
      {tabs.map(tab => <Button key={tab.id} className={`${styles.tabButton} ${activeTab === tab.id ? `${styles.activeTab} ${styles[tab.id]}` : ""}`} onClick={() => onTabChange(tab.id)} variant="ghost" size="sm">
          {tab.icon}
          <span>{tab.label}</span>
          <span className={styles.tabCount}>
            {tab.id === "all" ? users.length : tab.id === "pending_kyc" ? users.filter(u => u.kycStatus === "pending" && u.role !== "user" && u.role !== "admin").length : users.filter(u => u.role === tab.id).length}
          </span>
        </Button>)}
    </div>;
};
export default UserManagementTabs;
