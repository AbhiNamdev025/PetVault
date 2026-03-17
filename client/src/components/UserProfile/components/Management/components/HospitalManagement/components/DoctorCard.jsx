import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { BASE_URL } from "../../../../../../../utils/constants";
import styles from "../hospitalManagement.module.css";
import { Button } from "../../../../../../common";
import ManagementCard from "../../common/ManagementCard";

const DoctorCard = ({ doctor, onEdit, onDelete }) => {
  const avatarSrc = doctor.avatar
    ? `${BASE_URL}/uploads/avatars/${doctor.avatar}`
    : "https://cdn-icons-png.flaticon.com/512/387/387561.png";

  const actions = [
    <Button
      key="edit"
      className={styles.editBtn}
      onClick={() => onEdit(doctor)}
      variant="primary"
      size="md"
    >
      <Edit size={16} />
    </Button>,
    <Button
      key="delete"
      className={styles.delBtn}
      onClick={() => onDelete(doctor._id)}
      variant="danger"
      size="md"
    >
      <Trash2 size={16} />
    </Button>,
  ];

  return (
    <ManagementCard
      image={avatarSrc}
      title={doctor.roleData?.doctorName}
      subtitle={doctor.roleData?.doctorSpecialization || "Doctor"}
      price={`₹${doctor.roleData?.consultationFee || 0}`}
      badge={`Exp: ${doctor.roleData?.doctorExperience} yrs`}
      actions={actions}
    />
  );
};
export default DoctorCard;
