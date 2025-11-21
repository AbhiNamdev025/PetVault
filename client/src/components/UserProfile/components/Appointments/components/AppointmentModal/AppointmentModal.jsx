import React from "react";
import styles from "./appointmentModal.module.css";
import { X, CheckCircle, XCircle } from "lucide-react";

const AppointmentModal = ({
  appointment,
  isServiceProvider,
  onClose,
  onStatusChange,
}) => {
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
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const { date, time } = formatDateTime(
    appointment.date || appointment.createdAt
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Appointment Details</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.detailSection}>
            <h4>Service Information</h4>
            <p>
              <strong>Service:</strong>{" "}
              {appointment.service || appointment.providerType}
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`${styles.status} ${getStatusColor(
                  appointment.status
                )}`}
              >
                {appointment.status}
              </span>
            </p>
          </div>

          <div className={styles.detailSection}>
            <h4>Time & Location</h4>
            <p>
              <strong>Date:</strong> {date}
            </p>
            <p>
              <strong>Time:</strong> {appointment.time || time}
            </p>
            {appointment.location && (
              <p>
                <strong>Location:</strong> {appointment.location}
              </p>
            )}
          </div>

          {appointment.reason && (
            <div className={styles.detailSection}>
              <h4>Appointment Details</h4>
              <p>
                <strong>Reason:</strong> {appointment.reason}
              </p>
              {appointment.healthIssues && (
                <p>
                  <strong>Health Notes:</strong> {appointment.healthIssues}
                </p>
              )}
              {appointment.notes && (
                <p>
                  <strong>Additional Notes:</strong> {appointment.notes}
                </p>
              )}
            </div>
          )}

          <div className={styles.detailSection}>
            <h4>Contact Information</h4>
            {isServiceProvider ? (
              <>
                <p>
                  <strong>Customer:</strong> {appointment.user?.name || "—"}
                </p>
                {appointment.user?.phone && (
                  <p>
                    <strong>Phone:</strong> {appointment.user.phone}
                  </p>
                )}
                {appointment.user?.email && (
                  <p>
                    <strong>Email:</strong> {appointment.user.email}
                  </p>
                )}
              </>
            ) : (
              <>
                <p>
                  <strong>Provider:</strong>{" "}
                  {appointment.providerId?.name || "—"}
                </p>
                {appointment.providerPhone && (
                  <p>
                    <strong>Phone:</strong> {appointment.providerPhone}
                  </p>
                )}
                {appointment.providerEmail && (
                  <p>
                    <strong>Email:</strong> {appointment.providerEmail}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>

          {isServiceProvider ? (
            <>
              {appointment.status === "pending" && (
                <button
                  className={styles.confirmButton}
                  onClick={() => onStatusChange(appointment, "confirmed")}
                >
                  <CheckCircle size={16} />
                  Confirm
                </button>
              )}

              {(appointment.status === "pending" ||
                appointment.status === "confirmed") && (
                <button
                  className={styles.completeButton}
                  onClick={() => onStatusChange(appointment, "completed")}
                >
                  <CheckCircle size={16} />
                  Completed
                </button>
              )}

              {(appointment.status === "pending" ||
                appointment.status === "confirmed") && (
                <button
                  className={styles.dangerButton}
                  onClick={() => onStatusChange(appointment, "cancelled")}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              )}
            </>
          ) : (
            <>
              {(appointment.status === "pending" ||
                appointment.status === "confirmed") && (
                <button
                  className={styles.dangerButton}
                  onClick={() => onStatusChange(appointment, "cancelled")}
                >
                  <XCircle size={16} />
                  Cancel Appointment
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
