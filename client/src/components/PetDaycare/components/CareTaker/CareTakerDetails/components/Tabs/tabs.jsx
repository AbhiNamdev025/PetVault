import React from "react";
import styles from "./tabs.module.css";

export default function Tabs({ tab, setTab }) {
  return (
    <div className={styles.tabs}>
      {["about", "skills", "availability", "reviews"].map((t) => (
        <button
          key={t}
          className={tab === t ? styles.activeTab : ""}
          onClick={() => setTab(t)}
        >
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
