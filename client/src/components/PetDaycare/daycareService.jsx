import React, { useState } from "react";
import DaycareHero from "./components/DaycareHero/daycareHero";
import DaycareFeatured from "./components/Featured/daycareFeatured";
import DaycareCTA from "./components/DaycareCTA/DycareCTA";
import ServiceBookingForm from "./components/ServicesBooking/serviceBookingForm";
import styles from "./daycareService.module.css";
import ServiceShowcase from "./components/Services Showcase/serviceShowcase";
import DaycareReviews from "./components/DaycareReviews/daycareReviews";
import CaretakerCards from "./components/CareTaker/CareTakerCards/caretakerCards";

const DaycareService = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleBookNow = (service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedService(null);
  };

  return (
    <>
      <DaycareHero />
      <CaretakerCards/>
      <ServiceShowcase onBookNow={handleBookNow} />
      <DaycareCTA />
      <DaycareFeatured />
      <DaycareReviews />

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeForm}>
              ✕
            </button>
            <ServiceBookingForm defaultService={selectedService?.type || ""} />
          </div>
        </div>
      )}
    </>
  );
};

export default DaycareService;
