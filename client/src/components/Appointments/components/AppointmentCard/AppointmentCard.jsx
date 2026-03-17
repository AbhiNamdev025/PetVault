import React from "react";
import { Calendar, Clock, PawPrint, FileText, XCircle, AlertTriangle } from "lucide-react";
import styles from "./appointmentCard.module.css";
import { BASE_URL } from "../../../../utils/constants";
import { Button } from "../../../common";

const formatCompactScheduleDates = (dates = []) => {
  if (!Array.isArray(dates) || dates.length === 0) return "";
  if (dates.length === 1) {
    return dates[0].toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }
  const firstDate = dates[0];
  const sameMonthYear = dates.every(dateValue => dateValue.getMonth() === firstDate.getMonth() && dateValue.getFullYear() === firstDate.getFullYear());
  if (sameMonthYear) {
    const days = dates.map(dateValue => dateValue.getDate()).join(",");
    const monthYear = firstDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
    return `${days} ${monthYear}`;
  }
  return dates.map(dateValue => dateValue.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })).join(", ");
};

const AppointmentCard = ({
  appointment,
  onCancel,
  onClick
}) => {
  const selectedDates = Array.isArray(appointment?.selectedDates)
    ? appointment.selectedDates
        .map(dateValue => new Date(dateValue))
        .filter(dateValue => !Number.isNaN(dateValue.getTime()))
        .sort((left, right) => left.getTime() - right.getTime())
    : [];
  const requestedDateCandidates = selectedDates.length > 0
    ? selectedDates
    : [new Date(appointment.date)].filter(dateValue => !Number.isNaN(dateValue.getTime()));
  const requestedOnLabel = `Requested on ${formatCompactScheduleDates(requestedDateCandidates) || "N/A"}`;
  const provider = appointment.providerId;
  const getStatusClass = status => {
    if (status === "pending") return styles.pending;
    if (status === "confirmed") return styles.confirmed;
    if (status === "completed") return styles.completed;
    if (status === "cancelled") return styles.cancelled;
    return "";
  };
  const providerName = appointment.providerType === "doctor" ? provider?.roleData?.doctorName : provider?.name;
  const providerSpec = appointment.providerType === "doctor" ? provider?.roleData?.doctorSpecialization : provider?.roleData?.staffSpecialization;
  const providerAvatar = provider?.avatar ? `${BASE_URL}/uploads/avatars/${provider.avatar}` : "https://www.shutterstock.com/image-vector/veterinarian-pets-smiling-male-doctor-260nw-2562782269.jpg";
  const canCancel = appointment.status === "pending";
  return <div className={styles.card} onClick={() => onClick(appointment)}>
      {/* Status + Service */}
      <div className={styles.cardHeader}>
        <span className={`${styles.statusBadge} ${getStatusClass(appointment.status)}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>

        <h3 className={styles.serviceType}>
          {appointment.service.charAt(0).toUpperCase() + appointment.service.slice(1)}
        </h3>
      </div>

      {/* Provider Section */}
      <div className={styles.providerBar}>
        <img src={providerAvatar} className={styles.providerImg} alt="Provider" />
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
          <span>{requestedOnLabel}</span>
        </div>

        <div className={styles.detail}>
          <Clock size={18} />
          <span>{appointment.time}</span>
        </div>

        <div className={styles.detail}>
          <FileText size={18} />
          <span>{appointment.reason}</span>
        </div>

        {appointment.status === "cancelled" && appointment.cancellationReason && <div className={`${styles.detail} ${styles.cancellationReason}`}>
            <AlertTriangle size={18} />
            <span>{appointment.cancellationReason}</span>
          </div>}
      </div>

      {canCancel && <Button onClick={e => {
      e.stopPropagation();
      onCancel(appointment._id);
    }} className={styles.cancelBtn} variant="ghost" size="md">
          <XCircle size={18} />
          Cancel Appointment
        </Button>}
    </div>;
};
export default AppointmentCard;
