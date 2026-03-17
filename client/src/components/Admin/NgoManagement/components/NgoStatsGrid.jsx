import React from "react";
import { Heart, IndianRupee, PawPrint, Store, Trash2 } from "lucide-react";
import styles from "../ngoDetail.module.css";

const formatCurrency = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num?.toString() || "0";
};

const NgoStatsGrid = ({ ngo, pets }) => {
  const items = pets?.items || [];
  const totalPets = pets?.count ?? items.length;
  const archivedCount = items.filter((p) => p.isArchived).length;
  const adoptedCount = items.filter((p) => !p.available).length;
  const availableCount = items.filter(
    (p) => p.available && !p.isArchived,
  ).length;

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <PawPrint />
        <div>
          <h3>{totalPets}</h3>
          <p>Total Pets</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.earningCard}`}>
        <IndianRupee size={24} />
        <div>
          <h3>₹{formatCurrency(ngo.lifetime_earning || 0)}</h3>
          <p>Lifetime Earning</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.archivedCard}`}>
        <Trash2 />
        <div>
          <h3>{archivedCount}</h3>
          <p>Archived Pets</p>
        </div>
      </div>
      <div className={styles.statCard}>
        <Heart />
        <div>
          <h3>{adoptedCount}</h3>
          <p>Adopted</p>
        </div>
      </div>
      <div className={styles.statCard}>
        <Store />
        <div>
          <h3>{availableCount}</h3>
          <p>Available for Adoption</p>
        </div>
      </div>
    </div>
  );
};

export default NgoStatsGrid;
