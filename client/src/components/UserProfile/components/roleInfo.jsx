import React from "react";
import styles from "../userProfile.module.css";
import { ROLE_FIELDS } from "./roleFields"; 

const RoleInfo = ({ user }) => {
  const fields = ROLE_FIELDS[user.role] || {};
  const rd = user.roleData || {};

  return (
    <div className={styles.card}>
      <h3 className={styles.sectionTitle}>Role Information</h3>

      {Object.entries(fields).map(([key, label]) => {
        if (!rd[key]) return null;
        return (
          <p key={key}>
            <strong>{label}: </strong> {String(rd[key])}
          </p>
        );
      })}
    </div>
  );
};

export default RoleInfo;
