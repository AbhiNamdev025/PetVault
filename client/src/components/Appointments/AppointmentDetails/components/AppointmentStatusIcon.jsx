import React from "react";
import { AlertCircle, CheckCircle2, Clock4, XCircle } from "lucide-react";
import styles from "../../appointmentDetailsModal.module.css";

const AppointmentStatusIcon = ({ status }) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle2 className={styles.statusConfirmed} size={16} />;
    case "pending":
      return <Clock4 className={styles.statusPending} size={16} />;
    case "completed":
      return <CheckCircle2 className={styles.statusCompleted} size={16} />;
    case "cancelled":
      return <XCircle className={styles.statusCancelled} size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
};

export default AppointmentStatusIcon;
