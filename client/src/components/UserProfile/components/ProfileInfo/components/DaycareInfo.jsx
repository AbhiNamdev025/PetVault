import React from "react";
import { PawPrint } from "lucide-react";
import styles from "../profileInfo.module.css";
import AddressInfo from "./AddressInfo";
import ExpandableText from "./ExpandableText";

const DaycareInfo = ({ roleData, address }) => {
  return (
    <div className={styles.roleSection}>
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitle}>
          <PawPrint size={18} />
          Daycare Details
        </div>
        <div className={styles.infoGrid}>
          {roleData.ownerName && (
            <div>
              <div className={styles.infoLabel}>Owner Name</div>
              <div className={styles.infoValue}>{roleData.ownerName}</div>
            </div>
          )}
          {roleData.maxPetsAllowed && (
            <div>
              <div className={styles.infoLabel}>Max Pets Allowed</div>
              <div className={styles.infoValue}>
                {roleData.maxPetsAllowed} pets
              </div>
            </div>
          )}
          {roleData.daycareDescription && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className={styles.infoLabel}>Description</div>
              <ExpandableText text={roleData.daycareDescription} />
            </div>
          )}
        </div>
      </div>
      <AddressInfo address={address} title="Facility Location" />
    </div>
  );
};

export default DaycareInfo;
