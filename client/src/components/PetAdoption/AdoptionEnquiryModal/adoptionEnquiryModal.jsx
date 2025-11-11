import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "./adoptionEnquiryModal.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const EnquiryModal = ({ pet, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
            {pet.images && pet.images.length > 0 ? (
              <img
                src={`http://localhost:5000/uploads/pets/${pet.images?.[0]}`}
                alt={pet.name}
              />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
          </div>
          <div className={styles.petDetails}>
            <h3>{pet.name}</h3>
            <p>
              {pet.breed} • {pet.type}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.enquiryForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="^[1-9][0-9]{9}$"
              title="Phone number must be 10 digits and not start with 0"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your interest in this pet..."
              minLength={10}
              required
              style={{ resize: "none" }}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                "Send Enquiry"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnquiryModal;
