export const toDisplayDate = (value) => {
  if (!value) return "Not selected";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const toDisplayTime = (value) => {
  if (!value) return "Not selected";
  const [rawHour, rawMinute] = value.split(":");
  const hourNum = Number(rawHour);
  const minuteNum = Number(rawMinute || 0);
  if (Number.isNaN(hourNum)) return value;
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const twelveHour = hourNum % 12 || 12;
  return `${String(twelveHour).padStart(2, "0")}:${String(minuteNum).padStart(2, "0")} ${ampm}`;
};
