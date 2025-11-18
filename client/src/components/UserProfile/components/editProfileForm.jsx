import React, { useState } from "react";
import styles from "../userProfile.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import { toast } from "react-toastify";

// Simple field configuration - easier to understand
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
    ],
    ngo: [
      { name: "ngoName", label: "NGO Name", type: "text" },
      { name: "servicesOffered", label: "Services Offered", type: "text" },
    ],
  };
  return fields[role] || [];
};

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
  // Simple state management
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    roleData: user.roleData || {},
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

  // Get the correct API endpoint based on user role
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

  // Handle input changes - SIMPLIFIED
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.startsWith("roleData.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        roleData: {
          ...prev.roleData,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name.startsWith("availability.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle multiple select for days
  const handleDaysChange = (e) => {
    const selectedDays = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({
      ...prev,
      availability: { ...prev.availability, days: selectedDays },
    }));
  };

  // Submit form - SIMPLIFIED
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      // 1. Add basic info
      form.append("name", formData.name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);

      // 2. Add address as JSON
      form.append("address", JSON.stringify(formData.address));

      // 3. Add role data as JSON
      form.append("roleData", JSON.stringify(formData.roleData));

      // 4. Add availability as JSON
      form.append("availability", JSON.stringify(formData.availability));

      // 5. Add files
      if (avatar) form.append("avatar", avatar);
      roleImages.forEach((img) => form.append("roleImages", img));

      const response = await fetch(getUpdateURL(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      toast.success("Profile updated successfully!");
      onUpdate(updatedUser);
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Render input field based on type
  const renderInput = (field) => {
    const { name, label, type, options } = field;
    const value = formData.roleData[name] || "";

    switch (type) {
      case "textarea":
        return (
          <div className={styles.fieldGroup} key={name}>
            <label className={styles.label}>{label}</label>
            <textarea
              className={styles.textarea}
              name={`roleData.${name}`}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${label.toLowerCase()}`}
              rows={3}
            />
          </div>
        );

      case "select":
        return (
          <div className={styles.fieldGroup} key={name}>
            <label className={styles.label}>{label}</label>
            <select
              className={styles.select}
              name={`roleData.${name}`}
              value={value}
              onChange={handleChange}
            >
              <option value="">Select {label}</option>
              {options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "checkbox":
        return (
          <div className={styles.fieldGroup} key={name}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name={`roleData.${name}`}
                checked={!!value}
                onChange={handleChange}
                className={styles.checkbox}
              />
              {label}
            </label>
          </div>
        );

      default:
        return (
          <div className={styles.fieldGroup} key={name}>
            <label className={styles.label}>{label}</label>
            <input
              className={styles.input}
              type={type}
              name={`roleData.${name}`}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </div>
        );
    }
  };

  const roleFields = getRoleFields(user.role);
  const isServiceProvider = !["user", "admin"].includes(user.role);

  return (
    <div className={styles.card}>
      <h3 className={styles.sectionTitle}>Edit Profile</h3>

      {/* Basic Information */}
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
              placeholder="Enter your full name"
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
              placeholder="Enter your email"
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
              placeholder="Enter your phone number"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
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
              placeholder="Enter street address"
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
              placeholder="Enter city"
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
              placeholder="Enter state"
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
              placeholder="Enter zip code"
            />
          </div>
        </div>
      </div>

      {/* Role Specific Information */}
      {roleFields.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.subsectionTitle}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Information
          </h4>
          <div className={styles.roleFields}>
            {roleFields.map((field) => renderInput(field))}
          </div>
        </div>
      )}

      {/* Availability for Service Providers */}
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
                  className={styles.checkbox}
                />
                Available for Services
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
              <small className={styles.helperText}>
                Hold Ctrl to select multiple days
              </small>
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
                placeholder="Service radius in km"
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
                placeholder="Any special notes"
              />
            </div>
          </div>
        </div>
      )}

      {/* File Uploads */}
      <div className={styles.section}>
        <h4 className={styles.subsectionTitle}>Images</h4>
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Profile Picture</label>
            <input
              type="file"
              onChange={(e) => setAvatar(e.target.files[0])}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Role Images</label>
            <input
              type="file"
              multiple
              onChange={(e) => setRoleImages([...e.target.files])}
              className={styles.fileInput}
            />
            <small className={styles.helperText}>
              Upload multiple images for your profile
            </small>
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
