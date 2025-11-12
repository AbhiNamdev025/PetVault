import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import styles from "./editProductModal.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import { toast } from "react-toastify";

const EditProductModal = ({ product, onClose }) => {
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
        rating: product.rating ? product.rating.toString() : "",
        brand: product.brand || "",
        features: product.features ? product.features.join(", ") : "",
      });
      setExistingImages(product.images || []);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const res = await fetch(`${API_BASE_URL}/products/${product._id}/image/${img}`, {
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
        images.forEach((img) => form.append("productImages", img));
      }
      const res = await fetch(`${API_BASE_URL}/products/${product._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
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
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required>
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
              <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label>Price (Rs)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" step="0.01" />
            </div>
            <div className={styles.formGroup}>
              <label>Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} min="0" />
            </div>
            <div className={styles.formGroup}>
              <label>Rating</label>
              <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} min="0" />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" required />
          </div>
          <div className={styles.formGroup}>
            <label>Features (comma separated)</label>
            <input type="text" name="features" value={formData.features} onChange={handleInputChange} />
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
            <label>Add New Images</label>
            <div className={styles.imageUpload}>
              <label className={styles.uploadArea}>
                <Upload size={24} />
                <span>Click to upload</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className={styles.fileInput} />
              </label>
              {images.length > 0 && (
                <div className={styles.imagePreview}>
                  {images.map((image, i) => (
                    <div key={i} className={styles.previewItem}>
                      <img src={URL.createObjectURL(image)} alt="Preview" />
                      <button type="button" onClick={() => removeNewImage(i)} className={styles.removeImage}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
