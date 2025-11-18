import React, { useEffect, useState } from "react";
import styles from "./caretakerCards.module.css";
import { User2, MapPin, Star, Shield, XCircle } from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../../utils/constants";
import { useNavigate } from "react-router-dom";

const CaretakerCards = () => {
  const [caretakers, setCaretakers] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaretakers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/caretaker`);
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

        setCaretakers(sorted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCaretakers();
  }, []);

  const goToDetails = (c) => {
    navigate(`/caretaker/${c._id}`, { state: { caretaker: c } });
  };

  const getAvailabilityStatus = (caretaker) => {
    if (caretaker.availability?.available === false) {
      return {
        status: "unavailable",
        text: "Unavailable",
        color: "#ef4444",
      };
    }

    return {
      status: "available",
      text: "Available",
      color: "#10b981",
    };
  };

  const visibleCaretakers = showAll ? caretakers : caretakers.slice(0, 3);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Trusted Caretakers</h2>

      <div className={styles.grid}>
        {visibleCaretakers.map((c) => {
          const avg = c.ratings?.length
            ? (
                c.ratings.reduce((t, r) => t + r.rating, 0) / c.ratings.length
              ).toFixed(1)
            : "—";

          const availability = getAvailabilityStatus(c);

          return (
            <article key={c._id} className={styles.card}>
              <div className={styles.avatarWrap}>
                <img
                  src={
                    c.avatar
                      ? `${BASE_URL}/uploads/avatars/${c.avatar}`
                      : "https://images.seeklogo.com/logo-png/55/1/happy-dog-logo-png_seeklogo-556954.png"
                  }
                  alt={c.name}
                  className={styles.avatar}
                />

                {/* Availability Badge */}
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
              </div>

              <div className={styles.right}>
                <div className={styles.rowTop}>
                  <h3 className={styles.name}>{c.name}</h3>
                  <div className={styles.rating}>
                    <Star size={14} />
                    <span>{avg}</span>
                  </div>
                </div>

                <p className={styles.spec}>
                  {c.roleData?.staffSpecialization ||
                    c.roleData?.serviceType ||
                    "Pet Care"}
                </p>

                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <User2 size={14} />
                    <span>{c.roleData?.staffExperience ?? 0} yrs</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={14} />
                    <span>{c.roleData?.daycareName || "Independent"}</span>
                  </div>
                </div>

                <p className={styles.desc}>
                  {c.roleData?.serviceDescription
                    ? c.roleData.serviceDescription.slice(0, 120) +
                      (c.roleData.serviceDescription.length > 120 ? "…" : "")
                    : "Friendly caretaker for day visits, home visits and overnight stays."}
                </p>

                <div className={styles.actions}>
                  <button
                    className={styles.viewBtn}
                    onClick={() => goToDetails(c)}
                    disabled={c.availability?.available === false}
                  >
                    {c.availability?.available === false
                      ? "Currently Unavailable"
                      : "View & Book"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {caretakers.length > 3 && !showAll && (
        <div className={styles.centerBtn}>
          <button
            className={styles.viewAllBtn}
            onClick={() => setShowAll(true)}
          >
            View All
          </button>
        </div>
      )}
    </section>
  );
};

export default CaretakerCards;
