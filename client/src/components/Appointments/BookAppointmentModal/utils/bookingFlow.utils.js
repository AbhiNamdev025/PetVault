const SLOT_INTERVAL_MINUTES = 30;

export const getStoredUser = () => {
  try {
    if (typeof window === "undefined") return null;
    return (
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null")
    );
  } catch {
    return null;
  }
};

const toMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
};

const toTimeLabel = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const normalizeTimeTo24h = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const amPmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = Number(amPmMatch[2]);
    const meridiem = amPmMatch[3].toUpperCase();

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return "";

    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmmMatch) {
    const hours = Number(hhmmMatch[1]);
    const minutes = Number(hhmmMatch[2]);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return "";
};

export const buildProviderTimeGroups = (startTime, endTime) => {
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (
    !Number.isFinite(startMinutes) ||
    !Number.isFinite(endMinutes) ||
    endMinutes <= startMinutes
  ) {
    return null;
  }

  const buckets = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };

  for (
    let value = startMinutes;
    value <= endMinutes;
    value += SLOT_INTERVAL_MINUTES
  ) {
    const slot = toTimeLabel(value);
    const hour = Math.floor(value / 60);

    if (hour < 12) {
      buckets.Morning.push(slot);
    } else if (hour < 16) {
      buckets.Afternoon.push(slot);
    } else {
      buckets.Evening.push(slot);
    }
  }

  return Object.entries(buckets)
    .filter(([, slots]) => slots.length > 0)
    .map(([label, slots]) => ({ label, slots }));
};
