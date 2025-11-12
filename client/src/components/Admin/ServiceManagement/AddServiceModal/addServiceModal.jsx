import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import styles from "./addServiceModal.module.css";

const AddServiceModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "vet",
    description: "",
    price: "",
    duration: "",
    available: true,
    features: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "features") {
          form.append(
            "features",
            value ? value.split(",").map((f) => f.trim()) : []
          );
        } else {
          form.append(key, value);
        }
      });

      images.forEach((img) => form.append("serviceImages", img));

      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Add New Service</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Service Name *</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label>Type *</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="vet">Vet</option>
              <option value="daycare">Daycare</option>
              <option value="grooming">Grooming</option>
              <option value="training">Training</option>
              <option value="boarding">Boarding</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Duration (min)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Features (comma separated)</label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="e.g., Free Pickup, Nail Trim"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Upload Images</label>
            <div className={styles.imageUpload}>
              <label className={styles.uploadArea}>
                <Upload size={22} />
                <span>Click to upload images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                />
              </label>

              {images.length > 0 && (
                <div className={styles.imagePreview}>
                  {images.map((image, i) => (
                    <div key={i} className={styles.previewItem}>
                      <img src={URL.createObjectURL(image)} alt="preview" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className={styles.removeImage}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
            />
            Available
          </label>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? "Adding..." : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
