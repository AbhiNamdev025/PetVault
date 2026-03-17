import React from "react";
import { Button } from "../../../../../common";
import styles from "../../appointments.module.css";

const AppointmentFilterSummary = ({ count, hasActiveFilters, onClear }) => {
  return (
    <div className={styles.filterSummary}>
      <span>
        Showing {count === 1 ? "1 appointment" : `${count} appointments`}
      </span>
    </div>
  );
};

export default AppointmentFilterSummary;
