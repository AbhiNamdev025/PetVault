import React from "react";
import { Calendar, Clock, PawPrint, FileText, XCircle } from "lucide-react";
import styles from "./appointmentCard.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";

const AppointmentCard = ({ appointment, onCancel }) => {
  const provider = appointment.providerId;

  const getStatusClass = (status) => {
    if (status === "pending") return styles.pending;
    if (status === "confirmed") return styles.confirmed;
    if (status === "completed") return styles.completed;
    if (status === "cancelled") return styles.cancelled;
    return "";
  };

  const providerName =
    appointment.providerType === "doctor"
      ? provider?.roleData?.doctorName
      : provider?.name;

  const providerSpec =
    appointment.providerType === "doctor"
      ? provider?.roleData?.doctorSpecialization
      : provider?.roleData?.staffSpecialization;

  const providerAvatar = provider?.avatar
    ? `${BASE_URL}/uploads/avatars/${provider.avatar}`
    : "https://www.shutterstock.com/image-vector/veterinarian-pets-smiling-male-doctor-260nw-2562782269.jpg";

  const canCancel = ["pending", "confirmed"].includes(appointment.status);

  return (
    <div className={styles.card}>
      {/* Status + Service */}
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

      {/* Provider Section */}
      <div className={styles.providerBar}>
        <img
          src={providerAvatar}
          className={styles.providerImg}
          alt="Provider"
        />
        <div>
          <h4 className={styles.providerName}>{providerName}</h4>
          <p className={styles.providerInfo}>{providerSpec}</p>
        </div>
      </div>

      {/* Appointment Body */}
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
            <span>Health: {appointment.healthIssues || "Healthy"}</span>
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
