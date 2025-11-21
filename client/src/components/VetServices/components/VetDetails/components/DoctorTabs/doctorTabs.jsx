import React from "react";
import styles from "./doctorTabs.module.css";

export default function DoctorTabs({ tab, setTab }) {
  return (
    <div className={styles.tabs}>
      <button
        className={tab === "about" ? styles.activeTab : ""}
        onClick={() => setTab("about")}
      >
        About
      </button>

      <button
        className={tab === "services" ? styles.activeTab : ""}
        onClick={() => setTab("services")}
      >
        Services
      </button>
      <button
        className={tab === "availability" ? styles.activeTab : ""}
        onClick={() => setTab("availability")}
      >
        Availability
      </button>

      <button
        className={tab === "reviews" ? styles.activeTab : ""}
        onClick={() => setTab("reviews")}
      >
        Reviews
      </button>
    </div>
  );
}
