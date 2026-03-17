import React, { useState, useEffect } from "react";
import { Upload, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  Modal,
  Button,
  Input,
  Textarea,
  Checkbox,
} from "../../../common";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import styles from "./serviceFormModal.module.css";

const INPUT_MAX_LENGTH = 50;
const TEXTAREA_MAX_LENGTH = 200;

const normalizeType = (value = "") => String(value).trim().toLowerCase();
const ALLOWED_SERVICE_TYPES = [
  "vet",
  "daycare",
  "grooming",
  "training",
  "boarding",
  "shop",
  "ngo",
];

const normalizeFeatures = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const ServiceFormModal = ({
  service,
  isOpen,
  onClose,
  onSave,
  services = [],
}) => {
  const isEdit = Boolean(service && service._id);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    features: [],
    available: true,
  });
  const [featureInput, setFeatureInput] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const resetFormState = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      features: [],
      available: true,
    });
    setExistingImages([]);
    setImages([]);
    setFeatureInput("");
    setErrors({});
  };

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit) {
      setFormData({
        name: service.name || "",
        type: service.type || "",
        description: service.description || "",
        features: normalizeFeatures(service.features),
        available: Boolean(service.available),
      });
      setExistingImages(service.images || []);
    } else {
      resetFormState();
    }
  }, [isOpen, service, isEdit]);

  const handleModalClose = () => {
    resetFormState();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFeatureInputChange = (e) => {
    const value = e.target.value;
    setFeatureInput(value);
    setErrors((prev) => ({
      ...prev,
      featureInput: "",
      features: "",
    }));
  };

  const addFeature = () => {
    const value = featureInput.trim();
    if (!value) return;
    setFormData((prev) => ({
      // Keep features unique regardless of case to avoid duplicates.
      ...prev,
      features: prev.features.some(
        (item) => String(item).trim().toLowerCase() === value.toLowerCase(),
      )
        ? prev.features
        : [...prev.features, value],
    }));
    setFeatureInput("");
    setErrors((prev) => ({
      ...prev,
      featureInput: "",
      features: "",
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({
      ...prev,
      features: "",
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imgName) => {
    if (!isEdit) return;
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/services/${service._id}/image/${imgName}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        setExistingImages((prev) => prev.filter((i) => i !== imgName));
        toast.success("Image removed");
      }
    } catch {
      toast.error("Error deleting image");
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Service name is required";
    }

    if (!formData.description.trim()) {
      nextErrors.description = "Description is required";
    }

    const normalizedType = normalizeType(formData.type);
    if (!normalizedType) {
      nextErrors.type = "Type is required";
    } else if (!ALLOWED_SERVICE_TYPES.includes(normalizedType)) {
      nextErrors.type = `Type must be one of: ${ALLOWED_SERVICE_TYPES.join(", ")}`;
    } else {
      const currentType = normalizeType(service?.type || "");
      const typeChanged = !isEdit || normalizedType !== currentType;
      if (typeChanged) {
        const duplicateType = services.some(
          (item) =>
            normalizeType(item?.type) === normalizedType &&
            item?._id !== service?._id,
        );
        if (duplicateType) {
          nextErrors.type = "This type already exists. Duplicate types are not allowed.";
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix validation errors before saving");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "features") return;
        if (key === "type") {
          form.append(key, normalizeType(value));
          return;
        }
        form.append(key, typeof value === "string" ? value.trim() : value);
      });

      const featuresPayload = [
        ...formData.features,
        ...(featureInput.trim() ? [featureInput.trim()] : []),
      ].filter(Boolean);

      if (featuresPayload.length > 0) {
        form.append("features", Array.from(new Set(featuresPayload)).join(","));
      }

      images.forEach((img) => form.append("serviceImages", img));

      if (isEdit) {
        await onSave(service._id, form);
      } else {
        await onSave(form);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className={styles.modalActions}>
      <Button type="button" onClick={handleModalClose} variant="ghost" size="md">
        Cancel
      </Button>
      <Button
        type="submit"
        form="serviceForm"
        disabled={loading}
        variant="primary"
        size="md"
      >
        {loading
          ? isEdit
            ? "Updating..."
            : "Adding..."
          : isEdit
            ? "Update Service"
            : "Add Service"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={isEdit ? "Edit Service" : "Add New Service"}
      footer={footer}
      size="lg"
    >
      <form id="serviceForm" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <Input
            label="Service Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            maxLength={INPUT_MAX_LENGTH}
            fullWidth
            placeholder="e.g. Premium Grooming"
          />
          <Input
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
            required
            maxLength={INPUT_MAX_LENGTH}
            fullWidth
            placeholder="e.g. vet"
          />
        </div>

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          required
          maxLength={TEXTAREA_MAX_LENGTH}
          fullWidth
          rows={3}
          placeholder="Service description..."
        />

        <div className={styles.formGroup}>
          <label className={styles.groupLabel}>Features</label>
          <div className={styles.inputWithButton}>
            <div className={styles.featureInputWrap}>
              <Input
                value={featureInput}
                onChange={handleFeatureInputChange}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addFeature())
                }
                error={errors.featureInput || errors.features}
                maxLength={INPUT_MAX_LENGTH}
                placeholder="Add key feature..."
                fullWidth
              />
            </div>
            <Button
              type="button"
              onClick={addFeature}
              variant="secondary"
              size="sm"
              className={styles.plusBtn}
            >
              <Plus size={18} />
            </Button>
          </div>
          {formData.features.length > 0 && (
            <div className={styles.tagGrid}>
              {formData.features.map((feature, index) => (
                <span key={index} className={styles.tag}>
                  {feature}
                  <Button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className={styles.tagRemove}
                    variant="ghost"
                    size="xs"
                    aria-label={`Remove ${feature}`}
                  >
                    <X size={12} />
                  </Button>
                </span>
              ))}
            </div>
          )}
        </div>

        {existingImages.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.groupLabel}>Existing Images</label>
            <div className={styles.imagePreview}>
              {existingImages.map((img, index) => (
                <div key={index} className={styles.previewItem}>
                  <img
                    src={
                      img.startsWith("http")
                        ? img
                        : `${BASE_URL}/uploads/services/${img}`
                    }
                    alt="Service"
                  />
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
              ))}
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.groupLabel}>Upload Images</label>
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
                {images.map((img, i) => (
                  <div key={i} className={styles.previewItem}>
                    <img src={URL.createObjectURL(img)} alt="Preview" />
                    <Button
                      type="button"
                      onClick={() => removeImage(i)}
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

        <Checkbox
          label="Available for booking"
          name="available"
          checked={formData.available}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
};

export default ServiceFormModal;
