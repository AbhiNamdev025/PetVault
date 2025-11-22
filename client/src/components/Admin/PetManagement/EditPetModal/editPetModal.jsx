import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import styles from "./editPetModal.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import toast from "react-hot-toast";
const EditPetModal = ({ pet, onClose }) => {
  if (!pet) return null;

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    type: "dog",
    gender: "male",
    age: "",
    ageUnit: "months",
    price: "",
    color: "",
    description: "",
    available: true,
    category: "shop",
    vaccinated: false,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet && pet._id) {
      setFormData({
        name: pet.name || "",
        breed: pet.breed || "",
        type: pet.type || "dog",
        gender: pet.gender || "male",
        age: pet.age ? pet.age.toString() : "",
        ageUnit: pet.ageUnit || "months",
        price: pet.price ? pet.price.toString() : "",
        color: pet.color || "",
        description: pet.description || "",
        available: Boolean(pet.available),
        category: pet.category || "shop",
        vaccinated: Boolean(pet.vaccinated),
      });
      setExistingImages(pet.images || []);
    }
  }, [pet]);

  const handleInputChange = (e) => {
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

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (img) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/pets/${pet._id}/image/${img}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setExistingImages((prev) => prev.filter((i) => i !== img));
        toast.success("Image deleted");
      } else {
        toast.error("Failed to delete image");
      }
    } catch {
      toast.error("Error deleting image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      if (images.length > 0) {
        form.append("replaceImages", "false");
        images.forEach((img) => form.append("petImages", img));
      }
      const response = await fetch(`${API_BASE_URL}/pets/${pet._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (response.ok) {
        const updated = await response.json();
        setExistingImages(updated.images || []);
        toast.success("Pet updated successfully");
        onClose();
      } else {
        toast.error("Failed to update pet");
      }
    } catch {
      toast.error("Error updating pet");
    } finally {
      setLoading(false);
    }
  };

  if (!pet || !pet._id) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Edit Pet</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Pet Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Breed *</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
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
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="fish">Fish</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="shop">For Sale</option>
                <option value="adoption">For Adoption</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Age *</label>
              <div className={styles.ageInput}>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ""}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
                <select
                  name="ageUnit"
                  value={formData.ageUnit}
                  onChange={handleInputChange}
                >
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Price (Rs) *</label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
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
              rows="4"
              required
            />
          </div>

          {existingImages && existingImages.length > 0 && (
            <div className={styles.formGroup}>
              <label>Existing Images</label>
              <div className={styles.imagePreview}>
                {existingImages.map((img, index) => {
                  const imageUrl = img.startsWith("http")
                    ? img
                    : `${API_BASE_URL.replace("/api", "")}/uploads/pets/${img}`;
                  return (
                    <div key={index} className={styles.previewItem}>
                      <img src={imageUrl} alt="Pet" />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img)}
                        className={styles.removeImage}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Upload New Images</label>
            <div className={styles.imageUpload}>
              <label className={styles.uploadArea}>
                <Upload size={24} />
                <span>Click to upload new images</span>
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
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
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

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleInputChange}
              />
              Available for {formData.category === "shop" ? "sale" : "adoption"}
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="vaccinated"
                checked={formData.vaccinated}
                onChange={handleInputChange}
              />
              Vaccinated
            </label>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.saveButton}
            >
              {loading ? "Updating..." : "Update Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPetModal;
