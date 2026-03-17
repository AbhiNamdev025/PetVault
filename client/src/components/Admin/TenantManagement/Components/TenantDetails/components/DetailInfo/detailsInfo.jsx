import React from "react";
import styles from "./detailInfo.module.css";

const DetailInfo = ({ userData }) => {
  const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatValue = (key, value) => {
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value === null || value === undefined || value === "") return "N/A";
    if (Array.isArray(value)) return value.join(", ");
    if (
      typeof value === "string" &&
      /^([01]\d|2[0-3]):?([0-5]\d)$/.test(value)
    ) {
      const [hours, minutes] = value.split(":");
      const h = parseInt(hours);
      const ampm = h >= 12 ? "PM" : "AM";
      const formattedH = h % 12 || 12;
      return `${formattedH}:${minutes} ${ampm}`;
    }
    return String(value);
  };

  return (
    <div className={styles.detailCard}>
      <h3>Business/Professional Information</h3>
      {userData.roleData ? (
        <div className={styles.infoList}>
          {Object.entries(userData.roleData).map(([key, value]) => {
            if (typeof value === "object" || Array.isArray(value)) return null;
            return (
              <div className={styles.infoItem} key={key}>
                <span className={styles.infoKey}>{formatKey(key)}:</span>
                <span className={styles.infoValue}>
                  {formatValue(key, value)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No specific role data available.</p>
      )}
    </div>
  );
};

export default DetailInfo;
