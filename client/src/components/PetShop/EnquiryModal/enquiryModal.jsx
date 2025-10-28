import React, { useState } from "react";
import { X } from "lucide-react";
import styles from "./enquiryModal.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const EnquiryModal = ({ pet, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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
            <p className={styles.price}>Rs. {pet.price}</p>
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
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Send Enquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnquiryModal;
