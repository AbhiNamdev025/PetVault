import React from "react";
import styles from "./adoptionPetCard.module.css";

const AdoptionPetCard = ({ pet, onView, onEnquiry }) => {
  return (
    <div className={styles.petCard}>
      <div className={styles.imageContainer}>
        {pet.images && pet.images.length > 0 ? (
          <img
            src={`http://localhost:5000/uploads/pets/${pet.images?.[0]}`}
            alt={pet.name}
            className={styles.petImage}
          />
        ) : (
          <div className={styles.noImage}>
            <span>No Image</span>
          </div>
        )}

        <div className={styles.statusBadge}>
          <span
            className={`${styles.status} ${
              pet.available ? styles.available : styles.sold
            }`}
          >
            {pet.available ? "For Adoption" : "Adopted"}
          </span>
        </div>
      </div>

      <div className={styles.petInfo}>
        <h3 className={styles.petName}>{pet.name}</h3>
        <p className={styles.breed}>{pet.breed}</p>

        <div className={styles.details}>
          <span className={styles.detailItem}>
            <span className={styles.type}>{pet.type}</span>
          </span>
          <span className={styles.detailItem}>
            <span className={styles.gender}>{pet.gender}</span>
          </span>
          <span className={styles.detailItem}>
            <span className={styles.age}>
              {pet.age} {pet.ageUnit}
            </span>
          </span>
        </div>

        <div className={styles.actions}>
          <button className={styles.viewButton} onClick={() => onView(pet._id)}>
            View Details
          </button>
          {pet.available && (
            <button
              className={styles.enquiryButton}
              onClick={() => onEnquiry(pet)}
            >
              Send Enquiry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdoptionPetCard;
