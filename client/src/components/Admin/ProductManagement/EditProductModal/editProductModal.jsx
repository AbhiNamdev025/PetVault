import React, { useState, useEffect } from "react";
import { X, Upload, Plus } from "lucide-react";
import styles from "./editProductModal.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import toast from "react-hot-toast";
import { Modal, Button, Select, Input, Textarea } from "../../../common";

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

const EditProductModal = ({ product, onClose }) => {
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
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (product && product._id) {
      setFormData({
        name: product.name || "",
        category: product.category || "food",
        price: product.price ? product.price.toString() : "",
        description: product.description || "",
        stock: product.stock ? product.stock.toString() : "",
        rating: product.rating ? product.rating.toString() : "",
        brand: product.brand || "",
        features: normalizeFeatures(product.features),
      });
      setFeatureInput("");
      setExistingImages(product.images || []);
    }
  }, [product]);
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
  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const handleDeleteExistingImage = async (img) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/products/${product._id}/image/${img}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "features") {
          form.append(key, value);
        }
      });

      const featuresPayload = [
        ...formData.features,
        ...(featureInput.trim() ? [featureInput.trim()] : []),
      ].filter(Boolean);

      if (featuresPayload.length > 0) {
        form.append("features", Array.from(new Set(featuresPayload)).join(","));
      }

      if (images.length > 0) {
        form.append("replaceImages", "false");
        images.forEach((img) => form.append("productImages", img));
      }
      const res = await fetch(`${API_BASE_URL}/products/${product._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      if (res.ok) {
        const updated = await res.json();
        setExistingImages(updated.images || []);
        toast.success("Product updated");
        onClose();
      } else toast.error("Failed to update product");
    } catch {
      toast.error("Error updating product");
    } finally {
      setLoading(false);
    }
  };
  if (!product || !product._id) return null;
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
          <h2>Edit Product</h2>
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
                label="Product Name"
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
              <Input
                type="text"
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                fullWidth
                className={styles.inputField}
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
                fullWidth
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <Input
                type="number"
                label="Stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                fullWidth
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <Input
                type="number"
                label="Rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                fullWidth
                className={styles.inputField}
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
                className={styles.inputField}
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
          {existingImages.length > 0 && (
            <div className={styles.formGroup}>
              <label>Existing Images</label>
              <div className={styles.imagePreview}>
                {existingImages.map((img, index) => {
                  const imageUrl = img.startsWith("http")
                    ? img
                    : `${API_BASE_URL.replace("/api", "")}/uploads/products/${img}`;
                  return (
                    <div key={index} className={styles.previewItem}>
                      <img src={imageUrl} alt="Product" />
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
            <label>Add New Images</label>
            <div className={styles.imageUpload}>
              <label className={styles.uploadArea}>
                <Upload size={24} />
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
                  {images.map((image, i) => (
                    <div key={i} className={styles.previewItem}>
                      <img src={URL.createObjectURL(image)} alt="Preview" />
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
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </>
    </Modal>
  );
};
export default EditProductModal;
