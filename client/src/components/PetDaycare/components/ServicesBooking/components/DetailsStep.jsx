import React from "react";
import { List } from "lucide-react";
import { Select } from "../../../../common";
import bookingStyles from "../../../../Appointments/BookAppointmentModal/bookAppointmentModal.module.css";
import { AppointmentDetailsStep } from "../../../../Appointments/BookAppointmentModal/components";
import { serviceOptions } from "../serviceBooking.constants";

const DetailsStep = ({
  providerType,
  formData,
  userPets,
  selectedPetId,
  onChange,
  onSelectPetType,
  onToggleAddToMyPets,
  onUserPetSelect,
  isPetPrefilled,
  initialPetName,
  initialPetType,
  isParentPhoneLocked,
  onImageSelect,
  previewPetImages,
  onRemoveImage,
}) => (
  <div className={bookingStyles.form}>
    <Select
      label="Service Type"
      name="service"
      value={formData.service}
      onChange={onChange}
      options={serviceOptions}
      placeholder="Select service"
      icon={<List size={20} />}
      required
      className={bookingStyles.formGroup}
      fullWidth
    />
    <AppointmentDetailsStep
      isContactFlow={false}
      providerType={providerType}
      formData={formData}
      onChange={onChange}
      onSelectPetType={onSelectPetType}
      onToggleAddToMyPets={onToggleAddToMyPets}
      userPets={userPets}
      selectedPetId={selectedPetId}
      onSelectUserPet={onUserPetSelect}
      enquiryMode={false}
      isPetPrefilled={Boolean(isPetPrefilled)}
      initialPetName={initialPetName || ""}
      initialPetType={initialPetType || ""}
      isParentPhoneLocked={isParentPhoneLocked}
      onImageSelect={onImageSelect}
      previewPetImages={previewPetImages}
      onRemoveImage={onRemoveImage}
    />
  </div>
);

export default DetailsStep;
