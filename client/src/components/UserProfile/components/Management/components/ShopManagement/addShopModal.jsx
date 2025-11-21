import React, { useState } from "react";
import styles from "./shopManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { toast } from "react-toastify";

const AddProductModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    features: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const token =
    JSON.parse(localStorage.getItem("token")) ||
    JSON.parse(sessionStorage.getItem("token"));
  const savedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const shopId = savedUser?._id;

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    if (!token || !shopId) {
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
    fd.append("price", Number(form.price));
    fd.append("stock", Number(form.stock) || 0);
    fd.append("category", form.category);
    fd.append("description", form.description);
    fd.append("shopId", shopId);

    // Handle features
    if (form.features) {
      const featuresArray = form.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f !== "");
      fd.append("features", featuresArray.join(","));
    }

    // Handle images
    if (images.length > 0) {
      images.forEach((img) => fd.append("productImages", img));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Product added successfully");
        onAdded();
        onClose();
      } else {
        throw new Error(data.message || "Failed to add product");
      }
    } catch (err) {
      console.error("Create product error:", err);
      toast.error(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Add Product</h3>

        <input
          name="name"
          placeholder="Product Name *"
          value={form.name}
          onChange={change}
          required
        />
        <input
          name="brand"
          placeholder="Brand"
          value={form.brand}
          onChange={change}
        />
        <input
          name="price"
          type="number"
          placeholder="Price *"
          value={form.price}
          onChange={change}
          required
        />
        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={change}
        />

        <select
          name="category"
          value={form.category}
          onChange={change}
          required
        >
          <option value="">Select Category *</option>
          <option value="food">Food</option>
          <option value="toy">Toy</option>
          <option value="accessory">Accessory</option>
          <option value="health">Health</option>
          <option value="grooming">Grooming</option>
          <option value="bedding">Bedding</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={change}
          rows="3"
        />

        <textarea
          name="features"
          placeholder="Features (comma separated)"
          value={form.features}
          onChange={change}
          rows="2"
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setImages([...e.target.files])}
        />
        {images.length > 0 && (
          <p className={styles.fileInfo}>{images.length} image(s) selected</p>
        )}

        <div className={styles.modalActions}>
          <button
            onClick={submit}
            disabled={loading}
            className={loading ? styles.loadingBtn : ""}
          >
            {loading ? "Adding..." : "Save"}
          </button>
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
