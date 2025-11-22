import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "./adoptionEnquiryModal.module.css";
import { BASE_URL } from "../../../utils/constants";

const EnquiryModal = ({ pet, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Enquire about {pet.name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.petInfo}>
          <div className={styles.petImage}>
            {pet.images?.length > 0 ? (
              <img
                src={`${BASE_URL}/uploads/pets/${pet.images[0]}`}
                alt={pet.name}
              />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
          </div>

          <div className={styles.petDetails}>
            <h3>{pet.name}</h3>
            <p>{pet.breed} • {pet.type}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.enquiryForm}>
          <div className={styles.formGroup}>
            <label>Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="^[1-9][0-9]{9}$"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Preferred Date *</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Preferred Time *</label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Message *</label>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
              minLength={10}
              style={{ resize: "none" }}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} disabled={loading} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? <div className={styles.spinner}></div> : "Send Enquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnquiryModal;
