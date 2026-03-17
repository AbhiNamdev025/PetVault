import { API_BASE_URL } from "../../../../utils/constants";

export const submitAppointmentRequest = async ({
  token,
  formData,
  resolvedPetName,
  resolvedPetType,
  selectedPetId,
  enquiryPetId,
  petImageFiles,
  coinsToUse,
  paymentMethod,
  addToMyPets = false,
}) => {
  const payload = new FormData();
  const noteText = String(formData?.reason || "").trim();
  const otherPetType = String(formData?.otherPetType || "").trim();
  const isOtherPetType =
    String(resolvedPetType || "")
      .trim()
      .toLowerCase() === "other";
  const reasonWithPetType =
    isOtherPetType && otherPetType
      ? `${noteText || "No additional notes provided."}\nPet type detail: ${otherPetType}`
      : noteText || "No additional notes provided.";
  const payloadSource = {
    ...formData,
    petName: resolvedPetName,
    petType: resolvedPetType,
    reason: reasonWithPetType,
    addToMyPets: addToMyPets ? "true" : "false",
  };

  Object.entries(payloadSource).forEach(([key, value]) =>
    payload.append(key, value),
  );

  (petImageFiles || []).forEach((file) => payload.append("petImages", file));

  if (selectedPetId) {
    payload.append("petId", selectedPetId);
  }

  if (enquiryPetId) {
    payload.append("enquiryPetId", enquiryPetId);
  }

  if (Number(coinsToUse) > 0) {
    payload.append("coinsToUse", String(coinsToUse));
  }

  if (paymentMethod) {
    payload.append("paymentMethod", String(paymentMethod));
  }

  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
};

export const submitAppointmentEnquiry = async ({
  name,
  email,
  phone,
  message,
  petId,
  petName,
  providerId,
  providerType,
  providerName,
  providerEmail,
  appointmentId,
}) =>
  fetch(`${API_BASE_URL}/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      phone,
      message,
      petId,
      petName,
      providerId,
      providerType,
      providerName,
      providerEmail,
      appointmentId,
    }),
  });
