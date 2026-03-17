import React from "react";
import styles from "./daycareHero.module.css";
import { PawPrint } from "lucide-react";
import { Button } from "../../../common";
const DaycareHero = ({
  onBookClick
}) => {
  return <section className={styles.heroSection}>
      <video className={styles.heroVideo} src="/hero.mp4" autoPlay loop muted playsInline />
      <div className={styles.heroOverlay}></div>

      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Give Your Pet a Day Full of{" "}
            <span className={styles.highlight}>Fun & Love</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Safe, playful, and loving daycare while you’re away.
          </p>

          <Button onClick={onBookClick} className={styles.ctaButton} variant="ghost" size="lg">
            Book a Daycare Slot <PawPrint size={20} />
          </Button>
        </div>
      </div>
    </section>;
};
export default DaycareHero;
