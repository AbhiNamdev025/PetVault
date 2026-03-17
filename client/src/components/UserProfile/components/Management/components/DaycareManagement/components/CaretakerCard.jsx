import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { BASE_URL } from "../../../../../../../utils/constants";
import styles from "../daycareManagement.module.css";
import { Button } from "../../../../../../common";
import ManagementCard from "../../common/ManagementCard";

const CaretakerCard = ({ caretaker, onEdit, onDelete }) => {
  const avatarSrc = caretaker.avatar
    ? `${BASE_URL}/uploads/avatars/${caretaker.avatar}`
    : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";

  const actions = [
    <Button
      key="edit"
      className={styles.editBtn}
      onClick={() => onEdit(caretaker)}
      variant="primary"
      size="md"
    >
      <Edit size={16} />
    </Button>,
    <Button
      key="delete"
      className={styles.delBtn}
      onClick={() => onDelete(caretaker._id)}
      variant="danger"
      size="md"
    >
      <Trash2 size={16} />
    </Button>,
  ];

  return (
    <ManagementCard
      image={avatarSrc}
      title={caretaker.name}
      subtitle={caretaker.roleData?.staffSpecialization || "Caretaker"}
      badge={`Exp: ${caretaker.roleData?.staffExperience} yrs`}
      actions={actions}
    />
  );
};
export default CaretakerCard;
