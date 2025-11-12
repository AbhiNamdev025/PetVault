import React from "react";
import styles from "./appointmentCard.module.css";
import {
  Calendar,
  Clock,
  PawPrint,
  User,
  Phone,
  ClipboardList,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
} from "lucide-react";

const AppointmentCard = ({ appointment, onStatusUpdate, onDelete }) => {
  const getStatusColor = (status) => {
    if (status === "pending") return styles.pending;
    else if (status === "confirmed") return styles.confirmed;
    else if (status === "completed") return styles.completed;
    else if (status === "cancelled") return styles.cancelled;
    else return "";
  };

  const canConfirm = appointment.status === "pending";
  const canComplete = ["pending", "confirmed"].includes(appointment.status);
  const canCancel = ["pending", "confirmed"].includes(appointment.status);

  return (
    <div className={styles.card}>
      <button onClick={() => onDelete(appointment._id)} className={styles.deleteBtn}>
        <Trash2 size={16} />
      </button>

      <div className={styles.header}>
        <PawPrint size={18} />
        <h3>{appointment.petName}</h3>
      </div>

      <div className={styles.info}>
        <p>
          <User size={15} /> {appointment.user?.name || "Unknown User"}
        </p>
        <p>
          <Phone size={15} /> {appointment.parentPhone || "N/A"}
        </p>
        <p>
          <ClipboardList size={15} /> Service: <strong>{appointment.service}</strong>
        </p>
        <p>
          <Calendar size={15} /> {new Date(appointment.date).toLocaleDateString()}
        </p>
        <p>
          <Clock size={15} /> {appointment.time}
        </p>
        <p>Reason: {appointment.reason}</p>
        {appointment.healthIssues && <p>Health: {appointment.healthIssues}</p>}
      </div>

      <div className={`${styles.status} ${getStatusColor(appointment.status)}`}>
        Status: {appointment.status}
      </div>

      <div className={styles.actions}>
        {canConfirm && (
          <button
            onClick={() => onStatusUpdate(appointment._id, "confirmed")}
            className={`${styles.actionBtn} ${styles.confirmBtn}`}
          >
            <CheckCircle size={15} /> Confirm
          </button>
        )}

        {canComplete && (
          <button
            onClick={() => onStatusUpdate(appointment._id, "completed")}
            className={`${styles.actionBtn} ${styles.completeBtn}`}
          >
            <Loader2 size={15} /> Complete
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => onStatusUpdate(appointment._id, "cancelled")}
            className={`${styles.actionBtn} ${styles.cancelBtn}`}
          >
            <XCircle size={15} /> Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
