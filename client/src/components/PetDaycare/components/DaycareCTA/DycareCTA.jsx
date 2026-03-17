import React from "react";
import styles from "./daycareCTA.module.css";
import { PawPrint } from "lucide-react";
import { Button, SectionHeader } from "../../../common";

const DaycareCTA = ({ onBookNow }) => {
  return (
    <section className={styles.cta}>
      <div className={styles.overlay}></div>
      <div className={styles.content}>
        <SectionHeader
          className={styles.ctaHeader}
          align="left"
          level="section"
          tone="inverse"
          icon={<PawPrint className={styles.titleIcon} />}
          title="Your Pet Deserves the Best Care"
          subtitle="Book a daycare slot today and let your furry friend enjoy a day filled with fun, comfort, and care."
        />
        <Button variant="primary" size="lg" onClick={onBookNow}>
          Book Now
        </Button>
      </div>
    </section>
  );
};

export default DaycareCTA;
