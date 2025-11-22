import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MessageSquare,
  Phone,
  HeartPulse,
  X,
  MessageCircleCode,
  Hospital,
  PawPrint as PawIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import styles from "./vetAppointmentForm.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";

const petOptions = [
  { value: "Dog", label: "Dog", icon: "PawPrint" },
  { value: "Cat", label: "Cat", icon: "Cat" },
  { value: "Bird", label: "Bird", icon: "Feather" },
  { value: "Others", label: "Others", icon: "HelpCircle" },
];

const VetAppointmentForm = ({ doctorId, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [petImageFiles, setPetImageFiles] = useState([]);
  const [previewPetImages, setPreviewPetImages] = useState([]);

  const [formData, setFormData] = useState({
    providerType: "doctor",
    providerId: doctorId,
    service: "vet",
    petName: "",
    petType: "",
    parentPhone: "",
    date: "",
    time: "",
    reason: "",
    healthIssues: "",
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/doctor/${doctorId}`);
        const data = await res.json();
        setDoctor(data);
      } catch {
        toast.error("Failed to load doctor details");
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSelectPet = (value) =>
    setFormData((p) => ({ ...p, petType: value }));

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setPetImageFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewPetImages(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
      petImageFiles.forEach((file) => fd.append("petImages", file));

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Vet appointment booked successfully");
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

  const IconFor = (name, props = {}) => {
    const Comp = Icons[name];
    if (!Comp) return <span {...props} />;
    return <Comp {...props} />;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {doctor && (
          <div className={styles.doctorInfoBox}>
            <img
              src={
                doctor.avatar
                  ? `${BASE_URL}/uploads/avatars/${doctor.avatar}`
                  : doctor.roleData?.doctorImages?.[0] ||
                    "https://via.placeholder.com/300"
              }
              className={styles.doctorImg}
              alt={doctor.roleData?.doctorName}
            />

            <div className={styles.docDetails}>
              <h3 className={styles.docName}>
                <Stethoscope size={20} /> {doctor.roleData.doctorName}
              </h3>

              <p className={styles.docSpec}>
                {doctor.roleData.doctorSpecialization}
              </p>

              <p className={styles.docHospital}>
                <Hospital size={18} /> {doctor.roleData.hospitalName}
              </p>

              <p className={styles.docFee}>
                Fee: <strong>₹{doctor.roleData.consultationFee || 400}</strong>
              </p>
            </div>
          </div>
        )}

        <div className={styles.formHeader}>
          <h2 className={styles.title}>Book Appointment</h2>
          <p className={styles.subtitle}>Your pet deserves the best care</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
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

          <div className={styles.formGroup}>
            <label className={styles.label}>Pet Type</label>

            <div
              className={styles.petOptionsRow}
              role="radiogroup"
              aria-label="Pet Type"
            >
              {petOptions.map((opt) => {
                const selected = formData.petType === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    className={`${styles.petOption} ${
                      selected ? styles.petOptionActive : ""
                    }`}
                    onClick={() => handleSelectPet(opt.value)}
                    aria-pressed={selected}
                  >
                    <span className={styles.petIcon}>
                      {IconFor(opt.icon, { size: 18 })}
                    </span>
                    <span className={styles.petLabel}>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.placeholderRow}>
              {!formData.petType && (
                <span className={styles.placeholderText}>Select Pet Type</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Add Pet Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageSelect}
              className={styles.fileInput}
              accept="image/*"
            />

            {previewPetImages.length > 0 && (
              <div className={styles.previewRow}>
                {previewPetImages.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    className={styles.previewImg}
                    alt={`preview-${idx}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Parent Mobile</label>
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
            <label className={styles.label}>Health Issues</label>
            <div className={styles.inputWrapper}>
              <HeartPulse size={20} className={styles.inputIcon} />
              <textarea
                name="healthIssues"
                rows="2"
                value={formData.healthIssues}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Describe any health issues"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Reason for Visit</label>
            <div className={styles.inputWrapper}>
              <MessageSquare size={20} className={styles.inputIcon} />
              <textarea
                name="reason"
                rows="3"
                value={formData.reason}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="Describe reason for visit"
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

          <div className={styles.divider}></div>

          <a
            href={`${API_BASE_URL}/whatsapp/open`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
          >
            <MessageCircleCode size={20} className={styles.whatsappIcon} />
            Contact on WhatsApp
          </a>
        </form>
      </div>
    </div>
  );
};

export default VetAppointmentForm;
