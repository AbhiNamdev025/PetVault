import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import styles from "./addPetModal.module.css";
import PetImageUploader from "../PetImageUploader/petImageUploader";
import {
  Modal,
  Button,
  Checkbox,
  Input,
  Select,
  Textarea,
} from "../../../common";

const AddPetModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    type: "dog",
    gender: "male",
    age: "",
    ageUnit: "years",
    price: "",
    description: "",
    color: "",
    weight: "",
    identifiableMarks: "",
    dob: "",
    medicalConditions: [],
    allergies: [],
    available: true,
    category: "shop",
    vaccinated: false,
    dewormed: true,
  });

  const [ageMode, setAgeMode] = useState("Years");
  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        price: formData.price ? parseFloat(formData.price) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        images: images,
      };
      await onSave(submitData);
    } catch (error) {
      console.error("Error adding pet:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <h2>Add New Pet</h2>
        <Button
          className={styles.closeButton}
          onClick={onClose}
          usePresetStyle={false}
        >
          <X size={24} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formContent}>
          <div className={styles.imageUploadSection}>
            <PetImageUploader images={images} setImages={setImages} />
          </div>

          <div className={styles.formFieldsSection}>
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
                      usePresetStyle={false}
                    >
                      DOB
                    </Button>
                    <Button
                      type="button"
                      className={`${styles.tab} ${ageMode === "Years" ? styles.activeTab : ""}`}
                      onClick={() => setAgeMode("Years")}
                      usePresetStyle={false}
                    >
                      Years
                    </Button>
                  </div>
                </div>
                {ageMode === "DOB" ? (
                  <Input
                    type="date"
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
                  required
                  fullWidth
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.formRow}>
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
                rows={4}
                required
                fullWidth
                className={styles.textareaField}
              />
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
          </div>
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
            {loading ? "Adding..." : "Add Pet"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPetModal;
