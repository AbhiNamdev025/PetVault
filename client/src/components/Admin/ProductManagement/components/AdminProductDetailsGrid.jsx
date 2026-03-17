import React from "react";
import { Activity, IndianRupee, Layers } from "lucide-react";
import styles from "../AdminProductDetail.module.css";

const AdminProductDetailsGrid = ({ product }) => {
  return (
    <div className={styles.detailsGrid}>
      <div className={styles.tableContainer}>
        <div className={styles.sectionPadding}>
          <h3 className={styles.sectionTitle}>Product information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Description</label>
              <p className={styles.infoText}>
                {product.description || "No description provided."}
              </p>
            </div>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Details</label>
              <ul className={styles.infoList}>
                <li>
                  <span>Brand</span>
                  <span>{product.brand || "N/A"}</span>
                </li>
                <li>
                  <span>Stock</span>
                  <span>{product.stock} units</span>
                </li>
                <li>
                  <span>Status</span>
                  <span>{product.isArchived ? "Archived" : "Active"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statsColumn}>
        <div className={styles.statCard}>
          <IndianRupee />
          <div>
            <h3>₹{product.price}</h3>
            <p>Price per unit</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Layers />
          <div>
            <h3>{product.stock}</h3>
            <p>Available Stock</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Activity />
          <div>
            <h3>{product.ratings?.length || 0}</h3>
            <p>Total Reviews</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetailsGrid;
