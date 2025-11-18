import React from "react";
import styles from "./doctorImageSection.module.css";
import { BASE_URL } from "../../../../../../utils/constants";

export default function DoctorImageSection({ doctor, availabilityInfo }) {
  return (
    <div className={styles.leftImageBox}>
      <img
        src={
          doctor.avatar
            ? `${BASE_URL}/uploads/avatars/${doctor.avatar}`
            : doctor.roleData?.doctorImages?.[0] &&
              doctor.roleData.doctorImages[0].trim() !== ""
            ? doctor.roleData.doctorImages[0]
            : "https://static.vecteezy.com/system/resources/thumbnails/005/387/889/small/veterinary-doctor-doing-vaccination-for-dog-free-vector.jpg"
        }
        onError={(e) => {
          e.target.src =
            "https://static.vecteezy.com/system/resources/thumbnails/005/387/889/small/veterinary-doctor-doing-vaccination-for-dog-free-vector.jpg";
        }}
        alt={doctor.roleData?.doctorName}
        className={styles.doctorImage}
      />

      <div
        className={styles.availabilityBadge}
        style={{ borderColor: availabilityInfo.color }}
      >
        <span style={{ color: availabilityInfo.color }}>
          {availabilityInfo.text}
        </span>
      </div>
    </div>
  );
}
