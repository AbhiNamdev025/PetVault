import React, { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Camera,
  Send,
  Calendar,
  Clock,
  User,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../utils/constants";
import styles from "./abandonedPetReport.module.css";

const AbandonedPetReportSection = () => {
  const [formData, setFormData] = useState({
    petName: "",
    petType: "Dog",
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

  useEffect(() => {
    fetchNgos();
  }, []);

  const fetchNgos = async () => {
    try {
      const token = localStorage.getItem("token");
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
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedNgo) {
      toast.error("Please select an NGO");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Append all form fields
      formDataToSend.append("providerType", "NGO");
      formDataToSend.append("providerId", selectedNgo);
      formDataToSend.append("service", "others");
      formDataToSend.append(
        "petName",
        formData.petName || "Unknown Abandoned Pet"
      );
      formDataToSend.append("petType", formData.petType);
      formDataToSend.append("parentPhone", formData.parentPhone);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("healthIssues", formData.healthIssues);
      formDataToSend.append(
        "reason",
        formData.reason || "Abandoned pet found - needs rescue"
      );

      // Append images
      formData.petImages.forEach((image, index) => {
        formDataToSend.append("petImages", image);
      });

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success(
          "Report submitted successfully! NGO will contact you soon."
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
        toast.error("Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.reportSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <User size={32} className={styles.titleIcon} />
            <h2 className={styles.title}>Help Abandoned Pets</h2>
          </div>
          <p className={styles.subtitle}>
            See an abandoned pet in need? Report it and help us connect them
            with nearby NGOs for rescue and care.
          </p>

          <button
            className={styles.reportButton}
            onClick={() => setShowForm(true)}
          >
            <MapPin size={20} />
            Report Abandoned Pet
          </button>
        </div>

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
      </div>

      {/* Form Popup */}
      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formPopup}>
            <div className={styles.popupHeader}>
              <h3>Report Abandoned Pet</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            {isSubmitted ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <h4>Report Submitted Successfully!</h4>
                <p>
                  Thank you for helping an animal in need. The selected NGO will
                  contact you shortly.
                </p>
              </div>
            ) : (
              <form className={styles.reportForm} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Select NGO *</label>
                    <select
                      value={selectedNgo}
                      onChange={(e) => setSelectedNgo(e.target.value)}
                      required
                    >
                      <option value="">Choose an NGO</option>
                      {ngos.map((ngo) => (
                        <option key={ngo._id} value={ngo._id}>
                          {ngo.name} - {ngo.roleData?.area || "Unknown area"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Pet Type *</label>
                    <select
                      name="petType"
                      value={formData.petType}
                      onChange={handleChange}
                      required
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Pet Name (If known)</label>
                    <input
                      type="text"
                      name="petName"
                      value={formData.petName}
                      onChange={handleChange}
                      placeholder="Enter pet name if known"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Your Phone Number *</label>
                    <div className={styles.inputWithIcon}>
                      <Phone size={18} />
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleChange}
                        placeholder="Enter your 10-digit phone number"
                        pattern="[1-9][0-9]{9}"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Date Found *</label>
                    <div className={styles.inputWithIcon}>
                      <Calendar size={18} />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Time Found *</label>
                    <div className={styles.inputWithIcon}>
                      <Clock size={18} />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className={styles.imageUploadSection}>
                  <label>Upload Pet Photos (Max 3)</label>
                  <div className={styles.imageUploadArea}>
                    <input
                      type="file"
                      id="petImages"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.fileInput}
                    />
                    <label htmlFor="petImages" className={styles.uploadLabel}>
                      <Camera size={24} />
                      <span>Click to upload photos</span>
                      <small>JPEG, PNG, JPG (Max 5 images)</small>
                    </label>
                  </div>

                  {formData.petImages.length > 0 && (
                    <div className={styles.imagePreview}>
                      <h4>Selected Images ({formData.petImages.length}/5)</h4>
                      <div className={styles.imageGrid}>
                        {formData.petImages.map((image, index) => (
                          <div key={index} className={styles.imageItem}>
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Pet ${index + 1}`}
                              className={styles.previewImage}
                            />
                            <button
                              type="button"
                              className={styles.removeImageButton}
                              onClick={() => removeImage(index)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Health Issues Observed</label>
                  <textarea
                    name="healthIssues"
                    value={formData.healthIssues}
                    onChange={handleChange}
                    placeholder="Describe any visible health issues, injuries, or concerning behavior..."
                    rows="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Location & Situation Details *</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Provide exact location, landmarks, and describe the pet's situation..."
                    rows="4"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner}></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default AbandonedPetReportSection;
