import React from "react";
import { Edit, Trash2, UserCheck, Eye } from "lucide-react";
import { BASE_URL } from "../../../../../../../utils/constants";
import styles from "../ngoManagement.module.css";
import { Button } from "../../../../../../common";
import ManagementCard from "../../common/ManagementCard";

const NgoPetCard = ({ pet, onEdit, onDelete, onSell, onViewAdoptedInfo }) => {
  const imageUrl = pet.images?.[0]
    ? `${BASE_URL}/uploads/pets/${pet.images[0]}`
    : null;
  const isAvailable = pet.available !== false;
  const adoptedByName = pet?.soldToUserId?.name || "Unknown user";
  const isAdopted = !isAvailable;
  const actionLabel = isAvailable ? "Mark Adopted" : "Adopted";

  const actions = [
    <Button
      key="edit"
      className={styles.editBtn}
      onClick={() => onEdit(pet)}
      variant="primary"
      size="md"
      disabled={!isAvailable}
      title={!isAvailable ? "Adopted pets cannot be edited" : "Edit pet"}
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
      title={!isAvailable ? "Adopted pets cannot be deleted" : "Delete pet"}
    >
      <Trash2 size={16} />
    </Button>,
  ];

  const overlay = isAdopted && (
    <div className={styles.soldOverlay}>
      <Eye size={13} />
      <span>Adopted · Click to view</span>
    </div>
  );

  const extraInfo = (
    <>
      {!isAvailable && (
        <p className={styles.soldMeta}>Adopted by: {adoptedByName}</p>
      )}
    </>
  );

  return (
    <ManagementCard
      image={imageUrl}
      title={pet.name}
      subtitle={pet.breed || pet.type || "Pet"}
      price={pet.category === "shop" ? `₹${pet.price}` : "For Adoption"}
      badge={isAvailable ? "Available" : "Adopted"}
      badgeVariant={isAvailable ? "success" : "danger"}
      actions={actions}
      isInactive={isAdopted}
      overlay={overlay}
      extraInfo={extraInfo}
      onClick={isAdopted ? () => onViewAdoptedInfo?.(pet) : undefined}
    />
  );
};

export default NgoPetCard;
