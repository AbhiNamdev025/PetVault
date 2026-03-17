import React from "react";
import { Trash2, Eye, Store, RotateCcw } from "lucide-react";
import styles from "../petManagement.module.css";
import { Button } from "../../../common";
const PetCard = ({
  pet,
  viewMode,
  baseUrl,
  onCardClick,
  onView,
  onDelete,
  onRestore,
  onShopClick,
}) => {
  return (
    <div className={styles.petCard} onClick={() => onCardClick(pet)}>
      <div className={styles.petImage}>
        {pet.images && pet.images.length > 0 ? (
          <img
            src={`${baseUrl}/uploads/pets/${pet.images?.[0]}`}
            alt={pet.name}
          />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
        <div className={styles.petStatus}>
          <span
            className={`${styles.status} ${pet.available ? styles.available : styles.sold}`}
          >
            {pet.available
              ? "Available"
              : pet.category === "shop"
                ? "Sold"
                : "Adopted"}
          </span>
        </div>
      </div>

      <div className={styles.petInfo}>
        <h3 className={styles.itemName}>{pet.name}</h3>
        <p className={styles.breed}>{pet.breed}</p>

        <div className={styles.details}>
          <span>{pet.age}mo</span>
          <span>{pet.gender}</span>
          <span>{pet.type}</span>
        </div>

        <div className={styles.infoRow}>
          {pet.shopId && (
            <div
              className={styles.shopInfo}
              onClick={(e) => {
                e.stopPropagation();
                onShopClick(pet);
              }}
              style={{
                cursor: "pointer",
              }}
            >
              <Store size={14} />
              <span className={styles.shopName}>
                {typeof pet.shopId === "object"
                  ? pet.shopId.name || pet.shopId._id
                  : pet.shopId}
              </span>
            </div>
          )}
          {pet.category === "shop" && (
            <div className={styles.price}>₹{pet.price}</div>
          )}
          {pet.category === "adoption" && (
            <div className={styles.adoptionText}>Free</div>
          )}
        </div>

        <div className={styles.actions}>
          {viewMode === "active" ? (
            <>
              <Button
                className={styles.viewBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onView(pet);
                }}
                variant="ghost"
                size="md"
              >
                <Eye size={16} />
                View
              </Button>
              <Button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(pet);
                }}
                variant="danger"
                size="md"
                disabled={!pet.available}
                title={
                  !pet.available ? "Sold pets cannot be deleted" : "Delete"
                }
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </>
          ) : (
            <Button
              className={styles.restoreBtn}
              onClick={(e) => {
                e.stopPropagation();
                onRestore(pet);
              }}
              variant="primary"
              size="md"
            >
              <RotateCcw size={16} /> Restore
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default PetCard;
