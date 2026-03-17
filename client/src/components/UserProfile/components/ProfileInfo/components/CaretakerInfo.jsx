import React from "react";
import { Users } from "lucide-react";
import styles from "../profileInfo.module.css";
import AddressInfo from "./AddressInfo";
import ExpandableText from "./ExpandableText";

const CaretakerInfo = ({ roleData, address }) => {
  const dailyRate = Number(roleData.hourlyRate ?? roleData.charges ?? 0);

  return (
    <div className={styles.roleSection}>
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitle}>
          <Users size={18} />
          Caretaker Details
        </div>
        <div className={styles.infoGrid}>
          {roleData.staffSpecialization && (
            <div>
              <div className={styles.infoLabel}>Specialization</div>
              <div className={styles.infoValue}>
                {roleData.staffSpecialization}
              </div>
            </div>
          )}
          {roleData.staffExperience && (
            <div>
              <div className={styles.infoLabel}>Experience</div>
              <div className={styles.infoValue}>
                {roleData.staffExperience} Years
              </div>
            </div>
          )}
          {dailyRate > 0 && (
            <div>
              <div className={styles.infoLabel}>Daily Rate</div>
              <div className={styles.infoValue}>
                ₹{dailyRate}/day
              </div>
            </div>
          )}
          {roleData.serviceType && (
            <div>
              <div className={styles.infoLabel}>Service Type</div>
              <div className={styles.infoValue}>{roleData.serviceType}</div>
            </div>
          )}
          {roleData.serviceDescription && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className={styles.infoLabel}>Service Description</div>
              <ExpandableText text={roleData.serviceDescription} />
            </div>
          )}
        </div>
      </div>
      <AddressInfo address={address} title="Base Location" />
    </div>
  );
};

export default CaretakerInfo;
