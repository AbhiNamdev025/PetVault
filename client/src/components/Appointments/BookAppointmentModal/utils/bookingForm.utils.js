export const createInitialBookingFormData = ({
  providerType,
  providerId,
  initialService,
  initialPetName,
  initialPetType,
  storedUser,
}) => ({
  providerType,
  providerId,
  service: initialService,
  petName: initialPetName,
  petType: initialPetType,
  otherPetType: "",
  contactName: storedUser?.name || "",
  contactEmail: storedUser?.email || "",
  parentPhone:
    storedUser?.phone ||
    storedUser?.mobile ||
    storedUser?.phoneNumber ||
    "",
  date: "",
  time: "",
  reason: "",
  healthIssues: "",
  addToMyPets: false,
});

export const buildPetFormSnapshot = (pet) => ({
  petName: pet?.name || "",
  petType: pet?.species || "",
  otherPetType: "",
  healthIssues: (pet?.medicalConditions || []).join(", "),
});

export const getFallbackPetName = (providerType) =>
  providerType === "ngo" ? "Adoption Enquiry" : "General Enquiry";
