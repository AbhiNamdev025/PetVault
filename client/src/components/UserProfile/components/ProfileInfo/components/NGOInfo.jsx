import React from "react";
import { HeartHandshake } from "lucide-react";
import styles from "../profileInfo.module.css";
import AddressInfo from "./AddressInfo";

const NGOInfo = ({ roleData, address }) => {
  return (
    <div className={styles.roleSection}>
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitle}>
          <HeartHandshake size={18} />
          NGO Details
        </div>
        <div className={styles.infoGrid}>
          {roleData.ownerName && (
            <div>
              <div className={styles.infoLabel}>Owner Name</div>
              <div className={styles.infoValue}>{roleData.ownerName}</div>
            </div>
          )}
          {roleData.servicesOffered?.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className={styles.infoLabel}>Services Offered</div>
              <div className={styles.servicesList}>
                {roleData.servicesOffered.map((service, index) => (
                  <span key={index} className={styles.serviceTag}>
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <AddressInfo address={address} title="NGO Location" />
    </div>
  );
};

export default NGOInfo;
