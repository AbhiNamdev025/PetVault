import React from "react";
import { IndianRupee, Shield, Trash2, Users } from "lucide-react";
import styles from "../daycareDetail.module.css";

const formatCurrency = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num?.toString() || "0";
};

const DaycareStatsGrid = ({
  daycare,
  caretakerCount,
  archivedCount,
}) => {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <Users size={24} />
        <div>
          <h3>{caretakerCount}</h3>
          <p>Total Caretakers</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.earningCard}`}>
        <IndianRupee size={24} />
        <div>
          <h3>₹{formatCurrency(daycare.lifetime_earning || 0)}</h3>
          <p>Lifetime Earning</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.archivedCard}`}>
        <Trash2 size={24} />
        <div>
          <h3>{archivedCount}</h3>
          <p>Archived Caretakers</p>
        </div>
      </div>
      <div className={styles.statCard}>
        <Shield size={24} />
        <div>
          <h3>{daycare.max_pets_allowed || "N/A"}</h3>
          <p>Capacity (Pets)</p>
        </div>
      </div>
    </div>
  );
};

export default DaycareStatsGrid;
