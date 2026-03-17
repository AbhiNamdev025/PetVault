import React from "react";
import styles from "./tabs.module.css";
import { Button } from "../../../../../../common";
export default function Tabs({
  tab,
  setTab
}) {
  return <div className={styles.tabs}>
      {["about", "skills", "availability", "reviews"].map(t => <Button key={t} className={`${styles.tabButton} ${tab === t ? styles.activeTab : ""}`} onClick={() => setTab(t)} variant="ghost" size="sm">
          {t[0].toUpperCase() + t.slice(1)}
        </Button>)}
    </div>;
}
