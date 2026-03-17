import React from "react";
import { Calendar, Clock, PawPrint, Stethoscope } from "lucide-react";
import styles from "../../appointmentDetailsModal.module.css";
import AppointmentStatusIcon from "./AppointmentStatusIcon";

const AppointmentDetailsBanner = ({ appointment, isMedical }) => {
  return (
    <div className={styles.banner}>
      <div className={styles.bannerIcon}>
        {isMedical ? <Stethoscope size={24} /> : <PawPrint size={24} />}
      </div>
      <div className={styles.headerInfo}>
        <div className={styles.topRow}>
          <h2 className={styles.orderId}>#{appointment?._id?.toUpperCase?.()}</h2>
          <span
            className={`${styles.statusBadge} ${styles[appointment?.status] || ""}`}
          >
            <AppointmentStatusIcon status={appointment?.status} />
            {appointment?.status}
          </span>
        </div>
        <div className={styles.metaRow}>
          <Calendar size={16} />
          <span>
            Appointment on{" "}
            {appointment?.date
              ? new Date(appointment.date).toLocaleDateString()
              : "Not set"}
          </span>
          <span className={styles.dot}>•</span>
          <Clock size={16} />
          <span>{appointment?.time || "Not set"}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.serviceTypeTag}>
            {(appointment?.service || "service").toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsBanner;
