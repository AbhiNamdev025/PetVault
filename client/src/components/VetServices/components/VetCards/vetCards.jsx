import React, { useEffect, useState } from "react";
import styles from "./vetCards.module.css";
import {
  Stethoscope,
  GraduationCap,
  MapPin,
  Star,
  Shield,
  XCircle,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import { useNavigate } from "react-router-dom";

const VetCards = () => {
  const [vets, setVets] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctor`);
        const data = await res.json();

        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
          const A = a.ratings?.length
            ? a.ratings.reduce((t, r) => t + r.rating, 0) / a.ratings.length
            : 0;
          const B = b.ratings?.length
            ? b.ratings.reduce((t, r) => t + r.rating, 0) / b.ratings.length
            : 0;
          return B - A;
        });

        setVets(sorted);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVets();
  }, []);

  const goToDoctor = (doctor) => {
    navigate(`/doctor/${doctor._id}`, { state: { doctor } });
  };

  const getAvailabilityStatus = (vet) => {
    if (vet.availability?.available === false) {
      return {
        status: "unavailable",
        text: "Currently Unavailable",
        color: "#ef4444",
      };
    }

    return {
      status: "available",
      text: "Available Now",
      color: "#10b981",
    };
  };

  const visibleVets = showAll ? vets : vets.slice(0, 3);

  return (
    <section className={styles.vetCardsSection}>
      <h2 className={styles.heading}>Meet Our Trusted Veterinarians</h2>

      <div className={styles.cardsContainer}>
        {visibleVets.map((vet, index) => {
          const avgRating = vet.ratings?.length
            ? (
                vet.ratings.reduce((t, r) => t + r.rating, 0) /
                vet.ratings.length
              ).toFixed(1)
            : "No Ratings";

          const availability = getAvailabilityStatus(vet);

          return (
            <div
              key={vet._id}
              className={`${styles.card} ${
                index % 2 === 0 ? styles.normal : styles.reverse
              }`}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={
                    vet.avatar
                      ? `${BASE_URL}/uploads/avatars/${vet.avatar}`
                      : vet.roleData?.doctorImages?.[0]?.startsWith("http")
                      ? vet.roleData.doctorImages[0]
                      : "https://static.vecteezy.com/system/resources/thumbnails/005/387/889/small/veterinary-doctor-doing-vaccination-for-dog-free-vector.jpg"
                  }
                  onError={(e) => {
                    e.target.src =
                      "https://static.vecteezy.com/system/resources/thumbnails/005/387/889/small/veterinary-doctor-doing-vaccination-for-dog-free-vector.jpg";
                  }}
                  alt={vet.roleData?.doctorName}
                  className={styles.image}
                />

                <div
                  className={styles.availabilityBadge}
                  style={{ backgroundColor: availability.color }}
                >
                  {availability.status === "available" ? (
                    <Shield size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  <span>{availability.text}</span>
                </div>
              </div>

              <div className={styles.info}>
                <h3 className={styles.name}>
                  <Stethoscope /> {vet.roleData?.doctorName}
                </h3>

                <p className={styles.specialization}>
                  {vet.roleData?.doctorSpecialization}
                </p>

                <div className={styles.rowMeta}>
                  <div className={styles.lineItem}>
                    <GraduationCap size={18} />
                    {vet.roleData?.doctorExperience} yrs
                  </div>

                  <div className={styles.lineItem}>
                    <MapPin size={18} />
                    {vet.roleData?.hospitalName}
                  </div>

                  <div className={styles.lineItem}>
                    <span className={styles.ratingBox}>
                      <Star size={16} className={styles.ratingIcon} />
                      {avgRating}
                    </span>
                  </div>
                </div>

                <p className={styles.about}>
                  {vet.roleData?.serviceDescription}
                </p>

                <button
                  className={styles.bookButton}
                  onClick={() => goToDoctor(vet)}
                  disabled={vet.availability?.available === false}
                >
                  {vet.availability?.available === false
                    ? "Currently Unavailable"
                    : "View Details & Book"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {vets.length > 3 && !showAll && (
        <div className={styles.centerBtn}>
          <button
            className={styles.viewAllBtn}
            onClick={() => setShowAll(true)}
          >
            View All Veterinarians
          </button>
        </div>
      )}
    </section>
  );
};

export default VetCards;
