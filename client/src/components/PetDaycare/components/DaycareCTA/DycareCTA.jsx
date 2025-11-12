import React, { useState } from "react";
import styles from "./daycareCTA.module.css";
import { PawPrint } from "lucide-react";
import ServiceBookingForm from "../ServicesBooking/serviceBookingForm";

const DaycareCTA = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className={styles.cta}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <h2 className={styles.heading}>
            Your Pet Deserves the Best Care <PawPrint className={styles.icon} />
          </h2>
          <p className={styles.text}>
            Book a daycare slot today and let your furry friend enjoy a day
            filled with fun, comfort, and care.
          </p>
          <button onClick={() => setIsOpen(true)} className={styles.button}>
            Book Now
          </button>
        </div>
      </section>

      {isOpen && (
        <ServiceBookingForm
          defaultService="Daycare"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default DaycareCTA;
