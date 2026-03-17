import React from "react";
import { MapPin } from "lucide-react";
import styles from "../profileInfo.module.css";

const AddressInfo = ({ address, title = "Address" }) => {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardTitle}>
        <MapPin size={18} />
        {title}
      </div>
      <div className={styles.infoGrid}>
        <div>
          <div className={styles.infoLabel}>Street</div>
          <div className={styles.infoValue}>{address?.street || "N/A"}</div>
        </div>
        <div>
          <div className={styles.infoLabel}>City</div>
          <div className={styles.infoValue}>{address?.city || "N/A"}</div>
        </div>
        <div>
          <div className={styles.infoLabel}>State</div>
          <div className={styles.infoValue}>{address?.state || "N/A"}</div>
        </div>
        <div>
          <div className={styles.infoLabel}>Pin Code</div>
          <div className={styles.infoValue}>{address?.zipCode || "N/A"}</div>
        </div>
      </div>
    </div>
  );
};

export default AddressInfo;
