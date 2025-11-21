import React from "react";
import styles from "./petCard.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PetCard = ({ pet, onView, onEnquiry }) => {
  const navigate = useNavigate();

  const handleShopClick = (e) => {
    e.stopPropagation();
    if (pet.shopId && pet.shopId._id) {
      navigate(`/shop/${pet.shopId._id}`);
    }
  };

  return (
    <div className={styles.petCard}>
      <div className={styles.imageContainer}>
        {pet.images && pet.images.length > 0 ? (
          <img
            src={`${BASE_URL}/uploads/pets/${pet.images?.[0]}`}
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
            {pet.available ? "Available" : "Sold"}
          </span>
        </div>
      </div>

      <div className={styles.petInfo}>
        <h3 className={styles.petName}>{pet.name}</h3>
        <p className={styles.breed}>{pet.breed}</p>

        {/* Shop Information */}
        {pet.shopId && (
          <div className={styles.shopInfo} onClick={handleShopClick}>
            <Store size={14} />
            <span className={styles.shopName}>
              {pet.shopId.businessName || pet.shopId.name || "Unknown Shop"}
            </span>
          </div>
        )}

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

        <div className={styles.priceSection}>
          <span className={styles.price}>Rs. {pet.price}</span>
          {!pet.available && <span className={styles.soldText}>Sold Out</span>}
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

export default PetCard;