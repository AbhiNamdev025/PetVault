const Appointment = require("../../models/Appointment/appointment");
const { refundSpentCoins } = require("../../utils/coins");

const readPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const BOOKING_WINDOW_DAYS = readPositiveInt(process.env.BOOKING_WINDOW_DAYS, 7);
const AUTO_CANCEL_GRACE_MINUTES = readPositiveInt(
  process.env.AUTO_CANCEL_GRACE_MINUTES,
  1,
);
const AUTO_CANCEL_REASON =
  process.env.AUTO_CANCEL_REASON || "No response from provider";

const normalizeTimeTo24h = (value) => {
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

const startOfLocalDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

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

const normalizeNumericWeekday = (value) => {
  if (!Number.isInteger(value)) return "";

  // Legacy providers may store 0-6 with Monday as 0.
  if (value >= 0 && value <= 6) {
    return MONDAY_FIRST_TOKENS[value] || "";
  }

  // Also support 1-7 (Mon=1 ... Sun=7).
  if (value >= 1 && value <= 7) {
    return MONDAY_FIRST_TOKENS[value - 1] || "";
  }

  return "";
};

const normalizeWeekdayToken = (value) => {
  if (typeof value === "number") {
    return normalizeNumericWeekday(value);
  }

  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) return "";

  if (/^\d+$/.test(raw)) {
    return normalizeNumericWeekday(Number(raw));
  }

  return WEEKDAY_ALIASES[raw] || "";
};

const getWeekdayTokenFromDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAY_TOKENS[date.getDay()] || "";
};

const buildAllowedDaySet = (availableDays = []) =>
  new Set(
    (Array.isArray(availableDays) ? availableDays : [])
      .map((day) => normalizeWeekdayToken(day))
      .filter(Boolean),
  );

const isAllowedProviderDay = (dateValue, allowedDaySet) => {
  if (!allowedDaySet || allowedDaySet.size === 0) return true;
  const weekdayToken = getWeekdayTokenFromDate(dateValue);
  if (!weekdayToken) return false;
  return allowedDaySet.has(weekdayToken);
};

const getBookingWindowDates = (
  referenceDate = new Date(),
  availableDays = [],
  windowCount = BOOKING_WINDOW_DAYS,
) => {
  const allowedDaySet = buildAllowedDaySet(availableDays);
  const dates = [];
  let cursor = startOfLocalDay(referenceDate);
  let guard = 0;
  const maxIterations = 120;

  while (dates.length < windowCount && guard < maxIterations) {
    if (isAllowedProviderDay(cursor, allowedDaySet)) {
      dates.push(new Date(cursor));
    }
    cursor = addDays(cursor, 1);
    guard += 1;
  }

  return dates;
};

const isWithinBookingWindow = (
  appointmentDate,
  availableDays = [],
  referenceDate = new Date(),
) => {
  const selectedDate = startOfLocalDay(appointmentDate);
  if (!selectedDate) return false;
  const allowedDates = getBookingWindowDates(referenceDate, availableDays);
  const selectedDateInput = selectedDate.toDateString();
  return allowedDates.some((date) => date.toDateString() === selectedDateInput);
};

const getAppointmentDateTime = (appointment) => {
  if (!appointment?.date) return null;

  const normalizedTime = normalizeTimeTo24h(appointment.time);
  if (!normalizedTime) return null;

  const [hours, minutes] = normalizedTime.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const scheduledAt = new Date(appointment.date);
  if (Number.isNaN(scheduledAt.getTime())) return null;

  scheduledAt.setHours(hours, minutes, 0, 0);
  return scheduledAt;
};

const autoCancelUnansweredAppointments = async () => {
  const now = new Date();
  const cutoffTime = new Date(
    now.getTime() - AUTO_CANCEL_GRACE_MINUTES * 60 * 1000,
  );

  const pendingAppointments = await Appointment.find({
    status: "pending",
    date: { $lte: now },
    service: { $ne: "others" }, // Do not auto-cancel rescue reports
  }).select("_id date time user coinsUsed coinsRefunded");

  const idsToCancel = pendingAppointments
    .filter((appointment) => {
      const scheduledAt = getAppointmentDateTime(appointment);
      return Boolean(scheduledAt) && scheduledAt <= cutoffTime;
    })
    .map((appointment) => appointment._id);

  if (idsToCancel.length === 0) return 0;

  const updateResult = await Appointment.updateMany(
    { _id: { $in: idsToCancel }, status: "pending" },
    {
      $set: {
        status: "cancelled",
        cancellationReason: AUTO_CANCEL_REASON,
        cancelledBy: "admin",
        cancelledAt: now,
      },
    },
  );

  const modifiedCount = updateResult.modifiedCount || 0;

  if (modifiedCount > 0) {
    const cancelledAppointments = await Appointment.find({
      _id: { $in: idsToCancel },
      status: "cancelled",
    }).select("_id user coinsUsed coinsRefunded coinsRefundedValue");

    await Promise.all(
      cancelledAppointments.map(async (appointment) => {
        const refundableCoins = Math.max(
          0,
          Number(appointment.coinsUsed || 0) -
            Number(appointment.coinsRefunded || 0),
        );

        if (!appointment.user || refundableCoins <= 0) return;

        const refundResult = await refundSpentCoins({
          userId: appointment.user,
          coins: refundableCoins,
          sourceType: "appointment_refund",
          sourceId: appointment._id,
          spendSourceType: "appointment",
          note: `Refund for auto-cancelled appointment ${appointment._id}`,
        });

        if (refundResult.coinsRefunded > 0) {
          appointment.coinsRefunded =
            Number(appointment.coinsRefunded || 0) + refundResult.coinsRefunded;
          appointment.coinsRefundedValue =
            Number(appointment.coinsRefundedValue || 0) +
            Number(refundResult.coinsValue || 0);
          appointment.coinsRefundedAt = new Date();
          await appointment.save();
        }
      }),
    );
  }

  return modifiedCount;
};

module.exports = {
  BOOKING_WINDOW_DAYS,
  AUTO_CANCEL_GRACE_MINUTES,
  normalizeTimeTo24h,
  getBookingWindowDates,
  isWithinBookingWindow,
  autoCancelUnansweredAppointments,
};
