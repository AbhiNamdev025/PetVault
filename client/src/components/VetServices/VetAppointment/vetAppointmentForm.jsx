import React, { useState } from "react";
import {
  Calendar,
  Clock,
  PawPrint,
  User,
  Stethoscope,
  MessageSquare,
  Phone,
  HeartPulse,
} from "lucide-react";
import { toast } from "react-toastify";
import styles from "./vetAppointmentForm.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const VetAppointmentForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    petName: "",
    petType: "",
    parentPhone: "",
    date: "",
    time: "",
    reason: "",
    healthIssues: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
        body: JSON.stringify({ ...formData, service: "vet" }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Vet appointment booked successfully!");
        setFormData({
          petName: "",
          petType: "",
          parentPhone: "",
          date: "",
          time: "",
          reason: "",
          healthIssues: "",
        });
      } else {
        toast.error(data.message || "Failed to book appointment.");
      }
    } catch {
      toast.error("Error booking appointment. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.vetForm}>
      <div className={styles.formHeader}>
        <div className={styles.logo}>
          <Stethoscope className={styles.logoIcon} />
          <span>Vet Appointment</span>
        </div>
        <h2 className={styles.title}>Book a Vet Visit</h2>
        <p className={styles.subtitle}>Your pet deserves the best care 🩺</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Pet Name */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Pet Name</label>
          <div className={styles.inputWrapper}>
            <User size={20} className={styles.inputIcon} />
            <input
              type="text"
              name="petName"
              value={formData.petName}
              onChange={handleChange}
              placeholder="Enter pet name"
              className={styles.input}
              required
            />
          </div>
        </div>

        {/* Pet Type + Phone */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pet Type</label>
            <div className={styles.inputWrapper}>
              <PawPrint size={20} className={styles.inputIcon} />
              <select
                name="petType"
                value={formData.petType}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="">Select</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

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
                pattern="^[1-9][0-9]{9}$"
                title="Phone number must be 10 digits and not start with 0"
                required
              />
            </div>
          </div>
        </div>

        {/* Date + Time */}
        <div className={styles.row}>
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

        {/* Health Issues */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Health Issues (if any)</label>
          <div className={styles.inputWrapper}>
            <HeartPulse size={20} className={styles.inputIcon} />
            <textarea
              name="healthIssues"
              rows="2"
              value={formData.healthIssues}
              onChange={handleChange}
              placeholder="Describe allergies, injuries, or special care needs..."
              className={styles.textarea}
            />
          </div>
        </div>

        {/* Reason */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Reason for Visit</label>
          <div className={styles.inputWrapper}>
            <MessageSquare size={20} className={styles.inputIcon} />
            <textarea
              name="reason"
              rows="3"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. vaccination, general checkup, emergency..."
              className={styles.textarea}
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
            "Book Appointment"
          )}
        </button>
      </form>
    </div>
  );
};

export default VetAppointmentForm;
