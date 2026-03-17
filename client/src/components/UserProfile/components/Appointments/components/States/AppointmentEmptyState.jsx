import React from "react";
import { Calendar } from "lucide-react";
import styles from "../../appointments.module.css";

const AppointmentEmptyState = ({ activeTab }) => {
  return (
    <div className={styles.emptyState}>
      <Calendar size={48} />
      <h3>No {activeTab === "upcoming" ? "Upcoming" : "Past"} Appointments</h3>
      <p>
        {activeTab === "upcoming"
          ? "You don't have any upcoming appointments."
          : "No past appointments found."}
      </p>
    </div>
  );
};

export default AppointmentEmptyState;
