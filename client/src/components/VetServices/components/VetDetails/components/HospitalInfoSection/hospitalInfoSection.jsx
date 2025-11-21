import React from "react";
import styles from "./hospitalInfoSection.module.css";
import { Building2, MapPin, Star } from "lucide-react";
import { BASE_URL } from "../../../../../../utils/constants";
import { useNavigate } from "react-router-dom";

const HospitalInfoSection = ({ hospital }) => {
  const navigate = useNavigate();

  if (!hospital) return null;

  const avgRating =
    hospital.ratings?.length > 0
      ? (
          hospital.ratings.reduce((sum, r) => sum + r.rating, 0) /
          hospital.ratings.length
        ).toFixed(1)
      : "N/A";

  return (
    <div className={styles.hospitalCard}>
      <div className={styles.left}>
        <div className={styles.imageWrapper}>
          <img
            src={
              hospital.avatar
                ? `${BASE_URL}/uploads/avatars/${hospital.avatar}`
                : hospital.roleData?.hospitalImages?.[0]
                ? `${BASE_URL}/uploads/role/${hospital.roleData.hospitalImages[0]}`
                : "https://img.icons8.com/?size=512&id=99289&format=png"
            }
            alt={hospital.roleData?.hospitalName}
            className={styles.image}
          />
        </div>
      </div>

      <div className={styles.right}>
        <h3 className={styles.name}>
          <Building2 size={18} /> {hospital.roleData?.hospitalName}
        </h3>

        <p className={styles.description}>
          {hospital.roleData?.hospitalDescription ||
            "A trusted veterinary healthcare center."}
        </p>

        {hospital.address && (
          <p className={styles.address}>
            <MapPin size={16} />
            {hospital.address.street}, {hospital.address.city},{" "}
            {hospital.address.state}
          </p>
        )}

        <p className={styles.rating}>
          <Star size={16} fill="#facc15" />{" "}
          <span className={styles.ratingValue}>{avgRating}</span>{" "}
          <span className={styles.reviewsCount}>
            ({hospital.ratings?.length || 0} reviews)
          </span>
        </p>

        <button
          onClick={() => navigate(`/hospital/${hospital._id}`)}
          className={styles.viewBtn}
        >
          View Hospital Details →
        </button>
      </div>
    </div>
  );
};

export default HospitalInfoSection;
