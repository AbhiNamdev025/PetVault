import React from "react";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  PawPrint,
  IndianRupee,
  User,
} from "lucide-react";
import { Modal } from "../../../../../../common";
import styles from "./soldInfoModal.module.css";

const formatDateTime = (dateStr) => {
  if (!dateStr) return { date: "—", time: "—" };
  const d = new Date(dateStr);
  if (isNaN(d)) return { date: "—", time: "—" };
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const formatRupee = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `₹${numeric.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const SoldAdoptedInfoModal = ({ pet, onClose }) => {
  const isAdoption = pet?.category === "adoption";
  const user = pet?.soldToUserId;
  const { date, time } = formatDateTime(pet?.soldAt);
  const totalPaid = formatRupee(pet?.price);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isAdoption ? "Adoption Details" : "Sale Details"}
      size="md"
    >
      {/* User card */}
      <div className={styles.userCard}>
        <div
          className={`${styles.avatar} ${isAdoption ? styles.avatarGreen : styles.avatarPurple}`}
        >
          {initials}
        </div>
        <div className={styles.userMeta}>
          <p className={styles.userName}>{user?.name || "Unknown User"}</p>
          <span
            className={`${styles.badge} ${isAdoption ? styles.badgeGreen : styles.badgePurple}`}
          >
            {isAdoption ? "Adopter" : "Buyer"}
          </span>
        </div>
      </div>

      {/* Contact + Date grid — 2 per row */}
      <div className={styles.infoGrid}>
        {/* Row 1: Name | Email */}
        <div className={styles.infoRow}>
          <User size={15} className={styles.icon} />
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>
              {isAdoption ? "Adopted By" : "Sold To"}
            </span>
            <span className={styles.infoValue}>
              {user?.name || "Unknown User"}
            </span>
          </div>
        </div>

        <div className={styles.infoRow}>
          <Mail size={15} className={styles.icon} />
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user?.email || "—"}</span>
          </div>
        </div>

        {/* Row 2: Phone | Amount (shop) or Date (adoption) */}
        <div className={styles.infoRow}>
          <Phone size={15} className={styles.icon} />
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{user?.phone || "—"}</span>
          </div>
        </div>

        {!isAdoption ? (
          <div className={styles.infoRow}>
            <IndianRupee size={15} className={styles.icon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Amount Paid</span>
              <span className={styles.infoValue}>{totalPaid}</span>
            </div>
          </div>
        ) : (
          <div className={styles.infoRow}>
            <Calendar size={15} className={styles.icon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Adoption Date</span>
              <span className={styles.infoValue}>{date}</span>
            </div>
          </div>
        )}

        {/* Row 3: Date (shop) + Time */}
        {!isAdoption && (
          <div className={styles.infoRow}>
            <Calendar size={15} className={styles.icon} />
            <div className={styles.infoText}>
              <span className={styles.infoLabel}>Sale Date</span>
              <span className={styles.infoValue}>{date}</span>
            </div>
          </div>
        )}

        <div className={styles.infoRow}>
          <Clock size={15} className={styles.icon} />
          <div className={styles.infoText}>
            <span className={styles.infoLabel}>Time</span>
            <span className={styles.infoValue}>{time}</span>
          </div>
        </div>
      </div>

      {/* Pet strip */}
      <div className={styles.petStrip}>
        <PawPrint size={13} className={styles.pawIcon} />
        <span className={styles.petName}>{pet?.name}</span>
        <span className={styles.petMeta}>
          {[pet?.breed, pet?.type].filter(Boolean).join(" · ")}
        </span>
      </div>
    </Modal>
  );
};

export default SoldAdoptedInfoModal;
