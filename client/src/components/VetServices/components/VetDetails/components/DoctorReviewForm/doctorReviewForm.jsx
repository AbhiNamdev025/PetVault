import React from "react";
import styles from "./doctorReviewForm.module.css";
import { Star } from "lucide-react";

export default function DoctorReviewForm({
  formRating,
  setFormRating,
  formReview,
  setFormReview,
  submitReview,
  submitting,
}) {
  return (
    <div className={styles.reviewFormBox}>
      <h3>Write a Review</h3>

      <div className={styles.starRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={28}
            className={
              formRating >= s ? styles.starActive : styles.starInactive
            }
            onClick={() => setFormRating(s)}
          />
        ))}
      </div>

      <textarea
        className={styles.reviewTextarea}
        placeholder="Share your experience..."
        value={formReview}
        onChange={(e) => setFormReview(e.target.value)}
      />

      <button
        className={styles.submitReviewButton}
        onClick={submitReview}
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}
