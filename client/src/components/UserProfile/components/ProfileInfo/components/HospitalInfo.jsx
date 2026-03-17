import React from "react";
import { Building } from "lucide-react";
import styles from "../profileInfo.module.css";
import AddressInfo from "./AddressInfo";
import ExpandableText from "./ExpandableText";

const HospitalInfo = ({ roleData, address }) => {
  return (
    <div className={styles.roleSection}>
      <div className={styles.sideCard}>
        <div className={styles.sideCardTitle}>
          <Building size={18} />
          Hospital Details
        </div>
        <div className={styles.infoGrid}>
          {roleData.hospitalDescription && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className={styles.infoLabel}>Description</div>
              <ExpandableText text={roleData.hospitalDescription} />
            </div>
          )}
          {roleData.hospitalServices?.length > 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div className={styles.infoLabel}>Services</div>
              <div className={styles.servicesList}>
                {roleData.hospitalServices.map((service, index) => (
                  <span key={index} className={styles.serviceTag}>
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <AddressInfo address={address} title="Location Information" />
    </div>
  );
};

export default HospitalInfo;
