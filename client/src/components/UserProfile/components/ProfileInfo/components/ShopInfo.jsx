import React from "react";
import { ShoppingBag } from "lucide-react";
import styles from "../profileInfo.module.css";
import AddressInfo from "./AddressInfo";

const ShopInfo = ({ roleData, address, getShopTypeLabel, formatTime }) => {
  return (
    <div className={styles.roleSection}>
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitle}>
          <ShoppingBag size={18} />
          Shop Details
        </div>
        <div className={styles.infoGrid}>
          {roleData.ownerName && (
            <div>
              <div className={styles.infoLabel}>Owner Name</div>
              <div className={styles.infoValue}>{roleData.ownerName}</div>
            </div>
          )}
          {roleData.shopType && (
            <div>
              <div className={styles.infoLabel}>Shop Type</div>
              <div className={styles.infoValue}>
                {getShopTypeLabel(roleData.shopType)}
              </div>
            </div>
          )}
          <div>
            <div className={styles.infoLabel}>Delivery Available</div>
            <div className={styles.infoValue}>
              {roleData.deliveryAvailable ? "Yes" : "No"}
            </div>
          </div>
          {roleData.deliveryAvailable && roleData.deliveryRadius && (
            <div>
              <div className={styles.infoLabel}>Delivery Radius</div>
              <div className={styles.infoValue}>
                {roleData.deliveryRadius} km
              </div>
            </div>
          )}

          {roleData.groomingAvailable && (
            <div>
              <div className={styles.infoLabel}>Grooming</div>
              <div className={styles.infoValue}>
                {roleData.groomingAvailable ? "Yes" : "No"}
              </div>
            </div>
          )}
        </div>
      </div>
      <AddressInfo address={address} title="Store Location" />
    </div>
  );
};

export default ShopInfo;
