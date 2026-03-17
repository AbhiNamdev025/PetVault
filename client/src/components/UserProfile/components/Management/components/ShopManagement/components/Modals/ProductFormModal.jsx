import React, { useMemo, useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import styles from "../ShopProducts/ShopProducts.module.css";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  Textarea,
} from "../../../../../../../common";
import { API_BASE_URL } from "../../../../../../../../utils/constants";

const CATEGORY_OPTIONS = [
  { value: "food", label: "Food" },
  { value: "toy", label: "Toy" },
  { value: "accessory", label: "Accessory" },
  { value: "health", label: "Health" },
  { value: "grooming", label: "Grooming" },
  { value: "bedding", label: "Bedding" },
];

const normalizeFeatures = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const ProductFormModal = ({ product = null, onClose, onSaved }) => {
  const isEdit = Boolean(product?._id);
  const [form, setForm] = useState({
    name: product?.name || "",
    brand: product?.brand || "",
    price: product?.price || "",
    stock: product?.stock || "",
    category: product?.category || "",
    description: product?.description || "",
    features: normalizeFeatures(product?.features),
    available: product?.available !== false,
  });
  const [featureInput, setFeatureInput] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState("");

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const savedUser = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null",
  );
  const shopId = savedUser?._id;

  const newPreviews = useMemo(
    () => newImages.map((file) => URL.createObjectURL(file)),
    [newImages],
  );

  const handleDeleteExistingImage = async (img) => {
    if (!isEdit) return;
    try {
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

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    if (uploadError) setUploadError("");
  };

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const addFeature = () => {
    const value = featureInput.trim();
    if (!value) return;
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(value)
        ? prev.features
        : [...prev.features, value],
    }));
    setFeatureInput("");
  };

  const removeFeature = (index) => {
    setForm((prev) => ({
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

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Product name is required";
    if (!form.category) nextErrors.category = "Category is required";
    if (form.price === "" || Number(form.price) <= 0) {
      nextErrors.price = "Enter valid price";
    }
    if (form.stock !== "" && Number(form.stock) < 0) {
      nextErrors.stock = "Stock cannot be negative";
    }

    setErrors(nextErrors);

    if (!isEdit && newImages.length === 0) {
      setUploadError("At least one product image is required");
    } else {
      setUploadError("");
    }

    return (
      Object.keys(nextErrors).length === 0 && (isEdit || newImages.length > 0)
    );
  };

  const submit = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    if (!isEdit && !shopId) {
      toast.error("Shop not found");
      return;
    }
    if (!validateForm()) {
      toast.error("Please fix highlighted fields");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("brand", form.brand.trim());
    fd.append("price", Number(form.price));
    fd.append("stock", Number(form.stock) || 0);
    fd.append("category", form.category);
    fd.append("description", form.description.trim());
    fd.append("available", form.available !== false);

    const featuresPayload = [
      ...form.features,
      ...(featureInput.trim() ? [featureInput.trim()] : []),
    ].filter(Boolean);

    if (featuresPayload.length > 0) {
      fd.append("features", Array.from(new Set(featuresPayload)).join(","));
    }

    if (!isEdit) {
      fd.append("shopId", shopId);
    }

    if (newImages.length > 0) {
      newImages.forEach((img) => fd.append("productImages", img));
    }

    try {
      const endpoint = isEdit
        ? `${API_BASE_URL}/products/${product._id}`
        : `${API_BASE_URL}/products`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || `Failed to ${isEdit ? "update" : "add"} product`,
        );
      }

      toast.success(
        isEdit ? "Product updated successfully" : "Product added successfully",
      );
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(
        err.message || `Failed to ${isEdit ? "update" : "add"} product`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit Product" : "Add Product"}
      size="md"
      hideContentPadding
      contentClassName={styles.modalContent}
      footer={
        <div className={styles.modalFooter}>
          <Button
            onClick={onClose}
            disabled={loading}
            className={styles.cancelBtn}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={loading}
            className={`${styles.submitBtn} ${loading ? styles.loadingBtn : ""}`}
            variant="primary"
            size="md"
          >
            {loading
              ? isEdit
                ? "Updating Product..."
                : "Adding Product..."
              : isEdit
                ? "Update Product"
                : "Add Product"}
          </Button>
        </div>
      }
    >
      <Input
        label="Product Name"
        required
        name="name"
        value={form.name}
        onChange={change}
        error={errors.name}
        fullWidth
        className={styles.formGroup}
      />

      <div className={styles.row}>
        <Input
          label="Brand"
          name="brand"
          value={form.brand}
          onChange={change}
          fullWidth
          className={styles.formGroup}
        />
        <Select
          label="Category"
          required
          name="category"
          value={form.category}
          onChange={change}
          options={CATEGORY_OPTIONS}
          placeholder="Select Category"
          error={errors.category}
          fullWidth
          className={styles.formGroup}
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Price (₹)"
          required
          name="price"
          type="number"
          value={form.price}
          onChange={change}
          error={errors.price}
          fullWidth
          className={styles.formGroup}
        />
        <Input
          label="Stock"
          name="stock"
          type="number"
          value={form.stock}
          onChange={change}
          error={errors.stock}
          fullWidth
          className={styles.formGroup}
        />
      </div>

      <Checkbox
        label="Mark as Available"
        name="available"
        checked={form.available !== false}
        onChange={change}
        className={styles.formGroup}
      />

      <Textarea
        label="Description"
        name="description"
        value={form.description}
        onChange={change}
        rows={3}
        fullWidth
        className={styles.formGroup}
      />

      <div className={styles.formGroup}>
        <label className={styles.label}>Features</label>
        <div className={styles.inputWithButton}>
          <Input
            placeholder="Add feature..."
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={handleFeatureKeyDown}
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
            <Plus size={20} />
          </Button>
        </div>
        {form.features.length > 0 && (
          <div className={styles.tagGrid}>
            {form.features.map((feature, index) => (
              <span key={`${feature}-${index}`} className={styles.tag}>
                {feature}
                <Button
                  type="button"
                  onClick={() => removeFeature(index)}
                  variant="ghost"
                  size="sm"
                  className={styles.removeTag}
                  aria-label={`Remove ${feature}`}
                >
                  <X size={12} />
                </Button>
              </span>
            ))}
          </div>
        )}
      </div>

      {isEdit && existingImages.length > 0 && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Existing Images</label>
          <div className={styles.imagePreviewGrid}>
            {existingImages.map((img, i) => (
              <div key={i} className={styles.imagePreview}>
                <img
                  src={`${API_BASE_URL.replace("/api", "")}/uploads/products/${img}`}
                  alt="product"
                />
                <Button
                  type="button"
                  onClick={() => handleDeleteExistingImage(img)}
                  className={styles.removeBtn}
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
        <label className={styles.label}>
          {isEdit ? "Add New Images" : "Product Images *"}
        </label>
        <div className={styles.uploadArea}>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className={styles.fileInput}
          />
          <div className={styles.uploadContent}>
            <Upload size={32} className={styles.uploadIcon} />
            <p>Click or drag images here to upload</p>
          </div>
        </div>
        {uploadError && (
          <p className={styles.uploadError}>{uploadError}</p>
        )}

        {newImages.length > 0 && (
          <div className={styles.imagePreviewGrid}>
            {newPreviews.map((src, i) => (
              <div key={i} className={styles.imagePreview}>
                <img src={src} alt="preview" />
                <Button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className={styles.removeBtn}
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
    </Modal>
  );
};

export default ProductFormModal;
