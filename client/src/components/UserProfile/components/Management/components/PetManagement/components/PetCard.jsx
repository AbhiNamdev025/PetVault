import React from "react";
import { Edit, Trash2, UserCheck, Eye } from "lucide-react";
import { API_BASE_URL } from "../../../../../../../utils/constants";
import styles from "../petManagement.module.css";
import { Button } from "../../../../../../common";
import ManagementCard from "../../common/ManagementCard";

const PetCard = ({ pet, onEdit, onDelete, onSell, onViewSoldInfo }) => {
  const imageUrl = pet.images?.[0]
    ? `${API_BASE_URL.replace("/api", "")}/uploads/pets/${pet.images[0]}`
    : null;

  const isAvailable = pet.available !== false;
  const isAdoption = pet.category === "adoption";
  const soldToName = pet?.soldToUserId?.name || "Unknown user";
  const isSoldOrAdopted = !isAvailable;

  const actionLabel = isAvailable
    ? isAdoption
      ? "Mark Adopted"
      : "Sell"
    : isAdoption
      ? "Adopted"
      : "Sold";

  const soldMetaLabel = isAdoption ? "Adopted by" : "Sold to";

  const actions = [
    <Button
      key="edit"
      className={styles.editBtn}
      onClick={() => onEdit(pet)}
      variant="primary"
      size="md"
      disabled={!isAvailable}
      title={
        !isAvailable
          ? `${isAdoption ? "Adopted" : "Sold"} pets cannot be edited`
          : "Edit pet"
      }
    >
      <Edit size={16} />
    </Button>,
    <Button
      key="sell"
      className={styles.sellBtn}
      onClick={() => onSell?.(pet)}
      variant="ghost"
      size="md"
      disabled={!isAvailable}
      title={actionLabel}
      aria-label={actionLabel}
    >
      <UserCheck size={16} />
    </Button>,
    <Button
      key="delete"
      className={styles.delBtn}
      onClick={() => onDelete(pet)}
      variant="danger"
      size="md"
      disabled={!isAvailable}
      title={
        !isAvailable
          ? `${isAdoption ? "Adopted" : "Sold"} pets cannot be deleted`
          : "Delete pet"
      }
    >
      <Trash2 size={16} />
    </Button>,
  ];

  const overlay = isSoldOrAdopted && (
    <div
      className={`${styles.soldOverlay} ${isAdoption ? styles.soldOverlayAdoption : styles.soldOverlaySold}`}
    >
      <Eye size={14} />
      <span>{isAdoption ? "Adopted" : "Sold"} · Click to view</span>
    </div>
  );

  const extraInfo = isSoldOrAdopted && (
    <p className={styles.soldMeta}>
      {soldMetaLabel}: <strong>{soldToName}</strong>
    </p>
  );

  return (
    <ManagementCard
      image={imageUrl}
      title={pet.name}
      subtitle={pet.type || pet.species || "Pet"}
      price={isAdoption ? null : `₹${pet.price}`}
      badge={
        isAvailable
          ? isAdoption
            ? "For Adoption"
            : "Available"
          : isAdoption
            ? "Adopted"
            : "Sold"
      }
      badgeVariant={isAvailable ? "success" : "danger"}
      actions={actions}
      isInactive={isSoldOrAdopted}
      overlay={overlay}
      extraInfo={extraInfo}
      onClick={isSoldOrAdopted ? () => onViewSoldInfo?.(pet) : undefined}
    />
  );
};

export default PetCard;
