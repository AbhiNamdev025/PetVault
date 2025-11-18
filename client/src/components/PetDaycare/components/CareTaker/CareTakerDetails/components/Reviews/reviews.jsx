import React from "react";
import { Star } from "lucide-react";
import styles from "./reviews.module.css";

export default function Reviews({ caretaker }) {
  return (
    <>
      {caretaker.ratings?.length === 0 && <p>No reviews yet.</p>}

      {caretaker.ratings?.map((r, i) => (
        <div className={styles.reviewCard} key={i}>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={
                  r.rating >= s ? styles.starActive : styles.starInactive
                }
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
