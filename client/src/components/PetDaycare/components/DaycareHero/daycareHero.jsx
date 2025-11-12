import React, { useState } from "react";
import styles from "./daycareHero.module.css";
import { PawPrint } from "lucide-react";
import ServiceBookingForm from "../ServicesBooking/serviceBookingForm";

const DaycareHero = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <section className={styles.hero}>
        <video
          className={styles.videoBg}
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={styles.overlay}></div>

        <div className={styles.content}>
          <h1 className={styles.title}>
            Give Your Pet a Day Full of Fun & Love
          </h1>
          <p className={styles.subtitle}>
            Safe, playful, and loving daycare while you’re away.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className={styles.ctaButton}
          >
            Book a Daycare Slot <PawPrint size={20} />
          </button>
        </div>
      </section>

      {showForm && (
        <ServiceBookingForm
          defaultService="Daycare"
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default DaycareHero;
