import React from "react";
import styles from "../AdminCommon.module.css";

const AdminHeader = ({ title, subtitle, actions }) => {
  return (
    <div className={styles.adminHeader}>
      <div className={styles.headerTitle}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
};

export default AdminHeader;
