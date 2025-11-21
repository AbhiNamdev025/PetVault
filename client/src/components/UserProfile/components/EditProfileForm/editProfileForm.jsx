import React, { useState } from "react";
import styles from "./editProfileForm.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import { toast } from "react-toastify";

const getRoleFields = (role) => {
  const fields = {
    doctor: [
      { name: "doctorName", label: "Doctor Name", type: "text" },
      { name: "doctorSpecialization", label: "Specialization", type: "text" },
      { name: "doctorExperience", label: "Experience (years)", type: "number" },
      {
        name: "consultationFee",
        label: "Consultation Fee (₹)",
        type: "number",
      },
      { name: "hospitalName", label: "Hospital Name", type: "text" },
      { name: "doctorCertificates", label: "Certificates", type: "textarea" },
    ],
    hospital: [
      { name: "hospitalName", label: "Hospital Name", type: "text" },
      { name: "hospitalDescription", label: "Description", type: "textarea" },
      { name: "hospitalServices", label: "Services", type: "text" },
    ],
    caretaker: [
      { name: "staffSpecialization", label: "Specialization", type: "text" },
      { name: "staffExperience", label: "Experience (years)", type: "number" },
      {
        name: "serviceDescription",
        label: "Service Description",
        type: "textarea",
      },
      { name: "hourlyRate", label: "Hourly Rate (₹)", type: "number" },
      { name: "serviceType", label: "Service Type", type: "text" },
    ],
    daycare: [
      { name: "daycareName", label: "Daycare Name", type: "text" },
      { name: "maxPetsAllowed", label: "Max Pets Allowed", type: "number" },
      { name: "daycareDescription", label: "Description", type: "textarea" },
    ],
    shop: [
      { name: "shopName", label: "Shop Name", type: "text" },
      {
        name: "shopType",
        label: "Shop Type",
        type: "select",
        options: ["petStore", "groomingCenter", "medicalStore", "mixed"],
      },
      {
        name: "deliveryAvailable",
        label: "Delivery Available",
        type: "checkbox",
      },
      { name: "deliveryRadius", label: "Delivery Radius (km)", type: "number" },
      { name: "servicesOffered", label: "Services Offered", type: "text" },
    ],
    ngo: [
      { name: "ngoName", label: "NGO Name", type: "text" },
      { name: "servicesOffered", label: "Services Offered", type: "text" },
    ],
  };
  return fields[role] || [];
};

const getQualificationFields = () => [
  { name: "degree", label: "Degree", type: "text" },
  { name: "institution", label: "Institution", type: "text" },
  { name: "yearOfCompletion", label: "Year of Completion", type: "number" },
  { name: "licenseNumber", label: "License Number", type: "text" },
  { name: "certifications", label: "Certifications", type: "text" },
  { name: "skills", label: "Skills", type: "text" },
  { name: "languages", label: "Languages", type: "text" },
];

