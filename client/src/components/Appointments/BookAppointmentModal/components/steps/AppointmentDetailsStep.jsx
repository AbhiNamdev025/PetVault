import React from "react";
import * as Icons from "lucide-react";
import { Camera, Mail, PawPrint as PawIcon, Phone, User } from "lucide-react";
import { Input, Select, Textarea, Button } from "../../../../common";
import styles from "../../bookAppointmentModal.module.css";
const petOptions = [
  {
    value: "Dog",
    label: "Dog",
    icon: "PawPrint",
  },
  {
    value: "Cat",
    label: "Cat",
    icon: "Cat",
  },
  {
    value: "Bird",
    label: "Bird",
    icon: "Feather",
  },
  {
    value: "Other",
    label: "Other",
    icon: "HelpCircle",
  },
];
const AppointmentDetailsStep = ({
  isContactFlow,
  providerType,
  formData,
  onChange,
  onSelectPetType,
  onToggleAddToMyPets,
  userPets,
  selectedPetId,
  onSelectUserPet,
  enquiryMode,
  isPetPrefilled,
  initialPetName,
  initialPetType,
  isParentPhoneLocked,
  onImageSelect,
  previewPetImages,
  onRemoveImage,
}) => {
  const IconFor = (name, props = {}) => {
    const Component = Icons[name];
    if (!Component) return <span {...props} />;
    return <Component {...props} />;
  };
  const normalizedPetType = String(formData.petType || "")
    .trim()
    .toLowerCase();
  const showOtherPetTypeInput =
    normalizedPetType === "other" || normalizedPetType === "others";
  const isPetLocked =
    Boolean(selectedPetId) ||
    (isPetPrefilled && Boolean(initialPetName || initialPetType));
  const showAddToMyPetsOption = !isPetLocked;
  if (isContactFlow) {
    return (
      <div className={styles.form}>
        <div className={styles.formRow}>
          <Input
            label="Your Name"
            name="contactName"
            value={formData.contactName}
            onChange={onChange}
            placeholder="Enter your full name"
            required
            icon={<User size={20} />}
            className={styles.formGroup}
            fullWidth
          />

          <Input
            label="Email Address"
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={onChange}
            placeholder="you@example.com"
            required
            icon={<Mail size={20} />}
            className={styles.formGroup}
            fullWidth
          />
        </div>

        <div className={styles.formRow}>
          <Input
            label="Contact Number"
            type="tel"
            name="parentPhone"
            value={formData.parentPhone}
            onChange={onChange}
            placeholder="10-digit mobile number"
            pattern="^[1-9][0-9]{9}$"
            required
            fullWidth
            icon={<Phone size={20} />}
          />

          <Textarea
            label={
              providerType === "ngo"
                ? "Why do you want to adopt?"
                : "Reason for Enquiry"
            }
            name="reason"
            rows={3}
            value={formData.reason}
            onChange={onChange}
            placeholder={
              providerType === "ngo"
                ? "Share your adoption intent and preferences"
                : "Tell us what you need from the shop"
            }
            required
            className={styles.formGroup}
            fullWidth
          />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.form}>
      {userPets.length > 0 && !enquiryMode && (
        <Select
          label="Auto-fill from My Pets"
          value={selectedPetId}
          onChange={onSelectUserPet}
          options={[
            {
              value: "",
              label: "Manual Entry",
            },
            ...userPets.map((pet) => ({
              value: pet._id,
              label: `${pet.name} (${pet.species})`,
            })),
          ]}
          placeholder="-- Manual Entry --"
          icon={<PawIcon size={20} />}
          className={styles.formGroup}
          fullWidth
        />
      )}

      <div className={styles.formRow}>
        <Input
          label="Pet Name"
          name="petName"
          value={formData.petName}
          onChange={onChange}
          placeholder="Enter pet name"
          required
          disabled={isPetLocked}
          icon={<User size={20} />}
          className={styles.formGroup}
          fullWidth
        />

        <Input
          label="Parent Mobile"
          type="tel"
          name="parentPhone"
          value={formData.parentPhone}
          onChange={onChange}
          placeholder="10-digit mobile number"
          pattern="^[1-9][0-9]{9}$"
          required
          disabled={isParentPhoneLocked}
          fullWidth
          icon={<Phone size={20} />}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Pet Type</label>
        <div
          className={styles.petOptionsRow}
          role="radiogroup"
          aria-label="Pet Type"
        >
          {petOptions.map((option) => {
            const selected = formData.petType === option.value;
            return (
              <Button
                type="button"
                key={option.value}
                className={`${styles.petOption} ${selected ? styles.petOptionActive : ""}`}
                onClick={() => {
                  if (isPetLocked) return;
                  onSelectPetType(option.value);
                }}
                aria-pressed={selected}
                disabled={isPetLocked}
                variant="primary"
                size="md"
              >
                <span className={styles.petIcon}>
                  {IconFor(option.icon, {
                    size: 17,
                  })}
                </span>
                <span className={styles.petLabel}>{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {showOtherPetTypeInput && (
        <Input
          label="Specify Pet Type"
          name="otherPetType"
          value={formData.otherPetType || ""}
          onChange={onChange}
          placeholder="Example: Hamster, Iguana, Rabbit"
          required
          disabled={isPetLocked}
          icon={<PawIcon size={20} />}
          className={styles.formGroup}
          fullWidth
        />
      )}

      {showAddToMyPetsOption && (
        <div className={styles.savePetToggle}>
          <label className={styles.savePetLabel}>
            <input
              type="checkbox"
              checked={Boolean(formData.addToMyPets)}
              onChange={onToggleAddToMyPets}
              className={styles.savePetCheckbox}
            />
            <span>Add this pet to My Pets after booking</span>
          </label>
        </div>
      )}

      <div className={styles.formRow}>
        <Textarea
          label="Health Issues"
          name="healthIssues"
          rows={3}
          value={formData.healthIssues}
          onChange={onChange}
          placeholder="Describe any allergies or ongoing issues"
          className={styles.formGroup}
          fullWidth
        />

        <Textarea
          label="Additional Notes (Optional)"
          name="reason"
          rows={3}
          value={formData.reason}
          onChange={onChange}
          placeholder="Any special care instructions or requests"
          className={styles.formGroup}
          fullWidth
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Add Pet Images</label>
        <label className={styles.fileUpload}>
          <div className={styles.fileUploadContent}>
            <Camera size={24} className={styles.uploadIcon} />
            <span className={styles.uploadText}>
              Click to upload pet images
            </span>
            <span className={styles.uploadSubtext}>(PNG, JPG, JPEG)</span>
          </div>
          <input
            type="file"
            multiple
            onChange={onImageSelect}
            className={styles.fileInput}
            accept="image/*"
          />
        </label>
        {previewPetImages.length > 0 && (
          <div className={styles.previewRow}>
            {previewPetImages.map((src, index) => (
              <div key={`${src}-${index}`} className={styles.previewImgWrapper}>
                <img
                  src={src}
                  className={styles.previewImg}
                  alt={`preview-${index}`}
                />
                {onRemoveImage && (
                  <button
                    type="button"
                    className={styles.removeImgBtn}
                    onClick={() => onRemoveImage(index)}
                  >
                    <Icons.X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AppointmentDetailsStep;
