import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import styles from "./editServiceModal.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import { toast } from "react-toastify";

const EditServiceModal = ({ service, onClose, onSave }) => {
  if (!service || !service._id) return null;

  const [formData, setFormData] = useState({
    name: "",
    type: "vet",
    description: "",
    price: "",
    duration: "",
    features: "",
    available: true,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service && service._id) {
      setFormData({
        name: service.name || "",
        type: service.type || "vet",
        description: service.description || "",
        price: service.price ? service.price.toString() : "",
        duration: service.duration ? service.duration.toString() : "",
        features: service.features ? service.features.join(", ") : "",
        available: Boolean(service.available),
      });
      setExistingImages(service.images || []);
    }
  }, [service]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleDeleteExistingImage = async (imgName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/services/${service._id}/image/${imgName}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setExistingImages((prev) => prev.filter((i) => i !== imgName));
        toast.success("Image deleted");
      } else {
        const err = await response.json();
        toast.error(err.message || "Failed to delete image");
      }
    } catch (error) {
      toast.error("Error deleting image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      images.forEach((img) => form.append("serviceImages", img));

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/services/${service._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (response.ok) {
        toast.success("Service updated successfully");
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update service");
      }
    } catch (error) {
      toast.error("Error updating service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Edit Service</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Service Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="vet">Vet</option>
                <option value="daycare">Daycare</option>
                <option value="grooming">Grooming</option>
                <option value="training">Training</option>
                <option value="boarding">Boarding</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Duration (mins) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Features (comma separated)</label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleInputChange}
              placeholder="e.g. Full checkup, Bathing, Nail trim"
            />
          </div>

          {existingImages.length > 0 && (
            <div className={styles.formGroup}>
              <label>Existing Images</label>
              <div className={styles.imagePreview}>
                {existingImages.map((img, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img
                      src={`http://localhost:5000/uploads/services/${img}`}
                      alt="Service"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img)}
                      className={styles.removeImage}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Upload New Images</label>
            <div className={styles.imageUpload}>
              <label className={styles.uploadArea}>
                <Upload size={20} />
                <span>Click to upload</span>
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
                  {images.map((img, i) => (
                    <div key={i} className={styles.previewItem}>
                      <img src={URL.createObjectURL(img)} alt="Preview" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
              />
              Service Available
            </label>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.saveButton}
            >
              {loading ? "Updating..." : "Update Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;
