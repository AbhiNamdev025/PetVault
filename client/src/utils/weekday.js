const WEEKDAY_TOKENS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONDAY_FIRST_TOKENS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const WEEKDAY_ALIASES = {
  sun: "sun",
  sunday: "sun",
  mon: "mon",
  monday: "mon",
  tue: "tue",
  tues: "tue",
  tuesday: "tue",
  wed: "wed",
  wednesday: "wed",
  thu: "thu",
  thur: "thu",
  thurs: "thu",
  thursday: "thu",
  fri: "fri",
  friday: "fri",
  sat: "sat",
  saturday: "sat",
};

const WEEKDAY_LABELS = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

const isInteger = (value) => Number.isInteger(value);

const normalizeNumericWeekday = (value) => {
  if (!isInteger(value)) return "";

  // Legacy providers often store 0-6 with Monday as 0.
  if (value >= 0 && value <= 6) {
    return MONDAY_FIRST_TOKENS[value] || "";
  }

  // Also support 1-7 (Mon=1 ... Sun=7).
  if (value >= 1 && value <= 7) {
    return MONDAY_FIRST_TOKENS[value - 1] || "";
  }

  return "";
};

export const normalizeWeekdayToken = (value) => {
  if (typeof value === "number") {
    return normalizeNumericWeekday(value);
  }

  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";

  if (/^\d+$/.test(raw)) {
    return normalizeNumericWeekday(Number(raw));
  }

  return WEEKDAY_ALIASES[raw] || "";
};

export const getWeekdayTokenFromDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAY_TOKENS[date.getDay()] || "";
};

export const buildAllowedWeekdaySet = (availableDays = []) =>
  new Set(
    (Array.isArray(availableDays) ? availableDays : [])
      .map((day) => normalizeWeekdayToken(day))
      .filter(Boolean),
  );

export const formatAvailabilityDays = (availableDays = []) => {
  const dayList = Array.isArray(availableDays) ? availableDays : [];
  const labels = [];
  const seenToken = new Set();
  const seenRaw = new Set();

  dayList.forEach((day) => {
    const token = normalizeWeekdayToken(day);

    if (token) {
      if (seenToken.has(token)) return;
      seenToken.add(token);
      labels.push(WEEKDAY_LABELS[token] || token);
      return;
    }

    const raw = String(day || "").trim();
    if (!raw) return;

    const normalizedRaw = raw.toLowerCase();
    if (seenRaw.has(normalizedRaw)) return;

    seenRaw.add(normalizedRaw);
    labels.push(raw);
  });

  return labels;
};

