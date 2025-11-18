import React from "react";
import {
  PawPrint,
  GraduationCap,
  BadgeIndianRupee,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageCircle,
} from "lucide-react";
import styles from "./infoSection.module.css";

export default function InfoSection({
  caretaker,
  avg,
  availabilityInfo,
  setShowForm,
}) {
  return (
    <div className={styles.rightBox}>
      <h2 className={styles.name}>
        <PawPrint /> {caretaker.name}
      </h2>

      <p className={styles.spec}>
        {caretaker.roleData?.staffSpecialization || "Pet Care Specialist"}
      </p>

      <div className={styles.ratingRow}>
        ⭐ {avg} ({caretaker.ratings?.length} reviews)
      </div>

      <div className={styles.infoList}>
        <span>
          <GraduationCap /> {caretaker.roleData?.staffExperience} years
        </span>

        <span>
          <BadgeIndianRupee /> {caretaker.roleData?.hourlyRate}/hour
        </span>

        <span>
          <MapPin /> {caretaker.roleData?.daycareName}
        </span>

        {caretaker.availability?.days && (
          <span>
            <Calendar />
            Available: {caretaker.availability.days.join(", ")}
          </span>
        )}

        {caretaker.availability?.startTime && (
          <span>
            <Clock />
            {caretaker.availability.startTime} -{" "}
            {caretaker.availability.endTime}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.bookBtn}
          onClick={() => setShowForm(true)}
          disabled={!caretaker.availability?.available}
        >
          {caretaker.availability?.available
            ? "Book Caretaker"
            : "Currently Unavailable"}
        </button>

        <a href={`tel:${caretaker.phone}`} className={styles.callBtn}>
          <Phone /> Call
        </a>

        <a
          href={`https://wa.me/${caretaker.phone}`}
          target="_blank"
          className={styles.wpBtn}
        >
          <MessageCircle /> WhatsApp
        </a>
      </div>
    </div>
  );
}
