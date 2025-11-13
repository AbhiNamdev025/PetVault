import React from "react";
import styles from "./vetReviews.module.css";
import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Riya Sharma",
    pet: "Bruno (Labrador)",
    rating: 5,
    feedback:
      "Dr. Aisha treated my dog Bruno with so much care. She explained everything clearly, and Bruno recovered so quickly!",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTETgm6hzji6vdQb66BJXc38CV259i6jN4RBw&s",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    pet: "Whiskers (Cat)",
    rating: 4,
    feedback:
      "Dr. Sneha was amazing with Whiskers! The clinic is so clean and friendly. Highly recommend their service.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC5-siCm47_RXFCGO5rTbi3EuHh_yS64vk5Q&s",
  },
  {
    id: 3,
    name: "Tanya Roy",
    pet: "Coco (Parrot)",
    rating: 5,
    feedback:
      "Dr. Karan is so gentle and knowledgeable about birds. Coco was completely calm during the checkup. Wonderful experience!",
    image:
      "https://thumbs.dreamstime.com/b/blunt-straight-haircut-woman-avatar-female-portrait-vector-blunt-straight-haircut-woman-avatar-female-portrait-vector-illustration-400698702.jpg",
  },
];

const VetReviews = () => {
  return (
    <section className={styles.reviewsSection}>
      <h2 className={styles.heading}>What Our Pet Parents Say 🐶</h2>
      <div className={styles.cardsContainer}>
        {reviews.map((r) => (
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

export default VetReviews;
