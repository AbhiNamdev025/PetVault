import React, { useState } from "react";
import styles from "./editProfileForm.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Briefcase,
  Clock,
  Image as ImageIcon,
  Shield,
  Plus,
  X,
} from "lucide-react";
import Button from "../../../common/Button/Button";
import Input from "../../../common/Input/Input";
import Select from "../../../common/Select/Select";
import Textarea from "../../../common/Textarea/Textarea";

const getRoleFields = (role) => {
  const fields = {
    doctor: [
      {
        name: "doctorSpecialization",
        label: "Specialization",
        type: "textarea",
      },
      { name: "doctorExperience", label: "Experience (years)", type: "number" },
      {
        name: "consultationFee",
        label: "Consultation Fee (\u20B9)",
        type: "number",
      },
    ],
    hospital: [
      { name: "hospitalDescription", label: "Description", type: "textarea" },
      {
        name: "hospitalServices",
        label: "Services",
        type: "textarea",
      },
    ],
    caretaker: [
      { name: "staffSpecialization", label: "Specialization", type: "text" },
      { name: "staffExperience", label: "Experience (years)", type: "number" },
      {
        name: "serviceDescription",
        label: "Service Description",
        type: "textarea",
      },
      {
        name: "servicesOffered",
        label: "Skills & Services",
        type: "textarea",
      },
      { name: "hourlyRate", label: "Daily Rate (\u20B9)", type: "number" },
      { name: "serviceType", label: "Service Type", type: "text" },
    ],
    daycare: [
      { name: "ownerName", label: "Owner Name", type: "text" },
      { name: "maxPetsAllowed", label: "Max Pets Allowed", type: "number" },
      { name: "daycareDescription", label: "Description", type: "textarea" },
    ],
    shop: [
      { name: "ownerName", label: "Owner Name", type: "text" },
      {
        name: "shopType",
        label: "Shop Type",
        type: "select",
        options: ["petStore", "groomingCenter", "medicalStore", "mixed"],
      },
      {
        name: "servicesOffered",
        label: "Services Offered",
        type: "textarea",
      },
      { name: "shopDescription", label: "Shop Description", type: "textarea" },
      {
        name: "deliveryAvailable",
        label: "Delivery Available",
        type: "checkbox",
      },
      {
        name: "groomingAvailable",
        label: "Grooming Available",
        type: "checkbox",
      },
      { name: "deliveryRadius", label: "Delivery Radius (km)", type: "number" },
      {
        name: "groomingServices",
        label: "Grooming Services",
        type: "text",
      },
      { name: "openTime", label: "Open Time", type: "time" },
      { name: "closeTime", label: "Close Time", type: "time" },
    ],
    ngo: [
      { name: "ownerName", label: "Owner Name", type: "text" },
      { name: "servicesOffered", label: "Services Offered", type: "textarea" },
    ],
  };
  return fields[role] || [];
};

const getQualificationFields = () => [
  { name: "degree", label: "Degree", type: "text" },
  { name: "institution", label: "Institution", type: "text" },
  { name: "yearOfCompletion", label: "Year of Completion", type: "number" },
  { name: "licenseNumber", label: "License Number", type: "text" },
  {
    name: "certifications",
    label: "Certifications",
    type: "textarea",
  },
  { name: "skills", label: "Skills", type: "textarea" },
  { name: "languages", label: "Languages", type: "textarea" },
];

