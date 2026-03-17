import { API_BASE_URL } from "../../../../utils/constants";

export const sortDateAsc = (left, right) => left.localeCompare(right);

export const toDateInput = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const normalizePetType = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  if (normalized === "others") return "Other";
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
};

export const isOtherPetType = (value) =>
  String(value || "").trim().toLowerCase() === "other";

export const getStoredUserPhone = () => {
  if (typeof window === "undefined") return "";
  try {
    const localUser = JSON.parse(localStorage.getItem("user") || "null");
    const sessionUser = JSON.parse(sessionStorage.getItem("user") || "null");
    const user = localUser || sessionUser || {};
    return user.phone || user.mobile || user.phoneNumber || "";
  } catch {
    return "";
  }
};

export const resolveProviderEndpoint = (providerType, providerId) => {
  if (!providerId) return "";
  if (providerType === "caretaker") return `${API_BASE_URL}/caretaker/${providerId}`;
  if (providerType === "doctor") return `${API_BASE_URL}/doctor/${providerId}`;
  if (providerType === "shop") return `${API_BASE_URL}/shop/${providerId}`;
  if (providerType === "ngo") return `${API_BASE_URL}/user/${providerId}`;
  return "";
};

export const resolveProviderName = (provider, providerType) => {
  if (!provider) {
    return providerType === "caretaker" ? "Caretaker" : "Service Provider";
  }
  if (providerType === "caretaker") return provider.name || "Caretaker";
  if (providerType === "doctor") {
    return provider.roleData?.doctorName || provider.name || "Vet Doctor";
  }
  if (providerType === "shop") {
    return (
      provider.roleData?.shopName ||
      provider.businessName ||
      provider.name ||
      "Pet Shop"
    );
  }
  if (providerType === "ngo") {
    return provider.businessName || provider.name || "NGO";
  }
  return provider.name || "Service Provider";
};

export const resolveProviderMeta = (provider, providerType) => {
  if (!provider) return "";
  if (providerType === "caretaker") {
    return (
      provider.roleData?.staffSpecialization ||
      provider.roleData?.daycareName ||
      "Pet Care"
    );
  }
  if (providerType === "doctor") {
    return provider.roleData?.doctorSpecialization || "Veterinary Consultation";
  }
  if (providerType === "shop") {
    return provider.roleData?.shopType || "Pet Shop";
  }
  if (providerType === "ngo") {
    return "Adoption Services";
  }
  return "";
};

export const buildDateRangeInclusive = (fromDateInput, toDateInputValue) => {
  if (!fromDateInput || !toDateInputValue) return [];

  const [startInput, endInput] =
    fromDateInput <= toDateInputValue
      ? [fromDateInput, toDateInputValue]
      : [toDateInputValue, fromDateInput];

  const startDate = new Date(startInput);
  const endDate = new Date(endInput);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [];
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const nextDates = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    nextDates.push(toDateInput(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return nextDates;
};
