import React from "react";
import styles from "../hospitalManagement.module.css";
import DoctorCard from "./DoctorCard";

const DoctorGrid = ({ doctors, onEdit, onDelete }) => {
  return (
    <div className={styles.grid}>
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor._id}
          doctor={doctor}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DoctorGrid;
