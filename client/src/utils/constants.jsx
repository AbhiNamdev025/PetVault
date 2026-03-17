// export const API_BASE_URL = "https://petvault.devarshinnovations.com/api/api";
// export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;
// export const BASE_URL = "https://petvault.devarshinnovations.com/api";

export const API_BASE_URL = "http://localhost:5000/api";
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;
export const BASE_URL = "http://localhost:5000";

export const PET_TYPES = ["dog", "cat", "bird", "rabbit", "fish", "other"];
export const PET_GENDERS = ["male", "female"];
export const PET_CATEGORIES = ["shop", "adoption"];

export const PRODUCT_CATEGORIES = [
  "food",
  "toy",
  "accessory",
  "health",
  "grooming",
  "bedding",
];

export const SERVICE_TYPES = [
  "vet",
  "daycare",
  "grooming",
  "training",
  "boarding",
];

export const APPOINTMENT_STATUS = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export const ORDER_STATUS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export const ROLE_OPTIONS = [
  { id: "user", value: "user", label: "User" },
  { id: "doctor", value: "doctor", label: "Doctor" },
  { id: "hospital", value: "hospital", label: "Hospital" },
  { id: "shop", value: "shop", label: "Pet Shop" },
  { id: "daycare", value: "daycare", label: "Daycare" },
  { id: "ngo", value: "ngo", label: "NGOs" },
  { id: "caretaker", value: "caretaker", label: "Caretaker" },
];
