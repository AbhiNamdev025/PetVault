import { useMemo } from "react";

const PHONE_REGEX = /^[1-9][0-9]{9}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const useBookingValidation = ({ formData, step, isContactFlow, isPetLocked = false }) => {
  const isValidPhone = useMemo(
    () => PHONE_REGEX.test(formData.parentPhone || ""),
    [formData.parentPhone],
  );

  const isValidEmail = useMemo(
    () => EMAIL_REGEX.test((formData.contactEmail || "").trim()),
    [formData.contactEmail],
  );

  const canProceed = useMemo(() => {
    if (step === 1) {
      return Boolean(formData.date && formData.time);
    }

    if (step === 2) {
      if (isContactFlow) {
        return Boolean(
          formData.contactName.trim() &&
            isValidEmail &&
            isValidPhone &&
            formData.reason.trim(),
        );
      }

      return Boolean(
        formData.petName.trim() &&
          formData.petType &&
          (!["other", "others"].includes(
            String(formData.petType).trim().toLowerCase(),
          ) ||
            isPetLocked ||
            formData.otherPetType.trim()) &&
          isValidPhone,
      );
    }

    return true;
  }, [
    formData.contactName,
    formData.date,
    formData.petName,
    formData.petType,
    formData.otherPetType,
    formData.reason,
    formData.time,
    isContactFlow,
    isPetLocked,
    isValidEmail,
    isValidPhone,
    step,
  ]);

  return {
    isValidPhone,
    isValidEmail,
    canProceed,
  };
};

export default useBookingValidation;
