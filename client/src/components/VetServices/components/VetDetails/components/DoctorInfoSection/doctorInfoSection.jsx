import React from "react";
import styles from "./doctorInfoSection.module.css";
import {
  Star,
  Stethoscope,
  GraduationCap,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";

export default function DoctorInfoSection({
  doctor,
  avgRating,
  setShowForm,
  availabilityInfo,
}) {
  return (
    <div className={styles.rightInfoBox}>
      <h2 className={styles.docName}>
        <Stethoscope /> {doctor.roleData?.doctorName}
      </h2>

      <p className={styles.docSpec}>
        {doctor.roleData?.doctorSpecialization}
      </p>

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

        {doctor.availability?.days?.length > 0 && (
          <span>
            <Calendar size={20} /> Available:{" "}
            {doctor.availability.days.join(", ")}
          </span>
        )}

        {doctor.availability?.startTime && doctor.availability?.endTime && (
          <span>
            <Clock size={20} /> Timing: {doctor.availability.startTime} -{" "}
            {doctor.availability.endTime}
          </span>
        )}

        {doctor.availability?.serviceRadius && (
          <span>
            <MapPin size={20} /> Service Radius:{" "}
            {doctor.availability.serviceRadius} km
          </span>
        )}
      </div>

      <div className={styles.actionButtons}>
        <button
          className={styles.bookButton}
          onClick={() => setShowForm(true)}
          disabled={doctor.availability?.available === false}
        >
          {doctor.availability?.available
            ? "Book Appointment"
            : "Unavailable"}
        </button>

        <a href={`tel:${doctor.phone}`} className={styles.callButton}>
          <Phone /> Call
        </a>

        <a
          href={`https://wa.me/${doctor.phone}`}
          target="_blank"
          className={styles.whatsappButton}
        >
          <MessageCircle /> WhatsApp
        </a>
      </div>
    </div>
  );
}
