import React, { useEffect, useState } from "react";
import styles from "./caretakerCards.module.css";
import { User2, MapPin, Star, Shield, XCircle, Building } from "lucide-react";
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
        
        // Fetch daycare details for caretakers who have daycareId
        const caretakersWithDaycare = await Promise.all(
          (Array.isArray(data) ? data : []).map(async (caretaker) => {
            if (caretaker.roleData?.daycareId) {
              try {
                const daycareRes = await fetch(`${API_BASE_URL}/daycare/${caretaker.roleData.daycareId}`);
                if (daycareRes.ok) {
                  const daycareData = await daycareRes.json();
                  return {
                    ...caretaker,
                    roleData: {
                      ...caretaker.roleData,
                      daycareName: daycareData.businessName || daycareData.name
                    }
                  };
                }
              } catch (err) {
                console.error("Failed to fetch daycare:", err);
              }
            }
            return caretaker;
          })
        );

        const sorted = caretakersWithDaycare.sort((a, b) => {
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
        console.error("Failed to fetch caretakers:", err);
      }
    };
    fetchCaretakers();
  }, []);

  const goToDetails = (c) => navigate(`/caretaker/${c._id}`, { state: { caretaker: c } });
  
  const goToDaycare = (id, e) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/daycare/${id}`);
  };

  const getAvailabilityStatus = (c) => {
    if (c.availability?.available === false) {
      return { status: "unavailable", text: "Unavailable", color: "#ef4444" };
    }
    return { status: "available", text: "Available", color: "#10b981" };
  };

  const visibleCaretakers = showAll ? caretakers : caretakers.slice(0, 3);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Trusted Caretakers</h2>

      <div className={styles.grid}>
        {visibleCaretakers.map((c) => {
          const avg = c.ratings?.length
            ? (c.ratings.reduce((t, r) => t + r.rating, 0) / c.ratings.length).toFixed(1)
            : "—";

          const availability = getAvailabilityStatus(c);
          const hasDaycare = !!c.roleData?.daycareId;
          const daycareName = c.roleData?.daycareName;

          return (
            <article key={c._id} className={styles.card} onClick={() => goToDetails(c)}>
              <div className={styles.imageWrapper}>
                <img
                  src={
                    c.avatar
                      ? `${BASE_URL}/uploads/avatars/${c.avatar}`
                      : "https://images.seeklogo.com/logo-png/55/1/happy-dog-logo-png_seeklogo-556954.png"
                  }
                  alt={c.name}
                  className={styles.image}
                />
                <div className={styles.availabilityBadge} style={{ backgroundColor: availability.color }}>
                  {availability.status === "available" ? <Shield size={14} /> : <XCircle size={14} />}
                  <span>{availability.text}</span>
                </div>
                <div className={styles.ratingOverlay}>
                  <Star size={14} />
                  <span>{avg}</span>
                </div>
              </div>

              <div className={styles.info}>
                <h3 className={styles.name}>{c.name}</h3>
                <p className={styles.specialization}>
                  {c.roleData?.staffSpecialization || "Pet Care"}
                </p>

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <User2 size={14} />
                    <span>{c.roleData?.staffExperience ?? 0} yrs</span>
                  </div>

                  <div 
                    className={`${styles.metaItem} ${hasDaycare ? styles.daycareItem : ''}`}
                    onClick={(e) => hasDaycare && goToDaycare(c.roleData.daycareId, e)}
                  >
                    {hasDaycare ? <Building size={14} /> : <MapPin size={14} />}
                    <span>
                      {hasDaycare ? (daycareName || "View Daycare") : "Independent"}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.bookButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToDetails(c);
                  }}
                  disabled={c.availability?.available === false}
                >
                  {c.availability?.available === false ? "Unavailable" : "View Profile"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {caretakers.length > 3 && !showAll && (
        <div className={styles.centerBtn}>
          <button className={styles.viewAllBtn} onClick={() => setShowAll(true)}>
            View All
          </button>
        </div>
      )}
    </section>
  );
};

export default CaretakerCards;