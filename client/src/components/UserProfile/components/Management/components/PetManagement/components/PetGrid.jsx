import React from "react";
import styles from "../petManagement.module.css";
import PetCard from "./PetCard";

const PetGrid = ({ pets, onEdit, onDelete, onSell, onViewSoldInfo }) => {
  return (
    <div className={styles.grid}>
      {pets.map((pet) => (
        <PetCard
          key={pet._id}
          pet={pet}
          onEdit={onEdit}
          onDelete={onDelete}
          onSell={onSell}
          onViewSoldInfo={onViewSoldInfo}
        />
      ))}
    </div>
  );
};

export default PetGrid;
