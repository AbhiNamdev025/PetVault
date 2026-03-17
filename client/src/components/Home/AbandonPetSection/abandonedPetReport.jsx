import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Phone,
  Camera,
  Send,
  Calendar,
  Clock,
  User,
  Trash2,
  X,
  Dog,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../../utils/constants";
import { openAuthModal } from "../../../utils/authModalNavigation";
import styles from "./abandonedPetReport.module.css";
import Button from "../../common/Button/Button";
import Modal from "../../common/Modal/Modal";
import Select from "../../common/Select/Select";
import Input from "../../common/Input/Input";
import Textarea from "../../common/Textarea/Textarea";
import SectionHeader from "../../common/SectionHeader/SectionHeader";
const AbandonedPetReportSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const getStoredUser = useCallback(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user") || "null") ||
        JSON.parse(sessionStorage.getItem("user") || "null")
      );
    } catch {
      return null;
    }
  }, []);

  const [formData, setFormData] = useState({
    petName: "",
    petType: "Dog",
    contactName: "",
    parentPhone: "",
    date: "",
    time: "",
    healthIssues: "",
    reason: "",
    petImages: [],
  });
  const [ngos, setNgos] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const getAuthToken = useCallback(
    () => localStorage.getItem("token") || sessionStorage.getItem("token"),
    [],
  );

  const fetchNgos = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/ngo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNgos(data);
        if (data.length > 0) {
          setSelectedNgo(data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching NGOs:", error);
      toast.error("Failed to load NGOs");
    }
  }, [getAuthToken]);
  useEffect(() => {
    if (!showForm) return;

    const user = getStoredUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contactName: user.name || prev.contactName,
        parentPhone:
          user.phone || user.mobile || user.phoneNumber || prev.parentPhone,
      }));
    }

    fetchNgos();
  }, [showForm, fetchNgos, getStoredUser]);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...formData.petImages, ...files].slice(0, 3);
    setFormData({
      ...formData,
      petImages: newImages,
    });
  };
  const removeImage = (index) => {
    const newImages = formData.petImages.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      petImages: newImages,
    });
  };
  const handleOpenForm = () => {
    const token = getAuthToken();
    if (!token) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }
    setIsSubmitted(false);
    setFormErrors({});
    setShowForm(true);
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.contactName.trim()) {
      errors.contactName = "Reporter name is required";
    }
    if (!formData.parentPhone.trim()) {
      errors.parentPhone = "Phone number is required";
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.parentPhone.trim().replace(/\s/g, ""))) {
        errors.parentPhone = "Please enter a valid 10-digit phone number";
      }
    }
    if (!selectedNgo) {
      errors.selectedNgo = "Please select an NGO";
    }
    if (!formData.date) {
      errors.date = "Select the date spotted";
    }
    if (!formData.time) {
      errors.time = "Select the time spotted";
    }
    if (!formData.reason.trim()) {
      errors.reason = "Rescue details/location is required";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getAuthToken();
    if (!token) {
      openAuthModal(navigate, {
        location,
        view: "login",
        from: location.pathname,
      });
      return;
    }

    if (!validateForm()) return;

    if (!selectedNgo) {
      toast.error("No NGOs available for reporting. Please try again later.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append("providerType", "ngo");
      formDataToSend.append("providerId", selectedNgo);
      formDataToSend.append("service", "others");
      formDataToSend.append("contactName", formData.contactName);
      formDataToSend.append(
        "petName",
        formData.petName || "Unknown Abandoned Pet",
      );
      formDataToSend.append("petType", formData.petType);
      formDataToSend.append("parentPhone", formData.parentPhone);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("healthIssues", formData.healthIssues);
      formDataToSend.append(
        "reason",
        formData.reason || "Abandoned pet found - needs rescue",
      );

      // Append images
      formData.petImages.forEach((image) => {
        formDataToSend.append("petImages", image);
      });

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Report submitted successfully! NGO will contact you soon.",
        );
        setIsSubmitted(true);
        setFormData({
          petName: "",
          petType: "Dog",
          parentPhone: "",
          date: "",
          time: "",
          healthIssues: "",
          reason: "",
          petImages: [],
        });
        setSelectedNgo(ngos[0]?._id || "");
        setTimeout(() => {
          setShowForm(false);
          setIsSubmitted(false);
        }, 3000);
      } else {
        toast.error(data.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className={styles.reportSection}>
      <div className={styles.container}>
        <SectionHeader
          className={styles.header}
          align="center"
          level="section"
          icon={<User size={32} className={styles.titleIcon} />}
          title="Help Abandoned Pets"
          subtitle="See an abandoned pet in need? Report it and help us connect them with nearby NGOs for rescue and care."
        />

        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <MapPin size={24} />
            </div>
            <h3>Spot & Report</h3>
            <p>
              If you see an abandoned pet in your area, report their location
              and condition
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <Phone size={24} />
            </div>
            <h3>NGO Support</h3>
            <p>
              Your report will be sent to nearby animal welfare NGOs for
              immediate action
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.cardIcon}>
              <Camera size={24} />
            </div>
            <h3>Photo Evidence</h3>
            <p>
              Upload photos to help NGOs identify and locate the animal quickly
            </p>
          </div>
        </div>
        <div className={styles.wrapperBtn}>
          <Button variant="primary" size="lg" onClick={handleOpenForm}>
            <MapPin size={20} />
            Report Abandoned Pet
          </Button>
        </div>
      </div>

      {/* Form Popup */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={!isSubmitted ? "Report Abandoned Pet" : ""}
        showCloseButton={!isSubmitted}
        className={`${styles.reportModal} ${isSubmitted ? styles.successModal : ""}`}
        hideContentPaddingOnMobile
        footer={
          !isSubmitted && (
            <div className={styles.formActions}>
              <Button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                variant="ghost"
                size="md"
              >
                Cancel
              </Button>
              <Button
                form="abandonPetReportForm"
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
                variant="primary"
                size="md"
              >
                {isSubmitting ? (
                  <span className={styles.spinner}></span>
                ) : (
                  <>
                    <Send size={20} />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          )
        }
      >
        {!isSubmitted ? (
          <form
            id="abandonPetReportForm"
            className={styles.reportForm}
            onSubmit={handleSubmit}
          >
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <Input
                  type="text"
                  id="petName"
                  label="Pet Name (Optional)"
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  placeholder="e.g. Blacky, Goldy..."
                  icon={<Dog size={18} />}
                  error={formErrors.petName}
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Select
                  label="Pet Type"
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  fullWidth
                  className={styles.selectField}
                  icon={<Dog size={18} />}
                  error={formErrors.petType}
                  options={[
                    { label: "Dog", value: "Dog" },
                    { label: "Cat", value: "Cat" },
                    { label: "Bird", value: "Bird" },
                    { label: "Other", value: "Other" },
                  ]}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="text"
                  id="contactName"
                  label="Your Name"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  icon={<User size={18} />}
                  required
                  disabled
                  error={formErrors.contactName}
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="tel"
                  id="parentPhone"
                  name="parentPhone"
                  label="Your Phone Number"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  icon={<Phone size={18} />}
                  required
                  disabled
                  error={formErrors.parentPhone}
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  label="Date Spotted"
                  value={formData.date}
                  onChange={handleChange}
                  icon={<Calendar size={18} />}
                  required
                  error={formErrors.date}
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="time"
                  id="time"
                  name="time"
                  label="Time Spotted"
                  value={formData.time}
                  onChange={handleChange}
                  icon={<Clock size={18} />}
                  required
                  error={formErrors.time}
                  fullWidth
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <Select
                label="Select NGO for Rescue"
                value={selectedNgo}
                onChange={(e) => setSelectedNgo(e.target.value)}
                icon={<Send size={18} />}
                required
                fullWidth
                error={formErrors.selectedNgo}
                className={styles.selectField}
                options={ngos.map((ngo) => ({
                  label: ngo.name,
                  value: ngo._id,
                }))}
              />
            </div>

            <div className={styles.formGroup}>
              <Textarea
                id="healthIssues"
                label="Health Issues (if any)"
                name="healthIssues"
                value={formData.healthIssues}
                onChange={handleChange}
                placeholder="e.g. Limping, looking skinny, injured..."
                rows={2}
                error={formErrors.healthIssues}
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <Textarea
                id="reason"
                label="Rescue Details / Location"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Provide landmark or location details..."
                required
                rows={3}
                error={formErrors.reason}
                fullWidth
              />
            </div>

            <div className={styles.imageUploadSection}>
              <label>Upload Pet Images (Max 3)</label>
              <div className={styles.imageUploadArea}>
                <input
                  type="file"
                  id="petImages"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                  disabled={formData.petImages.length >= 3}
                />
                <label htmlFor="petImages" className={styles.uploadLabel}>
                  <Camera size={32} />
                  <span>Click to upload photos</span>
                  <small>Help NGOs identify the pet</small>
                </label>
              </div>

              {formData.petImages.length > 0 && (
                <div className={styles.imagePreview}>
                  <h4>Selected Images</h4>
                  <div className={styles.imageGrid}>
                    {formData.petImages.map((image, index) => (
                      <div key={index} className={styles.imageItem}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className={styles.previewImage}
                        />
                        <Button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => removeImage(index)}
                          variant="danger"
                          size="sm"
                          aria-label="Remove image"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <Check size={40} strokeWidth={3} />
            </div>
            <h4>Report Submitted!</h4>
            <p>
              Thank you for helping an animal in need. Local NGOs have been
              notified and will review your report shortly.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(false)}
              className={styles.doneButton}
              style={{ marginTop: "2rem", minWidth: "160px" }}
            >
              Done
            </Button>
          </div>
        )}
      </Modal>
    </section>
  );
};
export default AbandonedPetReportSection;
