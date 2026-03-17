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
import { Button } from "../../../../../../common";
import { formatAvailabilityDays } from "../../../../../../../utils/weekday";
export default function InfoSection({
  caretaker,
  avg,
  setShowForm,
}) {
  const dailyRate = Number(
    caretaker.roleData?.hourlyRate ?? caretaker.roleData?.charges ?? 0,
  );
  const availabilityDayLabels = formatAvailabilityDays(
    caretaker.availability?.days || [],
  );

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hours = h % 12 || 12;
    return `${hours}:${(m || 0).toString().padStart(2, "0")} ${ampm}`;
  };
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
          <BadgeIndianRupee />{" "}
          {dailyRate > 0 ? `₹${dailyRate}/day` : "Price on request"}
        </span>

        <span>
          <MapPin /> {caretaker.roleData?.daycareName}
        </span>

        {availabilityDayLabels.length > 0 && (
          <span>
            <Calendar />
            Available: {availabilityDayLabels.join(", ")}
          </span>
        )}

        {caretaker.availability?.startTime && (
          <span>
            <Clock />
            {formatTime(caretaker.availability.startTime)} -{" "}
            {formatTime(caretaker.availability.endTime)}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          className={styles.bookBtn}
          onClick={() => setShowForm(true)}
          disabled={!caretaker.availability?.available}
          variant="primary"
          size="md"
        >
          {caretaker.availability?.available
            ? "Book Caretaker"
            : "Currently Unavailable"}
        </Button>

        <Button
          as="a"
          href={`tel:${caretaker.phone}`}
          className={styles.callBtn}
          variant="outline"
          size="md"
        >
          <Phone /> <span>Call</span>
        </Button>

        <Button
          as="a"
          href={`https://wa.me/${caretaker.phone}`}
          target="_blank"
          className={styles.wpBtn}
          variant="success"
          size="md"
        >
          <MessageCircle /> <span>WhatsApp</span>
        </Button>
      </div>
    </div>
  );
}
