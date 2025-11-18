import React from "react";
import styles from "./doctorReviews.module.css";
import { Star } from "lucide-react";

export default function DoctorReviews({ doctor }) {
  return (
    <>
      {doctor.ratings?.length === 0 && <p>No reviews yet.</p>}

      {doctor.ratings?.map((r, i) => (
        <div className={styles.reviewCard} key={i}>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={r.rating >= s ? styles.starActive : styles.starInactive}
              />
            ))}
          </div>

          <p className={styles.reviewText}>{r.review}</p>

          <div className={styles.reviewDate}>
            {new Date(r.createdAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </>
  );
}
