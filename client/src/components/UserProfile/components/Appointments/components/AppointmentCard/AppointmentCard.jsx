import React, { useState } from "react";
import styles from "./appointmentCard.module.css";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MessageCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";

const AppointmentCard = ({ appointment, userRole, isServiceProvider, onViewDetails, onStatusChange }) => {
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return styles.statusConfirmed;
      case "pending":
        return styles.statusPending;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN"),
      time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const { date, time } = formatDateTime(appointment.date || appointment.createdAt);

  return (
    <div className={styles.appointmentCard}>
      <div className={styles.appointmentHeader}>
        <div className={styles.serviceInfo}>
          <h4 className={styles.serviceName}>
            {appointment.service || appointment.providerType}
          </h4>
          <span className={`${styles.status} ${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>
        <div className={styles.appointmentDateTime}>
          <div className={styles.dateTime}>
            <Calendar size={16} />
            <span>{date}</span>
          </div>
          <div className={styles.dateTime}>
            <Clock size={16} />
            <span>{appointment.time || time}</span>
          </div>
        </div>
      </div>

      <div className={styles.appointmentDetails}>
        {isServiceProvider ? (
          <>
            <div className={styles.detailRow}>
              <User size={16} />
              <span>Customer: {appointment.user?.name || "—"}</span>
            </div>
            {appointment.user?.phone && (
              <div className={styles.detailRow}>
                <Phone size={16} />
                <span>{appointment.user.phone}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.detailRow}>
              <User size={16} />
              <span>
                Provider: {appointment.providerId?.name || appointment.providerName || "—"}
              </span>
            </div>
            {appointment.providerPhone && (
              <div className={styles.detailRow}>
                <Phone size={16} />
                <span>{appointment.providerPhone}</span>
              </div>
            )}
          </>
        )}

        {appointment.location && (
          <div className={styles.detailRow}>
            <MapPin size={16} />
            <span>{appointment.location}</span>
          </div>
        )}

        {appointment.reason && (
          <div className={styles.detailRow}>
            <MessageCircle size={16} />
            <span>Reason: {appointment.reason}</span>
          </div>
        )}
      </div>

      <div className={styles.appointmentActions}>
        <button
          className={styles.secondaryButton}
          onClick={onViewDetails}
        >
          View Details
        </button>

        {isServiceProvider ? (
          <>
            {appointment.status === "pending" && (
              <button
                className={styles.confirmButton}
                onClick={() => onStatusChange(appointment, "confirmed")}
                disabled={updatingStatus === appointment._id}
              >
                {updatingStatus === appointment._id ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <CheckCircle size={16} />
                )}
                Confirm
              </button>
            )}
            
            {(appointment.status === "pending" || appointment.status === "confirmed") && (
              <button
                className={styles.completeButton}
                onClick={() => onStatusChange(appointment, "completed")}
                disabled={updatingStatus === appointment._id}
              >
                {updatingStatus === appointment._id ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <CheckCircle size={16} />
                )}
                Complete
              </button>
            )}

            {(appointment.status === "pending" || appointment.status === "confirmed") && (
              <button
                className={styles.dangerButton}
                onClick={() => onStatusChange(appointment, "cancelled")}
                disabled={updatingStatus === appointment._id}
              >
                {updatingStatus === appointment._id ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <X size={16} />
                )}
                Cancel
              </button>
            )}
          </>
        ) : (
          <>
            {(appointment.status === "pending" || appointment.status === "confirmed") && (
              <button
                className={styles.dangerButton}
                onClick={() => onStatusChange(appointment, "cancelled")}
                disabled={updatingStatus === appointment._id}
              >
                {updatingStatus === appointment._id ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <X size={16} />
                )}
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;