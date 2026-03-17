import React from "react";
import styles from "../../appointments.module.css";

const CA_PatientInfo = ({ selectedAppt }) => {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h3>Appointment Info</h3>
      </div>
      <div className={styles.row}>
        <div className={styles.infoBox}>
          <span className={styles.infoLabel}>Chief Complaint / Reason</span>
          <p className={styles.infoValue}>
            {selectedAppt.reason ||
              selectedAppt.healthIssues ||
              "Not specified"}
          </p>
        </div>
        <div className={styles.infoBox}>
          <span className={styles.infoLabel}>Patient Name</span>
          <p className={styles.infoValue}>
            {selectedAppt.petName || selectedAppt.petId?.name || "Client"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CA_PatientInfo;
