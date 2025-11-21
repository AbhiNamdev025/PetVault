import React from "react";
import styles from "./adoptionPetCard.module.css";
import { BASE_URL } from "../../../utils/constants";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdoptionPetCard = ({ pet, onView, onEnquiry }) => {
  const navigate = useNavigate();

  const handleNgoClick = (e) => {
    e.stopPropagation();
    if (pet.ngoId && pet.ngoId._id) {
      navigate(`/ngo/${pet.ngoId._id}`);
    }
  };

  return (
    <div className={styles.petCard}>
      <div className={styles.imageContainer}>
        {pet.images && pet.images.length > 0 ? (
          <img
            src={`${BASE_URL}/uploads/pets/${pet.images[0]}`}
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

        {pet.ngoId && (
          <div className={styles.shopInfo} onClick={handleNgoClick}>
            <Store size={14} />
            <span className={styles.shopName}>
              {pet.ngoId.businessName || pet.ngoId.name || "NGO"}
            </span>
          </div>
        )}

        <div className={styles.details}>
          <span className={styles.detailItem}>{pet.type}</span>
          <span className={styles.detailItem}>{pet.gender}</span>
          <span className={styles.detailItem}>
            {pet.age} {pet.ageUnit}
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
