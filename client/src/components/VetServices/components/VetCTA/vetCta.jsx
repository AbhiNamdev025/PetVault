import React from "react";
import styles from "./vetCTA.module.css";

const VetCTA = ({ onBookNow }) => {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.content}>
        <h2 className={styles.title}>Give Your Pet the Care They Deserve 🩺</h2>
        <p className={styles.subtitle}>
          Our experienced veterinarians are ready to help keep your furry
          friends healthy and happy. Book your appointment today!
        </p>
        <button className={styles.bookButton} onClick={onBookNow}>
          Book Appointment
        </button>
      </div>
    </section>
  );
};

export default VetCTA;
