import React, { useState, useEffect } from "react";
import { X, Upload, Plus } from "lucide-react";
import styles from "./editPetModal.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import toast from "react-hot-toast";
import {
  Modal,
  Button,
  Checkbox,
  Select,
  Input,
  Textarea,
} from "../../../common";

const EditPetModal = ({ pet, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    type: "dog",
    gender: "male",
    age: "",
    ageUnit: "years",
    price: "",
    color: "",
    description: "",
    weight: "",
    identifiableMarks: "",
    dob: "",
    medicalConditions: [],
    allergies: [],
    available: true,
    category: "shop",
    dewormed: true,
    vaccinated: false,
  });

  const [ageMode, setAgeMode] = useState("Years");
  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
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
        ageUnit: pet.ageUnit || "years",
        price: pet.price ? pet.price.toString() : "",
        color: pet.color || "",
        description: pet.description || "",
        weight: pet.weight ? pet.weight.toString() : "",
        identifiableMarks: pet.identifiableMarks || "",
        dob: pet.dob ? new Date(pet.dob).toISOString().split("T")[0] : "",
        medicalConditions: pet.medicalConditions || [],
        allergies: pet.allergies || [],
        available: Boolean(pet.available),
        category: pet.category || "shop",
        vaccinated: Boolean(pet.vaccinated),
        dewormed: Boolean(pet.dewormed),
      });
      setAgeMode(pet.dob ? "DOB" : "Years");
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

  const addMedicalCondition = () => {
    if (newCondition.trim()) {
      setFormData((prev) => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, newCondition.trim()],
      }));
      setNewCondition("");
    }
  };

  const removeMedicalCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index),
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/pets/${pet._id}/image/${img}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const form = new FormData();
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach((val) => form.append(key, val));
        } else {
          form.append(key, formData[key]);
        }
      });
      if (images.length > 0) {
        form.append("replaceImages", "false");
        images.forEach((img) => form.append("petImages", img));
      }
      const response = await fetch(`${API_BASE_URL}/pets/${pet._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      if (response.ok) {
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
    <Modal
      isOpen
      onClose={onClose}
      showCloseButton={false}
      hideContentPadding
      size="lg"
      backdropClassName={styles.modalOverlay}
      className={styles.modal}
    >
      <div className={styles.modalHeader}>
        <h2>Edit Pet</h2>
        <Button
          className={styles.closeButton}
          onClick={onClose}
          usePresetStyle={false}
        >
          <X size={24} />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <Input
              type="text"
              label="Pet Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <Select
              label="Species"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              fullWidth
              className={styles.selectField}
              options={[
                {
                  label: "Dog",
                  value: "dog",
                },
                {
                  label: "Cat",
                  value: "cat",
                },
                {
                  label: "Bird",
                  value: "bird",
                },
                {
                  label: "Rabbit",
                  value: "rabbit",
                },
                {
                  label: "Fish",
                  value: "fish",
                },
                {
                  label: "Other",
                  value: "other",
                },
              ]}
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              type="text"
              label="Breed"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              required
              fullWidth
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              fullWidth
              className={styles.selectField}
              options={[
                {
                  label: "Male",
                  value: "male",
                },
                {
                  label: "Female",
                  value: "female",
                },
              ]}
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              type="number"
              label="Weight (kg)"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              required
              fullWidth
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              type="text"
              label="Identifiable Marks"
              name="identifiableMarks"
              value={formData.identifiableMarks}
              onChange={handleInputChange}
              required
              fullWidth
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.ageHeader}>
              <label>Age *</label>
              <div className={styles.tabContainer}>
                <Button
                  type="button"
                  className={`${styles.tab} ${ageMode === "DOB" ? styles.activeTab : ""}`}
                  onClick={() => setAgeMode("DOB")}
                  variant="ghost"
                  size="sm"
                >
                  DOB
                </Button>
                <Button
                  type="button"
                  className={`${styles.tab} ${ageMode === "Years" ? styles.activeTab : ""}`}
                  onClick={() => setAgeMode("Years")}
                  variant="ghost"
                  size="sm"
                >
                  Years
                </Button>
              </div>
            </div>
            {ageMode === "DOB" ? (
              <Input
                type="date"
                label="Date of Birth"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required={ageMode === "DOB"}
                fullWidth
                className={styles.inputField}
              />
            ) : (
              <Input
                type="number"
                label="Age"
                step="0.1"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required={ageMode === "Years"}
                fullWidth
                className={styles.inputField}
              />
            )}
          </div>
          <div className={styles.formGroup}>
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              fullWidth
              className={styles.selectField}
              options={[
                {
                  label: "For Sale",
                  value: "shop",
                },
                {
                  label: "For Adoption",
                  value: "adoption",
                },
              ]}
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              type="number"
              label="Price (Rs)"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
              fullWidth
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              type="text"
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              fullWidth
              className={styles.inputField}
            />
          </div>
        </div>

        <div className={styles.twoColumn}>
          <div className={styles.formGroup}>
            <label>Medical Conditions</label>
            <div className={styles.inputWithButton}>
              <Input
                placeholder="Add..."
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                fullWidth
                className={styles.inputField}
              />
              <Button
                type="button"
                onClick={addMedicalCondition}
                className={styles.plusBtn}
                usePresetStyle={false}
                aria-label="Add medical condition"
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className={styles.tagGrid}>
              {formData.medicalConditions.map((cond, i) => (
                <span key={i} className={styles.tag}>
                  {cond}
                  <Button
                    type="button"
                    onClick={() => removeMedicalCondition(i)}
                    className={styles.tagRemove}
                    usePresetStyle={false}
                    aria-label={`Remove ${cond}`}
                  >
                    <X size={10} />
                  </Button>
                </span>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Allergies</label>
            <div className={styles.inputWithButton}>
              <Input
                placeholder="Add..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                fullWidth
                className={styles.inputField}
              />
              <Button
                type="button"
                onClick={addAllergy}
                className={styles.plusBtn}
                usePresetStyle={false}
                aria-label="Add allergy"
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className={styles.tagGrid}>
              {formData.allergies.map((all, i) => (
                <span key={i} className={styles.tag}>
                  {all}
                  <Button
                    type="button"
                    onClick={() => removeAllergy(i)}
                    className={styles.tagRemove}
                    usePresetStyle={false}
                    aria-label={`Remove ${all}`}
                  >
                    <X size={10} />
                  </Button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            required
            fullWidth
            className={styles.textareaField}
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
                    <Button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img)}
                      className={styles.removeImage}
                      variant="ghost"
                      size="xs"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </Button>
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
                    <Button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className={styles.removeImage}
                      variant="ghost"
                      size="xs"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.checkboxGroup}>
          <Checkbox
            label={`Available for ${formData.category === "shop" ? "sale" : "adoption"}`}
            name="available"
            checked={formData.available}
            onChange={handleInputChange}
            className={styles.checkboxLabel}
          />
          <Checkbox
            label="Vaccinated"
            name="vaccinated"
            checked={formData.vaccinated}
            onChange={handleInputChange}
            className={styles.checkboxLabel}
          />
          <Checkbox
            label="Dewormed"
            name="dewormed"
            checked={formData.dewormed}
            onChange={handleInputChange}
            className={styles.checkboxLabel}
          />
        </div>

        <div className={styles.modalActions}>
          <Button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={styles.saveButton}
            variant="primary"
            size="md"
          >
            {loading ? "Updating..." : "Update Pet"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPetModal;
