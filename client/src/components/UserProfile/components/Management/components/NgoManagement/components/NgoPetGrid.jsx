import React from "react";
import styles from "../ngoManagement.module.css";
import NgoPetCard from "./NgoPetCard";

const NgoPetGrid = ({ pets, onEdit, onDelete, onSell, onViewAdoptedInfo }) => {
  return (
    <div className={styles.grid}>
      {pets.map((pet) => (
        <NgoPetCard
          key={pet._id}
          pet={pet}
          onEdit={onEdit}
          onDelete={onDelete}
          onSell={onSell}
          onViewAdoptedInfo={onViewAdoptedInfo}
        />
      ))}
    </div>
  );
};

export default NgoPetGrid;
