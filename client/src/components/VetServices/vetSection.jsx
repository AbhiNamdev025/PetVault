import React, { useState } from "react";
import VetHero from "./components/VetHero/vetHero";
import VetCards from "./components/VetCards/vetCards";
import VetAppointmentForm from "./components/VetAppointment/vetAppointmentForm";
import styles from "./vetSection.module.css";
import VetCTA from "./components/VetCTA/vetCta";
import VetReviews from "./components/VetReviews/vetReviews";
import VetFeatures from "./components/VetFeatures/vetFeatures";

const VetSection = () => {
  const [showForm, setShowForm] = useState(false);

  const handleBookNow = () => setShowForm(true);
  const closeForm = () => setShowForm(false);

  return (
    <>
      <VetHero onBookNow={handleBookNow} />
      <VetFeatures />
      <VetCTA onBookNow={handleBookNow} />

      <VetCards onBookNow={handleBookNow} />
      <VetReviews />

      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <button className={styles.closeButton} onClick={closeForm}>
              ✕
            </button>
            <VetAppointmentForm onClose={closeForm} />
          </div>
        </div>
      )}
    </>
  );
};

export default VetSection;
