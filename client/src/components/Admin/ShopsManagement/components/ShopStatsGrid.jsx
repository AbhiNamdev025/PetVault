import React from "react";
import { Calendar, IndianRupee, Package, PawPrint, Trash2 } from "lucide-react";
import styles from "../shopDetail.module.css";

const formatCurrency = (num) => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(1) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num?.toString() || "0";
};

const ShopStatsGrid = ({ shop, products, pets }) => {
  const productItems = products?.items || [];
  const petItems = pets?.items || [];
  const archivedCount =
    productItems.filter((p) => p.isArchived).length +
    petItems.filter((p) => p.isArchived).length;
  const outOfStockCount =
    productItems.filter((p) => p.stock === 0).length +
    petItems.filter((p) => !p.available).length;

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <Package size={24} />
        <div>
          <h3>{products?.count ?? productItems.length}</h3>
          <p>Total Products</p>
        </div>
      </div>
      <div className={styles.statCard}>
        <PawPrint size={24} />
        <div>
          <h3>{pets?.count ?? petItems.length}</h3>
          <p>Total Pets</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.earningCard}`}>
        <IndianRupee size={24} />
        <div>
          <h3>₹{formatCurrency(shop.lifetime_earning || 0)}</h3>
          <p>Lifetime Earning</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.archivedCard}`}>
        <Trash2 size={24} />
        <div>
          <h3>{archivedCount}</h3>
          <p>Archived Items</p>
        </div>
      </div>
      <div className={`${styles.statCard} ${styles.pendingCard}`}>
        <Calendar size={24} />
        <div>
          <h3>{outOfStockCount}</h3>
          <p>Out of Stock</p>
        </div>
      </div>
    </div>
  );
};

export default ShopStatsGrid;
