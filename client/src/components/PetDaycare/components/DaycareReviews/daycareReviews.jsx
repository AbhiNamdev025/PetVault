import React from "react";
import styles from "./daycareReviews.module.css";
import { Star } from "lucide-react";

const daycareReviews = [
  {
    id: 1,
    name: "Neha Verma",
    pet: "Buddy (Beagle)",
    rating: 5,
    feedback:
      "Amazing daycare service! Buddy loves the play zones and returns home super happy every day.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTETgm6hzji6vdQb66BJXc38CV259i6jN4RBw&s",
  },
  {
    id: 2,
    name: "Rohit Singh",
    pet: "Mittens (Persian Cat)",
    rating: 4,
    feedback:
      "Very clean and well-managed daycare. The caretakers are gentle and send regular updates!",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC5-siCm47_RXFCGO5rTbi3EuHh_yS64vk5Q&s",
  },
  {
    id: 3,
    name: "Aarushi Patel",
    pet: "Max (Golden Retriever)",
    rating: 5,
    feedback:
      "Max enjoys every moment here! The staff is caring and professional. Highly recommended!",
    image:
      "https://thumbs.dreamstime.com/b/blunt-straight-haircut-woman-avatar-female-portrait-vector-blunt-straight-haircut-woman-avatar-female-portrait-vector-illustration-400698702.jpg",
  },
];

const DaycareReviews = () => {
  return (
    <section className={styles.reviewsSection}>
      <h2 className={styles.heading}>Pet Daycare Reviews 🐾</h2>
      <div className={styles.cardsContainer}>
        {daycareReviews.map((r) => (
          <div key={r.id} className={styles.card}>
            <div className={styles.header}>
              <img src={r.image} alt={r.name} className={styles.image} />
              <div>
                <h4 className={styles.name}>{r.name}</h4>
                <p className={styles.pet}>{r.pet}</p>
              </div>
            </div>

            <p className={styles.feedback}>"{r.feedback}"</p>

            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < r.rating ? "#fbbf24" : "none"}
                  stroke={i < r.rating ? "#fbbf24" : "#d1d5db"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DaycareReviews;
