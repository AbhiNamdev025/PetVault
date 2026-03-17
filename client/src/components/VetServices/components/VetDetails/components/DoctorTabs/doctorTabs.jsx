import React from "react";
import styles from "./doctorTabs.module.css";
import { Button } from "../../../../../common";
export default function DoctorTabs({
  tab,
  setTab
}) {
  return <div className={styles.tabs}>
      <Button className={`${styles.tabButton} ${tab === "about" ? styles.activeTab : ""}`} onClick={() => setTab("about")} variant="ghost" size="sm">
        About
      </Button>

      <Button className={`${styles.tabButton} ${tab === "services" ? styles.activeTab : ""}`} onClick={() => setTab("services")} variant="ghost" size="sm">
        Services
      </Button>
      <Button className={`${styles.tabButton} ${tab === "availability" ? styles.activeTab : ""}`} onClick={() => setTab("availability")} variant="ghost" size="sm">
        Availability
      </Button>

      <Button className={`${styles.tabButton} ${tab === "reviews" ? styles.activeTab : ""}`} onClick={() => setTab("reviews")} variant="ghost" size="sm">
        Reviews
      </Button>
    </div>;
}
