import React from "react";
import PetCard from "../PetCard/petCard";
import styles from "./petGrid.module.css";
import { PawPrint } from "lucide-react";

const PetGrid = ({ pets, onViewPet, onEnquiry, loading }) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading adorable pets...</p>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div >
          <PawPrint  size={50} />
        </div>
        <h3>No Pets Found</h3>
        <p>We couldn't find any pets matching your criteria.</p>
        <p>Try adjusting your filters or check back later!</p>
      </div>
    );
  }

  return (
    <div className={styles.petGrid}>
      {pets.map((pet) => (
        <PetCard
          key={pet._id}
          pet={pet}
          onView={onViewPet}
          onEnquiry={onEnquiry}
        />
      ))}
    </div>
  );
};

export default PetGrid;
