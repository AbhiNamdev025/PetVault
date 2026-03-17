import React from "react";
import styles from "../../myPets.module.css";
import PetCard from "../PetCard/PetCard";

const PetGrid = ({ pets, onEdit, onDelete, onRestore, onView }) => {
  return (
    <div className={styles.grid}>
      {pets.map((pet) => (
        <PetCard
          key={pet._id}
          pet={pet}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default PetGrid;
