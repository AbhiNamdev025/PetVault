import React from "react";
import { Star } from "lucide-react";
import styles from "./reviewForm.module.css";

export default function ReviewForm({
  formRating,
  setFormRating,
  formReview,
  setFormReview,
  submitReview,
  submitting,
}) {
  return (
    <div className={styles.reviewForm}>
      <h3>Write a Review</h3>

      <div className={styles.starInputRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={28}
            className={formRating >= s ? styles.starActive : styles.starInactive}
            onClick={() => setFormRating(s)}
          />
        ))}
      </div>

      <textarea
        className={styles.textarea}
        placeholder="Share your experience..."
        value={formReview}
        onChange={(e) => setFormReview(e.target.value)}
      />

      <button
        className={styles.submitBtn}
        onClick={submitReview}
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}
