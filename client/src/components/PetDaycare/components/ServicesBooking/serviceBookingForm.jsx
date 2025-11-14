import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  PawPrint,
  Scissors,
  Phone,
  HeartPulse,
  MessageSquare,
  List,
  X,
  MessageCircleCode,
} from "lucide-react";
import { toast } from "react-toastify";
import styles from "./serviceBookingForm.module.css";
import { API_BASE_URL } from "../../../../utils/constants";

const ServiceBookingForm = ({ defaultService = "", onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    service: defaultService,
    petName: "",
    petType: "",
    parentPhone: "",
    date: "",
    time: "",
    reason: "",
    healthIssues: "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, service: defaultService }));
  }, [defaultService]);

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
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Service booked successfully!");
        setFormData({
          service: "",
          petName: "",
          petType: "",
          parentPhone: "",
          date: "",
          time: "",
          reason: "",
          healthIssues: "",
        });
        onClose?.();
      } else {
        toast.error(data.message || "Failed to book service.");
      }
    } catch {
      toast.error("Error booking service. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={22} />
        </button>

        <div className={styles.formHeader}>
          <h2 className={styles.title}>Book a Service</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Service Type</label>
            <div className={styles.inputWrapper}>
              <List size={20} className={styles.inputIcon} />
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="">Select</option>
                <option value="daycare">Daycare</option>
                <option value="grooming">Grooming</option>
                <option value="training">Training</option>
                <option value="boarding">Boarding</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Pet Name</label>
            <div className={styles.inputWrapper}>
              <PawPrint size={20} className={styles.inputIcon} />
              <input
                type="text"
                name="petName"
                value={formData.petName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter your pet's name"
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Pet Type</label>
              <div className={styles.inputWrapper}>
                <Scissors size={20} className={styles.inputIcon} />
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
                  placeholder="10-digit number"
                  pattern="^[1-9][0-9]{9}$"
                  title="Must be 10 digits and not start with 0"
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Health Issues (if any)</label>
            <div className={styles.inputWrapper}>
              <HeartPulse size={20} className={styles.inputIcon} />
              <textarea
                name="healthIssues"
                rows="2"
                value={formData.healthIssues}
                onChange={handleChange}
                placeholder="Allergies, past injuries, special care needs..."
                className={styles.textarea}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Additional Note</label>
            <div className={styles.inputWrapper}>
              <MessageSquare size={20} className={styles.inputIcon} />
              <textarea
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                placeholder="e.g. preferred grooming style or details..."
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
              "Book Service"
            )}
          </button>
          <div className={styles.divider}>
            <a
              href={`${API_BASE_URL}/whatsapp/open`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              {" "}
              <MessageCircleCode size={20} className={styles.whatsappIcon} />
              Contact on WhatsApp
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceBookingForm;
