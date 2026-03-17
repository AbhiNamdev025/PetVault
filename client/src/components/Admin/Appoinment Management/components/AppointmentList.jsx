import React from "react";
import { Calendar } from "lucide-react";
import AppointmentCard from "../AppointmentCards/appointmentCard";
import styles from "../appointmentManagement.module.css";

const AppointmentList = ({
  appointments,
  onStatusUpdate,
  onViewDetails,
  onDelete,
}) => {
  if (appointments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Calendar size={48} className={styles.emptyIcon} />
        <h3>No Appointments Found</h3>
        <p>We couldn't find any appointments matching your filters.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <div className={styles.listHeader}>
        <div>Appointment</div>
        <div>Pet and Owner</div>
        <div>Status</div>
        <div>Schedule</div>
        <div className={styles.actionsHeader}>Actions</div>
      </div>
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment._id}
          appointment={appointment}
          onStatusUpdate={onStatusUpdate}
          onClick={() => onViewDetails(appointment)}
          onDelete={() => onDelete(appointment)}
        />
      ))}
    </div>
  );
};

export default AppointmentList;
