import React, { useState } from "react";
import styles from "./daycareManagement.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../../../utils/constants";
import toast from "react-hot-toast";
import { X, Upload, Eye, EyeOff } from "lucide-react";
import { Button, Input, Modal } from "../../../../../common";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

const CaretakerFormModal = ({
  caretaker = null,
  daycareId,
  onClose,
  onSaved,
}) => {
  const isEdit = Boolean(caretaker?._id);
  const [form, setForm] = useState({
    name: caretaker?.name || "",
    email: caretaker?.email || "",
    phone: caretaker?.phone || "",
    password: "",
    staffSpecialization: caretaker?.roleData?.staffSpecialization || "",
    staffExperience: caretaker?.roleData?.staffExperience || "",
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingAvatar, setExistingAvatar] = useState(
    caretaker?.avatar || null,
  );
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
      if (isEdit) setExistingAvatar(null);
    }
  };

  const removeImage = () => {
    setAvatar(null);
    setPreview(null);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = "Enter valid email";
    }
    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
    else if (!PHONE_REGEX.test(form.phone.trim())) {
      nextErrors.phone = "Enter valid 10-digit phone";
    }
    if (!isEdit) {
      if (!form.password) nextErrors.password = "Password is required";
      else if (form.password.length < 6) {
        nextErrors.password = "Minimum 6 characters";
      }
    }
    if (!form.staffSpecialization.trim()) {
      nextErrors.staffSpecialization = "Specialization is required";
    }
    if (form.staffExperience === "" || Number(form.staffExperience) < 0) {
      nextErrors.staffExperience = "Enter valid experience";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    if (!validateForm()) {
      toast.error("Please fix highlighted fields");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim());
    fd.append("phone", form.phone.trim());
    if (!isEdit) {
      fd.append("password", form.password);
    }
    fd.append(
      "roleData",
      JSON.stringify({
        staffSpecialization: form.staffSpecialization.trim(),
        staffExperience: Number(form.staffExperience),
        daycareId: caretaker?.roleData?.daycareId || daycareId,
      }),
    );
    if (!isEdit) {
      fd.append("role", "caretaker");
    }
    if (avatar) {
      fd.append("avatar", avatar);
      fd.append("roleImages", avatar);
    }

    try {
      const endpoint = isEdit
        ? `${API_BASE_URL}/caretaker/${caretaker._id}`
        : `${API_BASE_URL}/caretaker`;
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
        throw new Error(data.message || "Request failed");
      }
      toast.success(isEdit ? "Caretaker updated" : "Caretaker Added");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(
        error.message || `Failed to ${isEdit ? "update" : "add"} caretaker`,
      );
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit Caretaker" : "Add Caretaker"}
      size="md"
      hideContentPadding
      contentClassName={styles.modalContent}
      footer={
        <div className={styles.modalFooter}>
          <Button
            className={styles.cancelBtn}
            onClick={onClose}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            className={styles.submitBtn}
            onClick={submit}
            variant="primary"
            size="md"
          >
            {isEdit ? "Update" : "Save Caretaker"}
          </Button>
        </div>
      }
    >
      <Input
        label="Full Name"
        required
        name="name"
        className={styles.formGroup}
        placeholder="John Doe"
        value={form.name}
        onChange={change}
        error={errors.name}
        fullWidth
      />

      <div className={styles.row}>
        <Input
          label="Email"
          required
          name="email"
          className={styles.formGroup}
          placeholder="john@example.com"
          value={form.email}
          onChange={change}
          error={errors.email}
          fullWidth
        />
        <Input
          label="Phone"
          required
          name="phone"
          className={styles.formGroup}
          placeholder="1234567890"
          value={form.phone}
          onChange={change}
          error={errors.phone}
          fullWidth
        />
      </div>

      {!isEdit && (
        <Input
          label="Password"
          required
          name="password"
          type={showPassword ? "text" : "password"}
          className={styles.formGroup}
          placeholder="******"
          value={form.password}
          onChange={change}
          error={errors.password}
          fullWidth
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle password visibility"
              className={styles.eyeBtn}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
      )}

      <div className={styles.row}>
        <Input
          label="Specialization"
          required
          name="staffSpecialization"
          className={styles.formGroup}
          placeholder="e.g. Dog Trainer"
          value={form.staffSpecialization}
          onChange={change}
          error={errors.staffSpecialization}
          fullWidth
        />
        <Input
          label="Experience (Years)"
          required
          name="staffExperience"
          type="number"
          className={styles.formGroup}
          placeholder="5"
          value={form.staffExperience}
          onChange={change}
          error={errors.staffExperience}
          fullWidth
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          {isEdit ? "Update Profile Image" : "Profile Image"}
        </label>
        <div className={styles.uploadArea}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className={styles.fileInput}
          />
          <div className={styles.uploadContent}>
            <Upload size={32} className={styles.uploadIcon} />
            <p>
              {isEdit
                ? "Click to replace profile image"
                : "Click to upload profile image"}
            </p>
          </div>
        </div>

        {(preview || existingAvatar) && (
          <div
            className={`${styles.imagePreviewGrid} ${styles.previewMarginTop}`}
          >
            <div className={styles.imagePreview}>
              <img
                src={
                  preview
                    ? preview
                    : `${BASE_URL}/uploads/avatars/${existingAvatar}`
                }
                alt="preview"
              />
              {preview && (
                <Button
                  type="button"
                  onClick={removeImage}
                  className={styles.removeBtn}
                  variant="ghost"
                  size="xs"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CaretakerFormModal;
