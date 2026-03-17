import React, { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import styles from "./addProductModal.module.css";
import { Modal, Button, Select, Input, Textarea } from "../../../common";
const AddProductModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "food",
    price: "",
    description: "",
    stock: "",
    rating: "",
    brand: "",
    features: [],
  });
  const [featureInput, setFeatureInput] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const addFeature = () => {
    const value = featureInput.trim();
    if (!value) return;
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(value)
        ? prev.features
        : [...prev.features, value],
    }));
    setFeatureInput("");
  };
  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };
  const handleFeatureKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
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
      const featuresPayload = [
        ...formData.features,
        ...(featureInput.trim() ? [featureInput.trim()] : []),
      ].filter(Boolean);
      const submitData = {
        ...formData,
        price: formData.price,
        stock: formData.stock,
        features: featuresPayload,
        images: images,
      };
      await onSave(submitData);
    } catch (error) {
      console.error("Error adding product:", error);
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
      <>
        <div className={styles.modalHeader}>
          <h2>Add New Product</h2>
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
              <label>Product Name *</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
              />
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
                    label: "Food",
                    value: "food",
                  },
                  {
                    label: "Toys",
                    value: "toy",
                  },
                  {
                    label: "Accessories",
                    value: "accessory",
                  },
                  {
                    label: "Health",
                    value: "health",
                  },
                  {
                    label: "Grooming",
                    value: "grooming",
                  },
                  {
                    label: "Bedding",
                    value: "bedding",
                  },
                ]}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Brand</label>
              <Input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <label>Price (Rs) *</label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                fullWidth
              />
            </div>

            <div className={styles.formGroup}>
              <label>Stock *</label>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required
                fullWidth
              />
            </div>
            <div className={styles.formGroup}>
              <label>Rating</label>
              <Input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                required
                fullWidth
              />
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

          <div className={styles.formGroup}>
            <label>Features</label>
            <div className={styles.inputWithButton}>
              <Input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={handleFeatureKeyDown}
                placeholder="Add feature..."
                fullWidth
              />
              <Button
                type="button"
                onClick={addFeature}
                className={styles.plusBtn}
                variant="ghost"
                size="sm"
                aria-label="Add feature"
              >
                <Plus size={18} />
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className={styles.tagGrid}>
                {formData.features.map((feature, index) => (
                  <span key={`${feature}-${index}`} className={styles.tag}>
                    {feature}
                    <Button
                      type="button"
                      onClick={() => removeFeature(index)}
                      variant="ghost"
                      size="xs"
                      className={styles.tagRemove}
                      aria-label={`Remove ${feature}`}
                    >
                      <X size={12} />
                    </Button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Upload Images</label>
            <div className={styles.imageUpload}>
              <label className={styles.uploadArea}>
                <Upload size={24} />
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
                  {images.map((image, index) => (
                    <div key={index} className={styles.previewItem}>
                      <img src={URL.createObjectURL(image)} alt="Preview" />
                      <Button
                        type="button"
                        onClick={() => removeImage(index)}
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
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </>
    </Modal>
  );
};
export default AddProductModal;
