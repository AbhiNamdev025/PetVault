import React from "react";
import styles from "../petManagement.module.css";
import PetCard from "./PetCard";

const PetGrid = ({
  pets,
  viewMode,
  baseUrl,
  onCardClick,
  onView,
  onDelete,
  onRestore,
  onShopClick,
}) => {
  return (
    <div className={styles.petsGrid}>
      {pets.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No pets found</p>
        </div>
      ) : (
        pets.map((pet) => (
          <PetCard
            key={pet._id}
            pet={pet}
            viewMode={viewMode}
            baseUrl={baseUrl}
            onCardClick={onCardClick}
            onView={onView}
            onDelete={onDelete}
            onRestore={onRestore}
            onShopClick={onShopClick}
          />
        ))
      )}
    </div>
  );
};

export default PetGrid;
