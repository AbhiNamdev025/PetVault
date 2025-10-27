import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import styles from "./editPetModal.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
const EditPetModal = ({ pet, onClose, onSave }) => {
  if (!pet) return null;
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    type: "dog",
    gender: "male",
    age: "",
    ageUnit: "months",
    price: "",
    description: "",
    available: true,
    vaccinated: false,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pet && pet._id) {
      console.log("Editing pet:", pet);
      setFormData({
        name: pet.name || "",
        breed: pet.breed || "",
        type: pet.type || "dog",
        gender: pet.gender || "male",
        age: pet.age ? pet.age.toString() : "0",
        ageUnit: pet.ageUnit || "months",
        price: pet.price ? pet.price.toString() : "0",
        description: pet.description || "",
        available: Boolean(pet.available),
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

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        breed: formData.breed,
        type: formData.type,
        gender: formData.gender,
        age: parseInt(formData.age) || 0,
        ageUnit: formData.ageUnit,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        available: formData.available,
        vaccinated: formData.vaccinated,
      };

      if (images.length > 0) {
        submitData.images = images;
      }

      console.log("Submitting update:", submitData);
      await onSave(pet._id, submitData);
    } catch (error) {
      console.error("Error updating pet:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!pet || !pet._id) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>Error</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className={styles.form}>
            <p>No pet data available. Please try again.</p>
            <button onClick={onClose} className={styles.cancelButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <label>Age *</label>
              <div className={styles.ageInput}>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
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
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
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

          {existingImages.length > 0 && (
            <div className={styles.formGroup}>
              <label>Current Images</label>
              <div className={styles.imagePreview}>
                {existingImages.map((image, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img
                      src={`http://localhost:5000/uploads/pets/${pet.images?.[0]}`}
                      alt={pet.name}
                    />
                    <div
                      className={styles.imageError}
                      style={{ display: "none" }}
                    >
                      Image not found
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className={styles.removeImage}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <div className={styles.formGroup}>
            <label>Add New Images</label>
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
                  {images.map((image, index) => (
                    <div key={index} className={styles.previewItem}>
                      <img src={URL.createObjectURL(image)} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
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
              Available for sale
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
