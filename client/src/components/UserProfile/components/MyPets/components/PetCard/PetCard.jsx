import React from "react";
import styles from "./PetCard.module.css";
import { Edit, Trash2, Activity, AlertCircle, RotateCcw } from "lucide-react";
import { BASE_URL } from "../../../../../../utils/constants";
import { Badge, Button } from "../../../../../common";

const PetCard = ({ pet, onEdit, onDelete, onView, onRestore }) => {
  const getAgeLabel = () => {
    if (pet.age) return `${pet.age} yrs`;
    if (pet.dob) {
      const dob = new Date(pet.dob);
      const today = new Date();
      let years = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        years -= 1;
      }
      return `${Math.max(0, years)} yrs`;
    }
    return "Age N/A";
  };
  const breedLabel = pet.breed || "Unknown Breed";
  const handleCardClick = () => {
    onView?.(pet);
  };
  const isArchived = pet.status === "archived";
  const acquisitionTypeRaw = String(pet?.acquisitionType || "")
    .trim()
    .toLowerCase();
  const hasOriginNgo = Boolean(pet?.originNgoId);
  const hasOriginShop = Boolean(pet?.originShopId);
  const acquisitionType =
    acquisitionTypeRaw === "adopted" || acquisitionTypeRaw === "bought"
      ? acquisitionTypeRaw
      : hasOriginNgo
        ? "adopted"
        : hasOriginShop
          ? "bought"
          : "";
  const acquisitionLabel =
    acquisitionType === "adopted"
      ? "Adopted"
      : acquisitionType === "bought"
        ? "Bought"
        : "";
  const acquisitionVariant =
    acquisitionType === "adopted" ? "success-soft" : "info-soft";

  return (
    <div
      className={`${styles.card} ${isArchived ? styles.archivedCard : ""}`}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className={styles.badges}>
        {isArchived && (
          <Badge size="sm" variant="danger-soft" className={styles.stateBadge}>
            Archived
          </Badge>
        )}
        {acquisitionLabel && (
          <Badge
            size="sm"
            variant={acquisitionVariant}
            className={styles.stateBadge}
          >
            {acquisitionLabel}
          </Badge>
        )}
      </div>
      <div className={styles.imageBox}>
        {pet.profileImage ? (
          <img
            src={`${BASE_URL}/uploads/pets/${pet.profileImage}`}
            alt={pet.name}
          />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{pet.name}</h3>
        <p className={styles.details}>
          {pet.species} • {breedLabel} • {getAgeLabel()}
        </p>

        <div className={styles.tags}>
          <Badge size="sm" variant="secondary" className={styles.tag}>
            {pet.gender}
          </Badge>
          {pet.weight && (
            <Badge size="sm" variant="secondary" className={styles.tag}>
              {pet.weight} kg
            </Badge>
          )}
          {pet.petId && (
            <Badge size="sm" variant="secondary" className={styles.tag}>
              {pet.petId}
            </Badge>
          )}
        </div>

        {(pet.medicalConditions?.length > 0 || pet.allergies?.length > 0) && (
          <div className={styles.healthSummary}>
            {pet.medicalConditions?.length > 0 && (
              <div className={styles.healthItem}>
                <Activity size={14} className={styles.healthIcon} />
                <span>{pet.medicalConditions.length} Condition(s)</span>
              </div>
            )}
            {pet.allergies?.length > 0 && (
              <div className={`${styles.healthItem} ${styles.allergyItem}`}>
                <AlertCircle size={14} className={styles.healthIcon} />
                <span>{pet.allergies.length} Allergy(s)</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {isArchived ? (
          <Button
            className={`${styles.restoreBtn} ${styles.iconBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              onRestore(pet);
            }}
            aria-label="Restore pet"
            title="Restore pet"
            variant="ghost"
          >
            <RotateCcw size={16} />
          </Button>
        ) : (
          <>
            <Button
              className={`${styles.editBtn} ${styles.iconBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(pet);
              }}
              aria-label="Edit pet"
              title="Edit pet"
              variant="ghost"
            >
              <Edit size={16} />
            </Button>
            <Button
              className={`${styles.delBtn} ${styles.iconBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(pet);
              }}
              aria-label="Delete pet"
              title="Archive pet"
              variant="ghost"
            >
              <Trash2 size={16} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
export default PetCard;
