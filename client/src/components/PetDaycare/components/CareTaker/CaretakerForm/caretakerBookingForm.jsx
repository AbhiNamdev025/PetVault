import React, { useState } from "react";
import * as Icons from "lucide-react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  HeartPulse,
  MessageSquare,
  X,
  MessageCircleCode,
  Handshake,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./caretakerBookingForm.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../../utils/constants";

const petOptions = [
  { value: "Dog", label: "Dog", icon: "PawPrint" },
  { value: "Cat", label: "Cat", icon: "Cat" },
  { value: "Bird", label: "Bird", icon: "Feather" },
  { value: "Others", label: "Others", icon: "HelpCircle" },
];

const CaretakerBookingForm = ({ caretaker, caretakerId, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    providerType: "caretaker",
    providerId: caretakerId,
    service: "daycare",
    petName: "",
    petType: "",
    parentPhone: "",
    date: "",
    time: "",
    reason: "",
    healthIssues: "",
  });

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelectPet = (value) =>
    setFormData((p) => ({ ...p, petType: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Caretaker appointment booked successfully");
        onClose?.();
      } else {
        toast.error(data.message || "Failed to book appointment");
      }
    } catch {
      toast.error("Error booking appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const avgRating = caretaker?.ratings?.length
    ? (
        caretaker.ratings.reduce((t, r) => t + r.rating, 0) /
        caretaker.ratings.length
      ).toFixed(1)
    : "No Ratings";

  const IconFor = (name, props = {}) => {
    const Comp = Icons[name];
    if (!Comp) return <span {...props} />;
    return <Comp {...props} />;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={22} />
        </button>

        <div className={styles.caretakerHeader}>
          <img
            src={
              caretaker?.avatar
                ? `${BASE_URL}/uploads/avatars/${caretaker.avatar}`
                : caretaker?.roleData?.serviceImages?.[0] ||
                  "https://images.seeklogo.com/logo-png/55/1/happy-dog-logo-png_seeklogo-556954.png"
            }
            className={styles.caretakerImage}
            alt={caretaker?.name}
          />

          <h2 className={styles.caretakerName}>
            <Handshake size={20} /> {caretaker?.name}
          </h2>

          <p className={styles.caretakerSpec}>
            {caretaker?.roleData?.staffSpecialization || "Pet Care Specialist"}
          </p>

          <div className={styles.ratingBox}>
            <Star size={18} /> {avgRating}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.serviceForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pet Name</label>
            <div className={styles.inputWrapper}>
              <User size={20} className={styles.inputIcon} />
              <input
                type="text"
                name="petName"
                value={formData.petName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter pet name"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Pet Type</label>

            <div className={styles.petOptionsRow}>
              {petOptions.map((option) => {
                const selected = formData.petType === option.value;

                return (
                  <button
                    type="button"
                    key={option.value}
                    className={`${styles.petOption} ${
                      selected ? styles.petOptionActive : ""
                    }`}
                    onClick={() => handleSelectPet(option.value)}
                  >
                    <span className={styles.petIcon}>
                      {IconFor(option.icon, { size: 18 })}
                    </span>
                    <span className={styles.petLabel}>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {!formData.petType && (
              <p className={styles.placeholderText}>Select Pet Type</p>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Parent Mobile Number</label>
              <div className={styles.inputWrapper}>
                <Phone size={20} className={styles.inputIcon} />
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Date</label>
              <div className={styles.inputWrapper}>
                <Calendar size={20} className={styles.inputIcon} />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Time</label>
              <div className={styles.inputWrapper}>
                <Clock size={20} className={styles.inputIcon} />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Health Issues</label>
            <div className={styles.inputWrapper}>
              <HeartPulse size={20} className={styles.inputIcon} />
              <textarea
                name="healthIssues"
                rows="2"
                value={formData.healthIssues}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Allergies, injuries, special needs..."
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Reason / Instructions</label>
            <div className={styles.inputWrapper}>
              <MessageSquare size={20} className={styles.inputIcon} />
              <textarea
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Why do you need a caretaker?"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.submitButton} ${
              isLoading ? styles.loading : ""
            }`}
          >
            {isLoading ? (
              <div className={styles.buttonSpinner}></div>
            ) : (
              "Book Caretaker"
            )}
          </button>

          <div className={styles.divider}>
            <a
              href={`https://wa.me/${caretaker?.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              <MessageCircleCode size={20} className={styles.whatsappIcon} />
              Contact on WhatsApp
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaretakerBookingForm;
