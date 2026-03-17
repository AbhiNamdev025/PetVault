import React, { useState } from "react";
import styles from "./hospitalManagement.module.css";
import { API_BASE_URL, BASE_URL } from "../../../../../../utils/constants";
import toast from "react-hot-toast";
import { X, Upload, Eye, EyeOff, Plus } from "lucide-react";
import { Button, Input, Modal } from "../../../../../common";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const parseCertificateList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const DoctorFormModal = ({ doctor = null, hospitalId, onClose, onSaved }) => {
  const isEdit = Boolean(doctor?._id);
  const [form, setForm] = useState({
    name: doctor?.name || doctor?.roleData?.doctorName || "",
    email: doctor?.email || "",
    phone: doctor?.phone || "",
    password: "",
    doctorSpecialization: doctor?.roleData?.doctorSpecialization || "",
    doctorExperience: doctor?.roleData?.doctorExperience || "",
    consultationFee: doctor?.roleData?.consultationFee || "",
  });
  const [certificateInput, setCertificateInput] = useState("");
  const [certificates, setCertificates] = useState(() =>
    parseCertificateList(doctor?.roleData?.doctorCertificates),
  );
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingAvatar, setExistingAvatar] = useState(doctor?.avatar || null);
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

  const addCertificate = () => {
    const value = certificateInput.trim();
    if (!value) return;

    setCertificates((prev) => {
      const exists = prev.some(
        (certificate) => certificate.toLowerCase() === value.toLowerCase(),
      );
      return exists ? prev : [...prev, value];
    });
    setCertificateInput("");
  };

  const removeCertificate = (indexToRemove) => {
    setCertificates((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleCertificateKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addCertificate();
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";

    if (!isEdit) {
      if (!form.email.trim()) nextErrors.email = "Email is required";
      else if (!EMAIL_REGEX.test(form.email.trim())) {
        nextErrors.email = "Enter valid email";
      }
      if (!form.phone.trim()) nextErrors.phone = "Phone is required";
      else if (!PHONE_REGEX.test(form.phone.trim())) {
        nextErrors.phone = "Enter valid 10-digit phone";
      }
      if (!form.password) nextErrors.password = "Password is required";
      else if (form.password.length < 6) {
        nextErrors.password = "Minimum 6 characters";
      }
    } else {
      if (form.email && !EMAIL_REGEX.test(form.email.trim())) {
        nextErrors.email = "Enter valid email";
      }
      if (form.phone && !PHONE_REGEX.test(form.phone.trim())) {
        nextErrors.phone = "Enter valid 10-digit phone";
      }
    }

    if (!form.doctorSpecialization.trim()) {
      nextErrors.doctorSpecialization = "Specialization is required";
    }
    if (form.doctorExperience === "" || Number(form.doctorExperience) < 0) {
      nextErrors.doctorExperience = "Enter valid experience";
    }
    if (form.consultationFee === "" || Number(form.consultationFee) < 0) {
      nextErrors.consultationFee = "Enter valid fee";
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
    if (!isEdit) {
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      fd.append("password", form.password);
    } else {
      if (form.name.trim()) fd.append("name", form.name.trim());
      if (form.email.trim()) fd.append("email", form.email.trim());
      if (form.phone.trim()) fd.append("phone", form.phone.trim());
    }

    const normalizedName = form.name.trim();
    const normalizedCertificates = [...certificates, certificateInput.trim()]
      .map((item) => item.trim())
      .filter(Boolean)
      .filter(
        (item, index, list) =>
          list.findIndex(
            (candidate) =>
              candidate.toLowerCase() === item.toLowerCase(),
          ) === index,
      );

    const roleData = {
      doctorName: normalizedName,
      doctorSpecialization: form.doctorSpecialization.trim(),
      doctorExperience: Number(form.doctorExperience),
      consultationFee: Number(form.consultationFee),
      doctorCertificates: normalizedCertificates.join(", "),
      hospitalId: doctor?.roleData?.hospitalId || hospitalId,
    };

    fd.append("roleData", JSON.stringify(roleData));
    fd.append("role", "doctor");
    if (avatar) {
      fd.append("avatar", avatar);
      fd.append("roleImages", avatar);
    }

    try {
      const endpoint = isEdit
        ? `${API_BASE_URL}/doctor/${doctor._id}`
        : `${API_BASE_URL}/doctor`;
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
      toast.success(isEdit ? "Doctor Updated" : "Doctor Added Successfully");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(
        error.message || `Failed to ${isEdit ? "update" : "add"} doctor`,
      );
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit Doctor" : "Add Doctor"}
      size="md"
      hideContentPadding
      contentClassName={styles.modalContent}
      footer={
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose} size="md">
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} size="md">
            {isEdit ? "Update Doctor" : "Save Doctor"}
          </Button>
        </div>
      }
    >
      <Input
        label="Doctor Name"
        required
        name="name"
        className={styles.formGroup}
        placeholder="Enter doctor name"
        value={form.name}
        onChange={change}
        error={errors.name}
        fullWidth
      />

      <div className={styles.row}>
        <Input
          label="Email"
          required={!isEdit}
          name="email"
          className={styles.formGroup}
          placeholder="Enter email"
          value={form.email}
          onChange={change}
          error={errors.email}
          fullWidth
        />
        <Input
          label="Phone"
          required={!isEdit}
          name="phone"
          className={styles.formGroup}
          placeholder="Enter 10-digit phone"
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
          placeholder="Enter password"
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
          name="doctorSpecialization"
          className={styles.formGroup}
          placeholder="e.g. Cardiologist"
          value={form.doctorSpecialization}
          onChange={change}
          error={errors.doctorSpecialization}
          fullWidth
        />
        <Input
          label="Experience (Years)"
          required
          name="doctorExperience"
          type="number"
          className={styles.formGroup}
          placeholder="e.g. 5"
          value={form.doctorExperience}
          onChange={change}
          error={errors.doctorExperience}
          fullWidth
        />
      </div>

      <div className={styles.row}>
        <Input
          label="Consultation Fee"
          required
          name="consultationFee"
          type="number"
          className={styles.formGroup}
          placeholder="e.g. 400"
          value={form.consultationFee}
          onChange={change}
          error={errors.consultationFee}
          fullWidth
        />
      </div>

      <div className={styles.formGroup}>
        <Input
          label="Certificates"
          placeholder="Type a certificate and press Enter"
          value={certificateInput}
          onChange={(e) => setCertificateInput(e.target.value)}
          onKeyDown={handleCertificateKeyDown}
          helperText="Add one certificate at a time. Click Add to include it."
          rightElement={
            <Button
              type="button"
              onClick={addCertificate}
              className={styles.certificateAddBtn}
              variant="ghost"
              size="sm"
              aria-label="Add certificate"
            >
              <Plus size={16} />
            </Button>
          }
          maxLength={120}
          fullWidth
        />

        {certificates.length > 0 && (
          <div className={styles.certificateList}>
            {certificates.map((certificate, index) => (
              <span
                key={`${certificate}-${index}`}
                className={styles.certificateChip}
              >
                {certificate}
                <button
                  type="button"
                  className={styles.certificateRemove}
                  onClick={() => removeCertificate(index)}
                  aria-label={`Remove ${certificate}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          {isEdit ? "Update Profile Image" : "Upload Profile Image"}
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

export default DoctorFormModal;
