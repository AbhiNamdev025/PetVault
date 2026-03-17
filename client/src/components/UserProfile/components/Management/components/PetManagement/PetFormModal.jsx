import React, { useMemo, useState } from "react";
import styles from "./petManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import toast from "react-hot-toast";
import { X, Upload, Plus } from "lucide-react";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  Textarea,
} from "../../../../../common";

const PET_TYPE_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "fish", label: "Fish" },
  { value: "other", label: "Other" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const PRESET_TYPES = ["dog", "cat", "bird", "rabbit", "fish"];

const getInitialForm = (pet, isNgo) => {
  if (!pet) {
    return {
      name: "",
      type: "",
      otherType: "",
      breed: "",
      age: "",
      ageUnit: "years",
      gender: "male",
      weight: "",
      identifiableMarks: "",
      dob: "",
      price: "",
      color: "",
      description: "",
      vaccinated: false,
      dewormed: true,
      available: true,
      category: isNgo ? "adoption" : "shop",
      featured: false,
      medicalConditions: [],
      allergies: [],
    };
  }

  const existingTypeRaw = String(pet.type || "").trim();
  const existingTypeLower = existingTypeRaw.toLowerCase();
  const isPresetType = PRESET_TYPES.includes(existingTypeLower);
  const isLegacyOther = existingTypeLower === "other";

  return {
    name: pet.name || "",
    type: isPresetType || isLegacyOther ? existingTypeLower : "other",
    otherType: !isPresetType && !isLegacyOther ? existingTypeRaw : "",
    breed: pet.breed || "",
    age: pet.age || "",
    ageUnit: pet.ageUnit || "years",
    gender: pet.gender || "male",
    weight: pet.weight || "",
    identifiableMarks: pet.identifiableMarks || "",
    dob: pet.dob ? new Date(pet.dob).toISOString().split("T")[0] : "",
    price: pet.price || "",
    color: pet.color || "",
    description: pet.description || "",
    vaccinated: pet.vaccinated || false,
    dewormed: pet.dewormed !== false,
    available: pet.available !== false,
    category: pet.category || (isNgo ? "adoption" : "shop"),
    featured: pet.featured || false,
    medicalConditions: pet.medicalConditions || [],
    allergies: pet.allergies || [],
  };
};

const PetFormModal = ({ pet = null, onClose, onSaved }) => {
  const isEdit = Boolean(pet?._id);
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const isNgo = savedUser?.role === "ngo";
  const idKey = isNgo ? "ngoId" : "shopId";
  const accId = savedUser?._id;

  const [form, setForm] = useState(() => getInitialForm(pet, isNgo));
  const [ageMode, setAgeMode] = useState(pet?.dob ? "DOB" : "Years");
  const [newCondition, setNewCondition] = useState("");
  const [newAllergy, setNewAllergy] = useState("");
  const [existingImages, setExistingImages] = useState(pet?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [primaryPreview, setPrimaryPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const combined = useMemo(
    () => [
      ...existingImages.map((img) => ({
        type: "existing",
        id: img,
        url: `${API_BASE_URL.replace("/api", "")}/uploads/pets/${img}`,
      })),
      ...previews.map((url, i) => ({
        type: "new",
        index: i,
        url,
      })),
    ],
    [existingImages, previews],
  );

  const change = (e) => {
    const { name, value, type, checked } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "type" && value !== "other") {
      setForm((prev) => ({
        ...prev,
        type: value,
        otherType: "",
      }));
      if (errors.otherType) {
        setErrors((prev) => ({ ...prev, otherType: "" }));
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addMedicalCondition = () => {
    if (newCondition.trim()) {
      setForm((prev) => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, newCondition.trim()],
      }));
      setNewCondition("");
    }
  };

  const removeMedicalCondition = (index) => {
    setForm((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index),
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setForm((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index) => {
    setForm((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handlePrimaryImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nextPreview = URL.createObjectURL(file);
    setPrimaryPreview(nextPreview);

    if (isEdit) {
      setNewImages((prev) => [file, ...prev]);
      setPreviews((prev) => [nextPreview, ...prev]);
      return;
    }

    setNewImages((prev) => {
      const next = [...prev];
      if (next.length === 0) return [file];
      next[0] = file;
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      if (next.length === 0) return [nextPreview];
      next[0] = nextPreview;
      return next;
    });
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imgName) => {
    if (!isEdit || !pet?._id) return;
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/pets/${pet._id}/image/${imgName}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        setExistingImages((prev) => prev.filter((img) => img !== imgName));
        toast.success("Image deleted");
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting image");
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const normalizedType =
      form.type === "other" ? form.otherType.trim() : form.type.trim();

    if (!form.name.trim()) nextErrors.name = "Pet name is required";
    if (!form.type) nextErrors.type = "Species is required";
    if (form.type === "other" && !form.otherType.trim()) {
      nextErrors.otherType = "Please enter species";
    }
    if (!normalizedType) nextErrors.type = "Species is required";
    if (!form.breed.trim()) nextErrors.breed = "Breed is required";
    if (!form.weight || Number(form.weight) <= 0) {
      nextErrors.weight = "Enter valid weight";
    }
    if (!form.identifiableMarks.trim()) {
      nextErrors.identifiableMarks = "Identifiable marks are required";
    }
    if (ageMode === "DOB") {
      if (!form.dob) {
        nextErrors.dob = "Date of birth is required";
      } else if (new Date(form.dob) > new Date()) {
        nextErrors.dob = "DOB cannot be in the future";
      }
    } else if (!form.age || Number(form.age) <= 0) {
      nextErrors.age = "Enter valid age";
    }
    if (!isNgo && (!form.price || Number(form.price) <= 0)) {
      nextErrors.price = "Enter valid price";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) {
      toast.error("Please fix highlighted fields");
      return;
    }

    const normalizedType =
      form.type === "other" ? form.otherType.trim() : form.type.trim();
    const payload = {
      ...form,
      type: normalizedType,
    };
    delete payload.otherType;

    const fd = new FormData();
    Object.keys(payload).forEach((key) => {
      if (Array.isArray(payload[key])) {
        payload[key].forEach((val) => fd.append(key, val));
      } else {
        fd.append(key, payload[key]);
      }
    });

    fd.append(idKey, accId);
    newImages.forEach((img) => fd.append("petImages", img));

    try {
      const endpoint = isEdit
        ? `${API_BASE_URL}/pets/${pet._id}`
        : `${API_BASE_URL}/pets/create`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message || `Failed to ${isEdit ? "update" : "add"} pet`,
        );
      }

      toast.success(
        isEdit ? "Pet updated successfully" : "Pet added successfully",
      );
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(
        error.message || `Failed to ${isEdit ? "update" : "add"} pet`,
      );
    }
  };

  const primaryImageSrc = primaryPreview || combined[0]?.url || null;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={
        isEdit ? "Edit Pet" : isNgo ? "Add Pet for Adoption" : "Add New Pet"
      }
      size="md"
      hideContentPadding
      contentClassName={styles.modalContent}
      footer={
        <div className={styles.modalFooter}>
          <Button
            onClick={onClose}
            className={styles.cancelBtn}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            className={styles.submitBtn}
            data-type={isNgo ? "ngo" : ""}
            variant="primary"
            size="md"
          >
            {isEdit ? "Update Pet" : "Save Pet"}
          </Button>
        </div>
      }
    >
      <div className={styles.row}>
        <Input
          label="Pet Name"
          required
          name="name"
          placeholder="e.g. Max"
          value={form.name}
          onChange={change}
          error={errors.name}
          fullWidth
          className={styles.formGroup}
        />
        <div className={styles.formGroup}>
          <Select
            label="Species"
            required
            name="type"
            value={form.type}
            onChange={change}
            options={PET_TYPE_OPTIONS}
            placeholder="Select Type"
            error={errors.type}
            fullWidth
            className={styles.selectControl}
          />
          {form.type === "other" && (
            <Input
              name="otherType"
              placeholder="Enter pet type"
              value={form.otherType}
              onChange={change}
              error={errors.otherType}
              fullWidth
            />
          )}
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Breed"
          required
          name="breed"
          placeholder="e.g. Golden Retriever"
          value={form.breed}
          onChange={change}
          error={errors.breed}
          fullWidth
          className={styles.formGroup}
        />
        <div className={styles.formGroup}>
          <Select
            label="Gender"
            required
            name="gender"
            value={form.gender}
            onChange={change}
            options={GENDER_OPTIONS}
            fullWidth
            className={styles.selectControl}
          />
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Weight (kg)"
          required
          name="weight"
          type="number"
          step="0.1"
          placeholder="e.g. 12.5"
          value={form.weight}
          onChange={change}
          error={errors.weight}
          fullWidth
          className={styles.formGroup}
        />
        <Input
          label="Identifiable Marks"
          required
          name="identifiableMarks"
          placeholder="e.g. White spot on tail"
          value={form.identifiableMarks}
          onChange={change}
          error={errors.identifiableMarks}
          fullWidth
          className={styles.formGroup}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.ageHeader}>
          <label className={styles.label}>Age *</label>
          <div className={styles.tabContainer}>
            <Button
              type="button"
              className={`${styles.tab} ${ageMode === "DOB" ? styles.activeTab : ""}`}
              usePresetStyle={false}
              onClick={() => {
                setAgeMode("DOB");
                setErrors((prev) => ({ ...prev, age: "" }));
              }}
            >
              DOB
            </Button>
            <Button
              type="button"
              className={`${styles.tab} ${ageMode === "Years" ? styles.activeTab : ""}`}
              usePresetStyle={false}
              onClick={() => {
                setAgeMode("Years");
                setErrors((prev) => ({ ...prev, dob: "" }));
              }}
            >
              Years
            </Button>
          </div>
        </div>
        {ageMode === "DOB" ? (
          <Input
            name="dob"
            type="date"
            value={form.dob}
            onChange={change}
            error={errors.dob}
            fullWidth
          />
        ) : (
          <Input
            name="age"
            type="number"
            step="0.1"
            placeholder="e.g. 2.5"
            value={form.age}
            onChange={change}
            error={errors.age}
            fullWidth
          />
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Medical Conditions</label>
          <div className={styles.inputWithButton}>
            <Input
              placeholder="Add condition..."
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              fullWidth
            />
            <Button
              type="button"
              onClick={addMedicalCondition}
              className={styles.plusBtn}
              variant="ghost"
              size="sm"
            >
              <Plus size={18} />
            </Button>
          </div>
          <div className={styles.tagGrid}>
            {form.medicalConditions.map((cond, i) => (
              <span key={i} className={styles.tag}>
                {cond}
                <Button
                  type="button"
                  onClick={() => removeMedicalCondition(i)}
                  usePresetStyle={false}
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Allergies</label>
          <div className={styles.inputWithButton}>
            <Input
              placeholder="Add allergy..."
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              fullWidth
            />
            <Button
              type="button"
              onClick={addAllergy}
              className={styles.plusBtn}
              variant="ghost"
              size="sm"
            >
              <Plus size={18} />
            </Button>
          </div>
          <div className={styles.tagGrid}>
            {form.allergies.map((allergy, i) => (
              <span key={i} className={styles.tag}>
                {allergy}
                <Button
                  type="button"
                  onClick={() => removeAllergy(i)}
                  usePresetStyle={false}
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="Color"
          name="color"
          placeholder="e.g. Golden"
          value={form.color}
          onChange={change}
          fullWidth
          className={styles.formGroup}
        />
        {!isNgo && (
          <Input
            label="Price (₹)"
            required
            name="price"
            type="number"
            placeholder="0.00"
            value={form.price}
            onChange={change}
            error={errors.price}
            fullWidth
            className={styles.formGroup}
          />
        )}
      </div>

      <Textarea
        label="Description"
        name="description"
        placeholder="Tell us about the pet..."
        value={form.description}
        onChange={change}
        rows={3}
        fullWidth
        className={styles.formGroup}
      />
      <div className={styles.gallerySection}>
        <div
          className={styles.primaryImageSlot}
          onClick={() =>
            document
              .getElementById(
                isEdit ? "fileInputPrimaryEdit" : "fileInputPrimary",
              )
              ?.click()
          }
        >
          {primaryImageSrc ? (
            <>
              <img
                src={primaryImageSrc}
                alt="Primary"
                className={styles.primaryImage}
              />
              <div className={styles.primaryOverlay}>
                <Upload size={24} />
                <span>Change Primary Photo</span>
              </div>
            </>
          ) : (
            <div className={styles.primaryPlaceholder}>
              <Upload size={40} />
              <span>Upload Primary Photo</span>
            </div>
          )}
          <input
            id={isEdit ? "fileInputPrimaryEdit" : "fileInputPrimary"}
            type="file"
            accept="image/*"
            onChange={handlePrimaryImageSelect}
            className={styles.hiddenFileInput}
          />
        </div>

        <div className={styles.additionalSection}>
          <label className={styles.sectionLabel}>Additional Photos</label>
          <div className={styles.thumbnailGrid}>
            {combined.slice(1).map((img, i) => (
              <div key={i} className={styles.thumbnailItem}>
                <img src={img.url} alt="Thumbnail" />
                <Button
                  type="button"
                  className={styles.thumbnailRemove}
                  aria-label="Remove image"
                  usePresetStyle={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (img.type === "existing") {
                      handleDeleteExistingImage(img.id);
                    } else {
                      removeNewImage(img.index);
                    }
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              className={styles.addMoreBtn}
              usePresetStyle={false}
              onClick={() =>
                document
                  .getElementById(
                    isEdit ? "fileInputMoreEdit" : "fileInputMore",
                  )
                  ?.click()
              }
            >
              <Plus size={20} />
              <span>Add More</span>
            </Button>
          </div>
          <input
            id={isEdit ? "fileInputMoreEdit" : "fileInputMore"}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className={styles.hiddenFileInput}
          />
        </div>
      </div>
      <div className={`${styles.row} ${styles.triple}`}>
        <Checkbox
          label="Vaccinated"
          name="vaccinated"
          checked={form.vaccinated}
          onChange={change}
          className={styles.checkboxLabel}
        />
        <Checkbox
          label="Dewormed"
          name="dewormed"
          checked={form.dewormed}
          onChange={change}
          className={styles.checkboxLabel}
        />
        <Checkbox
          label="Available"
          name="available"
          checked={form.available}
          onChange={change}
          className={styles.checkboxLabel}
        />
      </div>
    </Modal>
  );
};

export default PetFormModal;
