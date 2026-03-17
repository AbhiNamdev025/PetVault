import React from "react";
import styles from "../bookAppointmentModal.module.css";

const ProviderSummaryCard = ({
  provider,
  providerImage,
  providerName,
  providerMeta,
  ProviderIcon,
}) => {
  if (!provider) return null;

  return (
    <div className={styles.providerCard}>
      <div className={styles.providerIdentity}>
        <img src={providerImage} className={styles.providerImage} alt={providerName} />
        <div className={styles.providerInfo}>
          <h3 className={styles.providerName}>
            <ProviderIcon size={22} />
            {providerName}
          </h3>
          <p className={styles.providerMeta}>{providerMeta}</p>
        </div>
      </div>
    </div>
  );
};

export default ProviderSummaryCard;
