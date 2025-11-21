import React, { useState } from "react";
import styles from "./shopManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { toast } from "react-toastify";

const EditProductModal = ({ product, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    name: product.name || "",
    brand: product.brand || "",
    price: product.price || "",
    stock: product.stock || "",
    category: product.category || "",
    description: product.description || "",
    features: product.features?.join(", ") || "",
  });

  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    // Validation
    if (!form.name || !form.price || !form.category) {
      toast.error("Please fill in required fields: Name, Price, and Category");
      return;
    }

    setLoading(true);

    const fd = new FormData();

    fd.append("name", form.name);
    fd.append("brand", form.brand);
    fd.append("price", form.price);
    fd.append("stock", form.stock);
    fd.append("category", form.category);
    fd.append("description", form.description);

    // Handle features correctly
    if (form.features) {
      const featuresArray = form.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f !== "");
      fd.append("features", featuresArray.join(","));
    }

    // Handle new images
    if (newImages.length > 0) {
      newImages.forEach((img) => fd.append("productImages", img));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products/${product._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Product updated successfully");
        onUpdated();
        onClose();
      } else {
        throw new Error(data.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Update product error:", err);
      toast.error(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Edit Product</h3>

        <label className={styles.label}>Product Name *</label>
        <input name="name" value={form.name} onChange={change} required />

        <label className={styles.label}>Brand</label>
        <input name="brand" value={form.brand} onChange={change} />

        <label className={styles.label}>Price *</label>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={change}
          required
        />

        <label className={styles.label}>Stock</label>
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={change}
        />

        <label className={styles.label}>Category *</label>
        <select
          name="category"
          value={form.category}
          onChange={change}
          required
        >
          <option value="food">Food</option>
          <option value="toy">Toy</option>
          <option value="accessory">Accessory</option>
          <option value="health">Health</option>
          <option value="grooming">Grooming</option>
          <option value="bedding">Bedding</option>
        </select>

        <label className={styles.label}>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={change}
          rows="3"
        />

        <label className={styles.label}>Features (comma separated)</label>
        <textarea
          name="features"
          value={form.features}
          onChange={change}
          rows="2"
        />

        <label className={styles.label}>Upload New Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setNewImages([...e.target.files])}
        />
        {newImages.length > 0 && (
          <p className={styles.fileInfo}>
            {newImages.length} new image(s) selected
          </p>
        )}

        <div className={styles.modalActions}>
          <button
            onClick={submit}
            disabled={loading}
            className={loading ? styles.loadingBtn : ""}
          >
            {loading ? "Updating..." : "Update"}
          </button>
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
