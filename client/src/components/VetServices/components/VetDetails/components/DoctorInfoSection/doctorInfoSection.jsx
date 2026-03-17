import React from "react";
import styles from "./doctorInfoSection.module.css";
import { Star, Stethoscope, GraduationCap, MapPin, Phone, MessageCircle, CheckCircle, Clock, Calendar } from "lucide-react";
import { Button } from "../../../../../common";
import { formatAvailabilityDays } from "../../../../../../utils/weekday";
export default function DoctorInfoSection({
  doctor,
  avgRating,
  onBookClick
}) {
  const availabilityDayLabels = formatAvailabilityDays(
    doctor.availability?.days || [],
  );

  const formatTime = time => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hours = h % 12 || 12;
    return `${hours}:${(m || 0).toString().padStart(2, "0")} ${ampm}`;
  };
  return <div className={styles.rightInfoBox}>
      <h2 className={styles.docName}>
        <Stethoscope /> {doctor.roleData?.doctorName}
      </h2>

      <p className={styles.docSpec}>{doctor.roleData?.doctorSpecialization}</p>

      <div className={styles.ratingRow}>
        <Star size={20} /> {avgRating}
        <span className={styles.reviewCount}>
          ({doctor.ratings?.length || 0} reviews)
        </span>
      </div>

      <div className={styles.infoList}>
        <span>
          <GraduationCap size={20} /> {doctor.roleData?.doctorExperience} years
          experience
        </span>
        <span>
          <MapPin size={20} /> {doctor.roleData?.hospitalName}
        </span>
        <span>
          <CheckCircle size={20} /> Fee: ₹
          {doctor.roleData?.consultationFee || 400}
        </span>

        {availabilityDayLabels.length > 0 && <span>
            <Calendar size={20} /> Available:{" "}
            {availabilityDayLabels.join(", ")}
          </span>}

        {doctor.availability?.startTime && doctor.availability?.endTime && <span>
            <Clock size={20} /> Timing:{" "}
            {formatTime(doctor.availability.startTime)} -{" "}
            {formatTime(doctor.availability.endTime)}
          </span>}

       
      </div>

      <div className={styles.actionButtons}>
        <Button className={styles.bookButton} onClick={onBookClick} disabled={doctor.availability?.available === false} variant="primary" size="md">
          {doctor.availability?.available ? "Book Appointment" : "Unavailable"}
        </Button>

        <Button as="a" href={`tel:${doctor.phone}`} className={styles.callButton} variant="outline" size="md">
          <Phone /> <span>Call</span>
        </Button>

        <Button as="a" href={`https://wa.me/${doctor.phone}`} target="_blank" className={styles.whatsappButton} variant="success" size="md">
          <MessageCircle /> <span>WhatsApp</span>
        </Button>
      </div>
    </div>;
}
