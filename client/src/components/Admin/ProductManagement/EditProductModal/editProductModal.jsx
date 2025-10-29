import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import styles from "./editProductModal.module.css";
import { API_BASE_URL } from "../../../../utils/constants";

const EditProductModal = ({ product, onClose, onSave }) => {
  if (!product) return null;

  const [formData, setFormData] = useState({
    name: "",
    category: "food",
    price: "",
    description: "",
    stock: "",
    rating: "",
    brand: "",
    features: "",
  });
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
        brand: product.brand || "",
        features: product.features ? product.features.join(", ") : "",
      });
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
        ...formData,
        price: formData.price,
        stock: formData.stock,
        features: formData.features
          ? formData.features.split(",").map((f) => f.trim())
          : [],
      };

      if (images.length > 0) {
        submitData.images = images;
      }

      await onSave(product._id, submitData);
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!product || !product._id) {
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
            <p>No product data available. Please try again.</p>
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
          <h2>Edit Product</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="food">Food</option>
                <option value="toy">Toys</option>
                <option value="accessory">Accessories</option>
                <option value="health">Health</option>
                <option value="grooming">Grooming</option>
                <option value="bedding">Bedding</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
              />
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

            <div className={styles.formGroup}>
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Rating</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
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
              rows="4"
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
              placeholder="Feature 1, Feature 2, Feature 3"
            />
          </div>

          {existingImages.length > 0 && (
            <div className={styles.formGroup}>
              <label>Current Images</label>
              <div className={styles.imagePreview}>
                {existingImages.map((image, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img
                      src={`http://localhost:5000/uploads/products/${product.images?.[0]}`}
                      alt={product.name}
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
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