const normalize = (val) =>
  Array.isArray(val)
    ? val
    : typeof val === "string"
    ? val.split(",").map((v) => v.trim())
    : [];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const EditProfileForm = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || { street: "", city: "", state: "", zipCode: "" },
    roleData: {
      ...user.roleData,
      hospitalServices: normalize(user.roleData?.hospitalServices),
      servicesOffered: normalize(user.roleData?.servicesOffered),
      doctorQualifications: {
        ...user.roleData?.doctorQualifications,
        certifications: normalize(
          user.roleData?.doctorQualifications?.certifications
        ),
        skills: normalize(user.roleData?.doctorQualifications?.skills),
        languages: normalize(user.roleData?.doctorQualifications?.languages),
      },
    },
    availability: user.availability || {
      available: false,
      days: [],
      startTime: "",
      endTime: "",
      serviceRadius: "",
      statusNote: "",
    },
  });

  const [avatar, setAvatar] = useState(null);
  const [roleImages, setRoleImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const getUpdateURL = () => {
    const endpoints = {
      doctor: `${API_BASE_URL}/doctor/${user._id}`,
      caretaker: `${API_BASE_URL}/caretaker/${user._id}`,
      hospital: `${API_BASE_URL}/hospital/${user._id}`,
      daycare: `${API_BASE_URL}/daycare/${user._id}`,
      shop: `${API_BASE_URL}/shop/${user._id}`,
      ngo: `${API_BASE_URL}/ngo/${user._id}`,
    };
    return endpoints[user.role] || `${API_BASE_URL}/user/${user._id}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((p) => ({ ...p, address: { ...p.address, [field]: value } }));
    } else if (name.startsWith("roleData.doctorQualifications.")) {
      const field = name.split(".")[2];
      setFormData((p) => ({
        ...p,
        roleData: {
          ...p.roleData,
          doctorQualifications: {
            ...p.roleData.doctorQualifications,
            [field]: value,
          },
        },
      }));
    } else if (name.startsWith("roleData.")) {
      const field = name.split(".")[1];
      setFormData((p) => ({
        ...p,
        roleData: { ...p.roleData, [field]: value },
      }));
    } else if (name.startsWith("availability.")) {
      const field = name.split(".")[1];
      setFormData((p) => ({
        ...p,
        availability: {
          ...p.availability,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleArrayFieldChange = (fullName, value) => {
    const values = value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);
    if (fullName.startsWith("roleData.doctorQualifications.")) {
      const field = fullName.split(".")[2];
      setFormData((p) => ({
        ...p,
        roleData: {
          ...p.roleData,
          doctorQualifications: {
            ...p.roleData.doctorQualifications,
            [field]: values,
          },
        },
      }));
    } else if (fullName.startsWith("roleData.")) {
      const field = fullName.split(".")[1];
      setFormData((p) => ({
        ...p,
        roleData: { ...p.roleData, [field]: values },
      }));
    }
  };

  const handleDaysChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setFormData((p) => ({
      ...p,
      availability: { ...p.availability, days: selected },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("address", JSON.stringify(formData.address));

      form.append("roleData", JSON.stringify(formData.roleData));
      form.append("availability", JSON.stringify(formData.availability));

      if (avatar) form.append("avatar", avatar);
      roleImages.forEach((img) => form.append("roleImages", img));

      const res = await fetch(getUpdateURL(), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error();

      const updatedUser = await res.json();
      toast.success("Profile updated successfully!");
      onUpdate(updatedUser);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field, prefix = "roleData") => {
    const { name, label, type, options } = field;
    const fullName = `${prefix}.${name}`;

    let value =
      prefix === "roleData.doctorQualifications"
        ? formData.roleData.doctorQualifications?.[name]
        : formData.roleData[name];

    if (Array.isArray(value)) value = value.join(", ");

    const isArrayField = [
      "certifications",
      "skills",
      "languages",
      "hospitalServices",
      "servicesOffered",
    ].includes(name);

    if (type === "textarea")
      return (
        <div className={styles.fieldGroup} key={fullName}>
          <label className={styles.label}>{label}</label>
          <textarea
            className={styles.textarea}
            name={fullName}
            value={value || ""}
            onChange={(e) =>
              isArrayField
                ? handleArrayFieldChange(fullName, e.target.value)
                : handleChange(e)
            }
            rows={3}
          />
        </div>
      );

    if (type === "select")
      return (
        <div className={styles.fieldGroup} key={fullName}>
          <label className={styles.label}>{label}</label>
          <select
            className={styles.select}
            name={fullName}
            value={value || ""}
            onChange={handleChange}
          >
            <option value="">Select {label}</option>
            {options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    if (type === "checkbox")
      return (
        <div className={styles.fieldGroup} key={fullName}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name={fullName}
              checked={!!value}
              onChange={handleChange}
            />
            {label}
          </label>
        </div>
      );

    return (
      <div className={styles.fieldGroup} key={fullName}>
        <label className={styles.label}>{label}</label>
        <input
          className={styles.input}
          type={type}
          name={fullName}
          value={value || ""}
          onChange={(e) =>
            isArrayField
              ? handleArrayFieldChange(fullName, e.target.value)
              : handleChange(e)
          }
        />
      </div>
    );
  };

  const roleFields = getRoleFields(user.role);
  const qualificationFields =
    user.role === "doctor" ? getQualificationFields() : [];
  const isServiceProvider = !["user", "admin"].includes(user.role);

  return (
    <div className={styles.card}>
      <h3 className={styles.sectionTitle}>Edit Profile</h3>

      <div className={styles.section}>
        <h4 className={styles.subsectionTitle}>Basic Information</h4>
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phone</label>
            <input
              className={styles.input}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.subsectionTitle}>Address</h4>
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Street</label>
            <input
              className={styles.input}
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>City</label>
            <input
              className={styles.input}
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>State</label>
            <input
              className={styles.input}
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Zip Code</label>
            <input
              className={styles.input}
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {roleFields.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.subsectionTitle}>{user.role} Information</h4>
          <div className={styles.roleFields}>
            {roleFields.map((f) => renderInput(f))}
          </div>
        </div>
      )}

      {qualificationFields.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.subsectionTitle}>Qualifications</h4>
          <div className={styles.roleFields}>
            {qualificationFields.map((f) =>
              renderInput(f, "roleData.doctorQualifications")
            )}
          </div>
        </div>
      )}

      {isServiceProvider && (
        <div className={styles.section}>
          <h4 className={styles.subsectionTitle}>Availability</h4>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="availability.available"
                  checked={formData.availability.available}
                  onChange={handleChange}
                />
                Available
              </label>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Working Days</label>
              <select
                multiple
                className={styles.select}
                value={formData.availability.days}
                onChange={handleDaysChange}
                size={4}
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Start Time</label>
              <input
                type="time"
                className={styles.input}
                name="availability.startTime"
                value={formData.availability.startTime}
                onChange={handleChange}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>End Time</label>
              <input
                type="time"
                className={styles.input}
                name="availability.endTime"
                value={formData.availability.endTime}
                onChange={handleChange}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Service Radius (km)</label>
              <input
                type="number"
                className={styles.input}
                name="availability.serviceRadius"
                value={formData.availability.serviceRadius}
                onChange={handleChange}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Status Note</label>
              <input
                type="text"
                className={styles.input}
                name="availability.statusNote"
                value={formData.availability.statusNote}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h4 className={styles.subsectionTitle}>Images</h4>
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Role Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setRoleImages([...e.target.files])}
            />
          </div>
        </div>
      </div>

      <button
        className={styles.saveBtn}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default EditProfileForm;
