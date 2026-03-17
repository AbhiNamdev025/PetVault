import React from "react";
import styles from "../daycareManagement.module.css";
import CaretakerCard from "./CaretakerCard";

const CaretakerGrid = ({ caretakers, onEdit, onDelete }) => {
  return (
    <div className={styles.grid}>
      {caretakers.map((caretaker) => (
        <CaretakerCard
          key={caretaker._id}
          caretaker={caretaker}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CaretakerGrid;
