import React from "react";
import styles from "./availabilityBadge";

export default function AvailabilityBadge({ availabilityInfo }) {
  return (
    <div
      className={styles.statusBadge}
      style={{ backgroundColor: availabilityInfo.color }}
    >
      {availabilityInfo.text}
    </div>
  );
}
