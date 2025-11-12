import React from "react";
import { Calendar, Clock, PawPrint, FileText, XCircle } from "lucide-react";
import styles from "./appointmentCard.module.css";

const AppointmentCard = ({ appointment, onCancel }) => {
  const getStatusClass = (status) => {
    if (status === "pending") return styles.pending;
    if (status === "confirmed") return styles.confirmed;
    if (status === "completed") return styles.completed;
    if (status === "cancelled") return styles.cancelled;
    return "";
  };

  const canCancel = ["pending", "confirmed"].includes(appointment.status);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span
          className={`${styles.statusBadge} ${getStatusClass(
            appointment.status
          )}`}
        >
          {appointment.status.charAt(0).toUpperCase() +
            appointment.status.slice(1)}
        </span>
        <h3 className={styles.serviceType}>
          {appointment.service.charAt(0).toUpperCase() +
            appointment.service.slice(1)}
        </h3>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.petInfo}>
          <PawPrint size={18} />
          <span>
            {appointment.petName} ({appointment.petType})
          </span>
        </div>

        <div className={styles.detail}>
          <Calendar size={18} />
          <span>{new Date(appointment.date).toLocaleDateString()}</span>
        </div>

        <div className={styles.detail}>
          <Clock size={18} />
          <span>{appointment.time}</span>
        </div>

        <div className={styles.detail}>
          <FileText size={18} />
          <span>{appointment.reason}</span>
        </div>

        {appointment.healthIssues && (
          <div className={styles.detail}>
            <FileText size={18} />
            <span>Health: {appointment.healthIssues || Healthy}</span>
          </div>
        )}
      </div>

      {canCancel && (
        <button
          onClick={() => onCancel(appointment._id)}
          className={styles.cancelBtn}
        >
          <XCircle size={18} />
          Cancel Appointment
        </button>
      )}
    </div>
  );
};

export default AppointmentCard;
