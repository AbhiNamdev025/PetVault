import React, { useEffect, useState } from "react";
import styles from "./vetCards.module.css";
import {
  Stethoscope,
  GraduationCap,
  MapPin,
  Star,
  Shield,
  XCircle,
  Hospital as HospitalIcon,
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
        const arr = Array.isArray(data) ? data : data.doctors || [];
        const sorted = arr.sort((a, b) => {
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

  const goToHospital = (hospitalId) => {
    if (!hospitalId) return;
    navigate(`/hospital/${hospitalId}`);
  };

  const getAvailabilityStatus = (vet) => {
    if (vet.availability?.available === false) {
      return {
        status: "unavailable",
        text: "Currently Unavailable",
        color: "#ef4444",
      };
    }
    return { status: "available", text: "Available Now", color: "#10b981" };
  };

  const visibleVets = showAll ? vets : vets.slice(0, 3);

  return (
    <section className={styles.vetCardsSection}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Meet Our Trusted Veterinarians</h2>
        <p className={styles.subheading}>
          Experienced professionals dedicated to your pet's health and wellbeing
        </p>
      </div>

      <div className={styles.cardsContainer}>
        {visibleVets.map((vet) => {
          const avgRating = vet.ratings?.length
            ? (
                vet.ratings.reduce((t, r) => t + r.rating, 0) /
                vet.ratings.length
              ).toFixed(1)
            : "No Ratings";
          const availability = getAvailabilityStatus(vet);
          const hospitalId =
            vet.roleData?.hospitalId || vet.roleData?.hospitalId;
          return (
            <div key={vet._id} className={styles.card}>
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
                    <Shield size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  <span>{availability.text}</span>
                </div>

                <div className={styles.ratingOverlay}>
                  <Star size={16} className={styles.ratingIcon} />
                  <span>{avgRating}</span>
                </div>
              </div>

              <div className={styles.info}>
                <div className={styles.doctorHeader}>
                  <h3 className={styles.name}>
                    <Stethoscope size={18} />{" "}
                    {vet.roleData?.doctorName || vet.name}
                  </h3>
                  <p className={styles.specialization}>
                    {vet.roleData?.doctorSpecialization}
                  </p>
                </div>

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <GraduationCap size={16} />
                    <span>{vet.roleData?.doctorExperience || "-"} yrs</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={16} />
                    <button
                      className={styles.hospitalBtn}
                      onClick={() => goToHospital(hospitalId)}
                    >
                      <HospitalIcon size={14} />{" "}
                      {vet.roleData?.hospitalName || "Hospital"}
                    </button>
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
