import React from "react";
import styles from "../../appointmentDetailsModal.module.css";
import { parsePrescription } from "../utils/appointmentDetails.utils";

const AppointmentPrescriptionTab = ({ appointment }) => {
  const prescription = parsePrescription(appointment?.prescription);

  return (
    <div className={styles.glassCard}>
      <h3 className={styles.cardTitle}>Current Prescription</h3>
      <div className={styles.prescriptionContainer}>
        {prescription.type === "list" &&
          prescription.data.map((item, idx) => (
            <div key={`rx-${idx}`} className={styles.prescriptionItem}>
              <div className={styles.medHeader}>
                <span className={styles.medName}>{item?.medication}</span>
                <span className={styles.medDosage}>{item?.dosage}</span>
              </div>
              <div className={styles.medFooter}>
                <span className={styles.medDuration}>{item?.duration}</span>
                {item?.instructions && (
                  <span className={styles.medInstructions}>
                    • {item.instructions}
                  </span>
                )}
              </div>
            </div>
          ))}

        {prescription.type === "text" && (
          <p className={styles.value}>{prescription.data}</p>
        )}

        {prescription.type === "none" && (
          <div className={styles.noPaymentNotice}>
            No prescription recorded for this visit.
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentPrescriptionTab;
