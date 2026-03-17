import React from "react";
import styles from "./vetCta.module.css";
import { Button, SectionHeader } from "../../../common";

const VetCTA = ({ onBookNow }) => {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.content}>
        <SectionHeader
          className={styles.contentHeader}
          tone="inverse"
          level="section"
          title="Give Your Pet the Care They Deserve"
          subtitle="Our experienced veterinarians are ready to help keep your furry friends healthy and happy. Book your appointment today."
        />
        <Button variant="primary" size="lg" onClick={onBookNow}>
          Book Appointment
        </Button>
      </div>
    </section>
  );
};

export default VetCTA;