const normalize = (val) =>
  Array.isArray(val)
    ? val
    : typeof val === "string"
      ? val.split(",").map((v) => v.trim())
      : [];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      groomingServices: normalize(user.roleData?.groomingServices), // Added
      daysOpen: normalize(user.roleData?.daysOpen),
      doctorQualifications: {
        ...user.roleData?.doctorQualifications,
        certifications: normalize(
          user.roleData?.doctorQualifications?.certifications,
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
  const [arrayInputs, setArrayInputs] = useState({});

  // Helper to build URL (kept from original)
  const getUpdateURL = () => {
    // Assuming backend routes follow this pattern
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
        roleData: {
          ...p.roleData,
          [field]: type === "checkbox" ? checked : value,
        },
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

  const getArrayFieldValue = (fullName) => {
    if (fullName.startsWith("roleData.doctorQualifications.")) {
      const field = fullName.split(".")[2];
      return normalize(formData.roleData?.doctorQualifications?.[field]);
    }

    if (fullName.startsWith("roleData.")) {
      const field = fullName.split(".")[1];
      return normalize(formData.roleData?.[field]);
    }

    return [];
  };

  const updateArrayFieldValue = (fullName, updater) => {
    if (fullName.startsWith("roleData.doctorQualifications.")) {
      const field = fullName.split(".")[2];
      setFormData((prev) => {
        const current = normalize(prev.roleData?.doctorQualifications?.[field]);
        const updated = updater(current);
        return {
          ...prev,
          roleData: {
            ...prev.roleData,
            doctorQualifications: {
              ...prev.roleData?.doctorQualifications,
              [field]: updated,
            },
          },
        };
      });
      return;
    }

    if (fullName.startsWith("roleData.")) {
      const field = fullName.split(".")[1];
      setFormData((prev) => {
        const current = normalize(prev.roleData?.[field]);
        const updated = updater(current);
        return {
          ...prev,
          roleData: {
            ...prev.roleData,
            [field]: updated,
          },
        };
      });
    }
  };

  const handleArrayInputChange = (fullName, value) => {
    setArrayInputs((prev) => ({ ...prev, [fullName]: value }));
  };

  const handleAddArrayItem = (fullName) => {
    const rawValue = arrayInputs[fullName] || "";
    const cleanedValue = rawValue.trim();
    if (!cleanedValue) return;

    updateArrayFieldValue(fullName, (current) => {
      const exists = current.some(
        (item) => item.toLowerCase() === cleanedValue.toLowerCase(),
      );
      if (exists) return current;
      return [...current, cleanedValue];
    });

    setArrayInputs((prev) => ({ ...prev, [fullName]: "" }));
  };

  const handleRemoveArrayItem = (fullName, indexToRemove) => {
    updateArrayFieldValue(fullName, (current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleArrayInputKeyDown = (event, fullName) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleAddArrayItem(fullName);
  };

  const handleDayCheckboxChange = (day, type = "availability") => {
    setFormData((p) => {
      if (type === "shop") {
        const currentDays = p.roleData.daysOpen || [];
        const isSelected = currentDays.some(
          (d) =>
            d.toLowerCase().startsWith(day.toLowerCase()) ||
            day.toLowerCase().startsWith(d.toLowerCase()),
        );

        const newDays = isSelected
          ? currentDays.filter(
              (d) =>
                !(
                  d.toLowerCase().startsWith(day.toLowerCase()) ||
                  day.toLowerCase().startsWith(d.toLowerCase())
                ),
            )
          : [...currentDays, day];
        return { ...p, roleData: { ...p.roleData, daysOpen: newDays } };
      } else {
        const currentDays = p.availability.days || [];
        const isSelected = currentDays.some(
          (d) =>
            d.toLowerCase().startsWith(day.toLowerCase()) ||
            day.toLowerCase().startsWith(d.toLowerCase()),
        );

        const newDays = isSelected
          ? currentDays.filter(
              (d) =>
                !(
                  d.toLowerCase().startsWith(day.toLowerCase()) ||
                  day.toLowerCase().startsWith(d.toLowerCase())
                ),
            )
          : [...currentDays, day];
        return { ...p, availability: { ...p.availability, days: newDays } };
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in. Please log in again.");
        setLoading(false);
        return;
      }

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

      if (res.status === 401) {
        const data = await res.json().catch(() => ({}));
        toast.error(
          data.message?.toLowerCase().includes("token")
            ? "Session expired \u2014 please log in again."
            : "Not authorized. Please log in again.",
        );
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to update profile.");
        return;
      }

      const updatedUser = await res.json();
      toast.success("Profile updated successfully!");
      if (onUpdate) onUpdate(updatedUser);
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Something went wrong. Please try again.");
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

    const isArrayField = [
      "certifications",
      "skills",
      "languages",
      "hospitalServices",
      "servicesOffered",
      "groomingServices",
    ].includes(name);

    const isServicesOrDescription = [
      "doctorSpecialization",
      "hospitalDescription",
      "hospitalServices",
      "serviceDescription",
      "servicesOffered",
      "daycareDescription",
      "shopDescription",
      "groomingServices",
      "skills",
      "certifications",
      "languages",
    ].includes(name);

    let inputElement;

    if (isArrayField) {
      const values = getArrayFieldValue(fullName);
      const inputValue = arrayInputs[fullName] || "";

      inputElement = (
        <div key={fullName} className={styles.fieldGroup}>
          <label className={styles.label}>{label}</label>
          <div className={styles.tagInput}>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => handleArrayInputChange(fullName, e.target.value)}
              onKeyDown={(e) => handleArrayInputKeyDown(e, fullName)}
              placeholder={`Type ${label.toLowerCase()} and press Enter`}
              fullWidth
              maxLength={50}
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              className={styles.addTagButton}
              onClick={() => handleAddArrayItem(fullName)}
              aria-label={`Add ${label}`}
            >
              <Plus size={16} />
            </Button>
          </div>

          {values.length > 0 && (
            <div className={styles.tagList}>
              {values.map((item, index) => (
                <span key={`${item}-${index}`} className={styles.tagChip}>
                  {item}
                  <button
                    type="button"
                    className={styles.removeTagButton}
                    onClick={() => handleRemoveArrayItem(fullName, index)}
                    aria-label={`Remove ${item}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      );
    } else if (type === "textarea") {
      inputElement = (
        <Textarea
          key={fullName}
          label={label}
          name={fullName}
          value={value || ""}
          onChange={handleChange}
          rows={3}
          fullWidth
          maxLength={50}
        />
      );
    } else if (type === "select") {
      inputElement = (
        <Select
          key={fullName}
          label={label}
          name={fullName}
          value={value || ""}
          onChange={handleChange}
          options={options}
          placeholder={`Select ${label}`}
          fullWidth
        />
      );
    } else if (type === "checkbox") {
      inputElement = (
        <div
          className={`${styles.fieldGroup} ${styles.checkboxRow}`}
          key={fullName}
        >
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name={fullName}
              checked={!!value}
              onChange={handleChange}
            />
            <span>{label}</span>
          </label>
        </div>
      );
    } else {
      inputElement = (
        <Input
          key={fullName}
          label={label}
          type={type}
          name={fullName}
          value={value || ""}
          onChange={handleChange}
          fullWidth
          maxLength={type === "number" ? undefined : 50}
        />
      );
    }

    if (isServicesOrDescription) {
      return (
        <div key={`${fullName}-wrapper`} className={styles.fullWidthRow}>
          {inputElement}
        </div>
      );
    }

    return inputElement;
  };

  const roleFields = getRoleFields(user.role);
  const qualificationFields =
    user.role === "doctor" ? getQualificationFields() : [];
  const isServiceProvider = user.role !== "user" && user.role !== "admin";
  const isShop = user.role === "shop";
  const showAvailabilityScheduleFields = !isShop;
  const shopRoleTimeFields = isShop
    ? roleFields.filter(
        (field) => field.name === "openTime" || field.name === "closeTime",
      )
    : [];
  const roleFieldsWithoutShopTime = isShop
    ? roleFields.filter(
        (field) => field.name !== "openTime" && field.name !== "closeTime",
      )
    : roleFields;

  return (
    <div className={styles.card}>
      <div className={styles.formContent}>
        {/* Basic Info */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <User className={styles.sectionIcon} size={24} />
            <h4 className={styles.subsectionTitle}>Personal Information</h4>
          </div>
          <div className={styles.grid}>
            <div className={styles.fullWidthRow}>
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                maxLength={50}
              />
            </div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              fullWidth
              maxLength={50}
            />
            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              maxLength={15}
            />
          </div>
        </div>

        {/* Address */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <MapPin className={styles.sectionIcon} size={24} />
            <h4 className={styles.subsectionTitle}>Address Details</h4>
          </div>
          <div className={styles.grid}>
            <Input
              label="Street"
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              fullWidth
              maxLength={100}
            />
            <Input
              label="City"
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              fullWidth
              maxLength={50}
            />
            <Input
              label="State"
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              fullWidth
              maxLength={50}
            />
            <Input
              label="Pin Code"
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              fullWidth
              maxLength={10}
            />
          </div>
        </div>

        {/* Role Specifics */}
        {roleFields.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Briefcase className={styles.sectionIcon} size={24} />
              <h4 className={styles.subsectionTitle}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Details
              </h4>
            </div>
            <div className={styles.grid}>
              {user.role === "shop" ? (
                <>
                  {renderInput(
                    roleFieldsWithoutShopTime.find(
                      (f) => f.name === "ownerName",
                    ),
                  )}
                  {renderInput(
                    roleFieldsWithoutShopTime.find(
                      (f) => f.name === "shopType",
                    ),
                  )}
                  {renderInput(
                    roleFieldsWithoutShopTime.find(
                      (f) => f.name === "servicesOffered",
                    ),
                  )}
                  {renderInput(
                    roleFieldsWithoutShopTime.find(
                      (f) => f.name === "shopDescription",
                    ),
                  )}

                  <div className={styles.verticalGroup}>
                    {renderInput(
                      roleFieldsWithoutShopTime.find(
                        (f) => f.name === "deliveryAvailable",
                      ),
                    )}
                    {formData.roleData.deliveryAvailable &&
                      renderInput(
                        roleFieldsWithoutShopTime.find(
                          (f) => f.name === "deliveryRadius",
                        ),
                      )}
                  </div>

                  <div className={styles.verticalGroup}>
                    {renderInput(
                      roleFieldsWithoutShopTime.find(
                        (f) => f.name === "groomingAvailable",
                      ),
                    )}
                    {formData.roleData.groomingAvailable &&
                      renderInput(
                        roleFieldsWithoutShopTime.find(
                          (f) => f.name === "groomingServices",
                        ),
                      )}
                  </div>
                </>
              ) : (
                roleFieldsWithoutShopTime.map((f) => renderInput(f))
              )}
            </div>
          </div>
        )}

        {/* Doctor Qualifications */}
        {qualificationFields.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Shield className={styles.sectionIcon} size={24} />
              <h4 className={styles.subsectionTitle}>Qualifications</h4>
            </div>
            <div className={styles.grid}>
              {qualificationFields.map((f) =>
                renderInput(f, "roleData.doctorQualifications"),
              )}
            </div>
          </div>
        )}

        {isServiceProvider && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Clock className={styles.sectionIcon} size={24} />
              <h4 className={styles.subsectionTitle}>
                Availability & Schedule
              </h4>
            </div>

            <div className={styles.grid}>
              <div className={styles.fullWidthRow}>
                <div className={styles.verticalGroup}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="Availability">
                      Availability
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="availability.available"
                        checked={formData.availability.available}
                        onChange={handleChange}
                      />
                      <span>Currently Available</span>
                    </label>
                  </div>
                  {formData.availability.available &&
                    ![
                      "shop",
                      "doctor",
                      "caretaker",
                      "hospital",
                      "daycare",
                    ].includes(user.role) && (
                      <Input
                        label="Service Radius (km)"
                        type="number"
                        name="availability.serviceRadius"
                        value={formData.availability.serviceRadius}
                        onChange={handleChange}
                        fullWidth
                      />
                    )}
                </div>
              </div>
              <div className={styles.fullWidthRow}>
                <Textarea
                  label="Status Note"
                  name="availability.statusNote"
                  value={formData.availability.statusNote}
                  onChange={handleChange}
                  placeholder="e.g. On vacation... available for online consultation only."
                  fullWidth
                  rows={3}
                />
              </div>
            </div>

            {showAvailabilityScheduleFields && (
              <>
                <div className={styles.subsectionBlock}>
                  <label className={styles.subHeading}>Working Days</label>
                  <div className={styles.daysCheckboxGrid}>
                    {daysOfWeek.map((day) => (
                      <label
                        key={`avail-${day}`}
                        className={styles.dayCheckboxLabel}
                      >
                        <input
                          type="checkbox"
                          className={styles.dayCheckbox}
                          checked={
                            formData.availability.days?.some(
                              (d) =>
                                d.toLowerCase().startsWith(day.toLowerCase()) ||
                                day.toLowerCase().startsWith(d.toLowerCase()),
                            ) || false
                          }
                          onChange={() =>
                            handleDayCheckboxChange(day, "availability")
                          }
                        />
                        <span className={styles.dayText}>
                          {day.slice(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={`${styles.grid} ${styles.timeGrid}`}>
                  <div className={styles.fullWidthRow}>
                    <Input
                      label="Start Time"
                      type="time"
                      name="availability.startTime"
                      value={formData.availability.startTime}
                      onChange={handleChange}
                      fullWidth
                    />
                  </div>
                  <div className={styles.fullWidthRow}>
                    <Input
                      label="End Time"
                      type="time"
                      name="availability.endTime"
                      value={formData.availability.endTime}
                      onChange={handleChange}
                      fullWidth
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Images */}
        {isServiceProvider && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <ImageIcon className={styles.sectionIcon} size={24} />
              <h4 className={styles.subsectionTitle}>Images</h4>
            </div>
            <div className={`${styles.grid} ${styles.imageGrid}`}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Profile/Logo Image</label>
                <div
                  className={styles.imageUpload}
                  onClick={() => document.getElementById("avatarInput").click()}
                >
                  <input
                    id="avatarInput"
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files[0])}
                  />
                  <div className={styles.imageUploadContent}>
                    <UploadIcon />
                    <span>{avatar ? avatar.name : "Choose Image"}</span>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Service Images</label>
                <div
                  className={styles.imageUpload}
                  onClick={() =>
                    document.getElementById("roleImgsInput").click()
                  }
                >
                  <input
                    id="roleImgsInput"
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={(e) => setRoleImages([...e.target.files])}
                  />
                  <div className={styles.imageUploadContent}>
                    <UploadIcon />
                    <span>
                      {roleImages.length > 0
                        ? `${roleImages.length} images selected`
                        : "Choose  Images"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.formFooter}>
        <Button
          className={styles.saveButton}
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export default EditProfileForm;
