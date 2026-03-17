import React, { useState, useEffect } from "react";
import styles from "./PetFormModal.module.css";
import Modal from "../../../../../common/Modal/Modal";
import Input from "../../../../../common/Input/Input";
import Select from "../../../../../common/Select/Select";
import Button from "../../../../../common/Button/Button";
import { Upload, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../../../../utils/constants";

const SPECIES_OPTIONS = [
  { value: "Dog", label: "Dog" },
  { value: "Cat", label: "Cat" },
  { value: "Bird", label: "Bird" },
  { value: "Rabbit", label: "Rabbit" },
  { value: "Fish", label: "Fish" },
  { value: "Other", label: "Other" },
];

const PRESET_SPECIES = new Set(
  SPECIES_OPTIONS.filter((item) => item.value !== "Other").map(
    (item) => item.value,
  ),
);
const PetFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingPet,
  initialData,
}) => {
  const formId = "my-pet-form";
  const [formData, setFormData] = useState(initialData);
  const [previewImage, setPreviewImage] = useState(null);
  const [tempCondition, setTempCondition] = useState("");
  const [tempAllergy, setTempAllergy] = useState("");
  const [ageMode, setAgeMode] = useState("dob");
  useEffect(() => {
    if (editingPet && editingPet.profileImage) {
      setPreviewImage(`${BASE_URL}/uploads/pets/${editingPet.profileImage}`);
    } else {
      setPreviewImage(null);
    }
    const incomingSpecies = String(initialData?.species || "").trim();
    const incomingCustomSpecies = String(
      initialData?.customSpecies || "",
    ).trim();
    const isPresetSpecies = PRESET_SPECIES.has(incomingSpecies);
    const customSpecies =
      incomingSpecies && !isPresetSpecies && incomingSpecies !== "Other"
        ? incomingSpecies
        : incomingCustomSpecies;

    setFormData({
      ...initialData,
      species: incomingSpecies
        ? isPresetSpecies
          ? incomingSpecies
          : "Other"
        : "",
      customSpecies: customSpecies || "",
    });
    setAgeMode(initialData?.dob ? "dob" : "age");
  }, [editingPet, initialData, isOpen]);
  const handleInputChange = (e) => {
    if (e.target.name === "species" && e.target.value !== "Other") {
      setFormData({
        ...formData,
        species: e.target.value,
        customSpecies: "",
      });
      return;
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  const handleAddTag = (type, value) => {
    if (!value.trim()) return;
    if (type === "condition") {
      setFormData({
        ...formData,
        medicalConditions: [...formData.medicalConditions, value],
      });
      setTempCondition("");
    } else {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, value],
      });
      setTempAllergy("");
    }
  };
  const handleRemoveTag = (type, index) => {
    if (type === "condition") {
      const updated = [...formData.medicalConditions];
      updated.splice(index, 1);
      setFormData({
        ...formData,
        medicalConditions: updated,
      });
    } else {
      const updated = [...formData.allergies];
      updated.splice(index, 1);
      setFormData({
        ...formData,
        allergies: updated,
      });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedSpecies =
      formData.species === "Other"
        ? String(formData.customSpecies || "").trim()
        : String(formData.species || "").trim();

    if (!normalizedSpecies) {
      toast.error("Please provide species");
      return;
    }

    const payload = {
      ...formData,
      species: normalizedSpecies,
    };
    delete payload.customSpecies;
    if (ageMode === "dob") {
      payload.age = "";
    } else {
      payload.dob = "";
    }
    onSubmit(payload);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPet ? "Edit Pet Profile" : "Register New Pet"}
      hideContentPadding
      footer={
        <div className={styles.modalFooter}>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            className={styles.submitBtn}
          >
            {editingPet ? "Save Changes" : "Register Pet"}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className={styles.modalContent}>
        <div className={styles.formGrid}>
          <Input
            label="Pet Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            fullWidth
            placeholder="What's their name?"
            className={styles.formControl}
          />

          <Select
            label="Species"
            name="species"
            value={formData.species}
            onChange={handleInputChange}
            required
            options={SPECIES_OPTIONS}
            placeholder="Select Species"
            fullWidth
            className={styles.formControl}
          />
          {formData.species === "Other" && (
            <Input
              label="Other Species"
              type="text"
              name="customSpecies"
              value={formData.customSpecies || ""}
              onChange={handleInputChange}
              required
              fullWidth
              placeholder="Enter species"
              className={styles.formControl}
            />
          )}

          {/* Row 3: Breed and Gender */}
          <Input
            label="Breed"
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            required
            fullWidth
            placeholder="e.g. Golden Retriever"
            className={styles.formControl}
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={["Male", "Female", "Unknown"]}
            fullWidth
            required
            className={styles.formControl}
          />

          {/* Row 4: Weight and Identifiable Marks */}
          <Input
            label="Weight (kg)"
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            min="0"
            step="0.1"
            fullWidth
            placeholder="e.g. 12.5"
            required
            className={styles.formControl}
          />
          <Input
            label="Color"
            type="text"
            name="colorMarks"
            value={formData.colorMarks}
            onChange={handleInputChange}
            fullWidth
            placeholder="e.g. Golden, White"
            required
            className={styles.formControl}
          />
          <Input
            label="Identifiable Marks"
            type="text"
            name="identifiableMarks"
            value={formData.identifiableMarks}
            onChange={handleInputChange}
            fullWidth
            placeholder="e.g. White patch on chest"
            className={styles.formControl}
          />

          {/* Row 5: Age Information spans 2 columns */}
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label className={styles.fieldLabel}>Age Information</label>
            <div className={styles.ageToggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${ageMode === "dob" ? styles.activeToggle : ""}`}
                onClick={() => {
                  setAgeMode("dob");
                  setFormData((prev) => ({ ...prev, age: "" }));
                }}
              >
                DOB
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${ageMode === "age" ? styles.activeToggle : ""}`}
                onClick={() => {
                  setAgeMode("age");
                  setFormData((prev) => ({
                    ...prev,
                    dob: "",
                    ageUnit: "years",
                  }));
                }}
              >
                Years
              </button>
            </div>
            {ageMode === "dob" ? (
              <Input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                fullWidth
                required
                className={styles.formControl}
              />
            ) : (
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                fullWidth
                placeholder="e.g. 2.5"
                required
                className={styles.formControl}
              />
            )}
          </div>

          {/* Row 6: Medical Conditions and Allergies */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Medical Conditions</label>
            <div className={styles.tagInputWrapper}>
              <Input
                type="text"
                value={tempCondition}
                onChange={(e) => setTempCondition(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddTag("condition", tempCondition))
                }
                placeholder="Add condition..."
                fullWidth
                className={styles.formControl}
              />
              <button
                type="button"
                onClick={() => handleAddTag("condition", tempCondition)}
                className={styles.tagAddBtn}
              >
                <Plus size={20} />
              </button>
            </div>
            <div className={styles.tagList}>
              {formData.medicalConditions.map((c, i) => (
                <span key={i} className={styles.tagBadge}>
                  <span className={styles.tagText}>{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("condition", i)}
                    className={styles.tagRemoveBtn}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Allergies</label>
            <div className={styles.tagInputWrapper}>
              <Input
                type="text"
                value={tempAllergy}
                onChange={(e) => setTempAllergy(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddTag("allergy", tempAllergy))
                }
                placeholder="Add allergy..."
                fullWidth
                className={styles.formControl}
              />
              <button
                type="button"
                onClick={() => handleAddTag("allergy", tempAllergy)}
                className={styles.tagAddBtn}
              >
                <Plus size={20} />
              </button>
            </div>
            <div className={styles.tagList}>
              {formData.allergies.map((a, i) => (
                <span key={i} className={styles.tagBadge}>
                  <span className={styles.tagText}>{a}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("allergy", i)}
                    className={styles.tagRemoveBtn}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.imageSection}>
          <label className={styles.fieldLabel}>Pet Photo</label>
          <div className={styles.imagePreviewWrap}>
            <div
              className={`${styles.uploadArea} ${previewImage ? styles.uploadAreaHasImage : ""}`}
            >
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                aria-label="Upload pet image"
                className={styles.fileInput}
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Pet preview"
                  className={styles.previewImage}
                />
              )}
              <div className={styles.uploadContent}>
                <Upload size={32} className={styles.uploadIcon} />
                <p>
                  {previewImage
                    ? "Click to replace pet image"
                    : "Click to upload pet image"}
                </p>
              </div>
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
};
export default PetFormModal;
