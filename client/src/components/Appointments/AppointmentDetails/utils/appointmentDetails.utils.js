export const getProviderName = (appointment) => {
  const provider = appointment?.providerId;
  if (appointment?.providerType === "doctor") {
    return (
      provider?.roleData?.doctorName ||
      provider?.name ||
      appointment?.providerName ||
      "Not available"
    );
  }
  return provider?.name || appointment?.providerName || "Not available";
};

export const getAppointmentContext = (appointment) => {
  const service = String(appointment?.service || "")
    .trim()
    .toLowerCase();
  const providerType = String(appointment?.providerType || "")
    .trim()
    .toLowerCase();

  const isMedical = service === "vet" || providerType === "doctor";
  const isAdoption =
    service === "pet_adoption" ||
    service === "adoption" ||
    providerType === "ngo";
  const isShop = service === "shop" || providerType === "shop";
  const hasPrescriptionData = Boolean(
    appointment?.prescription || appointment?.diagnosis || appointment?.doctorNotes,
  );

  return {
    service,
    providerType,
    isMedical,
    isAdoption,
    isShop,
    hasPrescriptionData,
    showPrescriptionTab: isMedical || hasPrescriptionData,
    reasonLabel: isMedical ? "Reason for Visit" : "Service Request",
    providerLabel: isMedical ? "Doctor" : "Provider",
    petProfileTitle: isMedical ? "Patient Medical File" : "Pet Profile Details",
  };
};

export const getPetIdValue = (appointment) => {
  const petRef =
    appointment?.enquiryPetId ||
    appointment?.resolvedPetId ||
    appointment?.petId?._id ||
    appointment?.petId;
  if (typeof petRef === "object" && petRef !== null) {
    return petRef?._id?.toString?.() || "";
  }
  return petRef?.toString?.() || "";
};

export const getPaymentSummary = (appointment) => {
  const originalAmount = appointment?.originalAmount || appointment?.totalAmount || 0;
  const platformFee = appointment?.platformFee || 0;
  const coinsValue = appointment?.coinsValue || 0;
  const coinsRefundedValue =
    appointment?.coinsRefundedValue || appointment?.coinsRefunded || 0;
  const onlineRefundedToWallet =
    appointment?.onlineRefundedToWalletAmount || 0;
  const paymentMethod =
    appointment?.paymentMethod === "Online" ? "Online" : "Cash";
  const paymentStatus = String(appointment?.paymentStatus || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const baseFee = Math.max(0, originalAmount - platformFee);
  const totalPayable =
    appointment?.totalAmount || Math.max(0, originalAmount - coinsValue);
  const hasPayment = originalAmount > 0 || totalPayable > 0;

  return {
    hasPayment,
    baseFee,
    platformFee,
    coinsValue,
    coinsRefunded: coinsRefundedValue,
    onlineRefundedToWallet,
    paymentMethod,
    paymentStatus,
    totalPayable,
  };
};

export const parsePrescription = (prescriptionValue) => {
  if (!prescriptionValue) {
    return { type: "none", data: null };
  }

  try {
    const parsed = JSON.parse(prescriptionValue);
    if (Array.isArray(parsed)) {
      return { type: "list", data: parsed };
    }
  } catch {
    // Fall through to return raw text.
  }

  return { type: "text", data: prescriptionValue };
};
