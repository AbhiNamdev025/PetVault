import React from "react";
import styles from "./petCard.module.css";
import { BASE_URL } from "../../../utils/constants";
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
        {pet.images?.length > 0 ? (
          <img
            src={`${BASE_URL}/uploads/pets/${pet.images[0]}`}
            alt={pet.name}
            className={styles.petImage}
          />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
      </div>

      <div className={styles.petInfo}>
        <h3 className={styles.petName}>{pet.name}</h3>
        <p className={styles.breed}>{pet.breed}</p>

        {pet.shopId && pet.shopId._id && (
          <div className={styles.shopInfo} onClick={handleShopClick}>
            <Store size={14} />
            <span className={styles.shopName}>{pet.shopId.name || "Shop"}</span>
          </div>
        )}

        <div className={styles.priceSection}>
          <span className={styles.price}>Rs. {pet.price}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.viewButton} onClick={() => onView(pet._id)}>
            View Details
          </button>
          <button
            className={styles.enquiryButton}
            onClick={() => onEnquiry(pet)}
          >
            Send Enquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
