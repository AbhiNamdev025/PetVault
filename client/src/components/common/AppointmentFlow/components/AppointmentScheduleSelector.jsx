import React, { useCallback, useEffect, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import styles from "../appointmentFlow.module.css";
import { toDisplayDate, toDisplayTime } from "../appointmentFlow.utils";
import { Button } from "../..";
import {
  buildAllowedWeekdaySet,
  getWeekdayTokenFromDate,
} from "../../../../utils/weekday";
const DEFAULT_TIME_GROUPS = [{
  label: "Morning",
  slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
}, {
  label: "Afternoon",
  slots: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"]
}, {
  label: "Evening",
  slots: ["15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"]
}];
const BOOKING_WINDOW_DAYS = 7;
const toDateInput = value => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};
const startOfDay = value => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};
const normalizeTimeTo24h = value => {
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

const AppointmentScheduleSelector = ({
  date,
  time,
  onDateChange,
  onDateDoubleClick,
  onTimeChange,
  minDate,
  selectedDates = [],
  timeGroups = DEFAULT_TIME_GROUPS,
  availableDays = [],
  disabledSlots = [],
  disabledSlotsByDate = {},
  blockedDates = [],
  showTimeSlots = true,
  isLoadingSlots = false,
  showRangeHighlight = false
}) => {
  const parsedMinDate = startOfDay(minDate || new Date());
  const minDateInput = toDateInput(parsedMinDate);
  const selectedDate = date ? startOfDay(date) : null;
  const allowedWeekdaySet = useMemo(
    () => buildAllowedWeekdaySet(availableDays),
    [availableDays],
  );
  const enforceAvailableDays = allowedWeekdaySet.size > 0;
  const isAllowedDay = useCallback((dayValue) => {
    if (!enforceAvailableDays) return true;
    const weekdayToken = getWeekdayTokenFromDate(dayValue);
    return weekdayToken ? allowedWeekdaySet.has(weekdayToken) : false;
  }, [allowedWeekdaySet, enforceAvailableDays]);
  const rangeStart = parsedMinDate;
  const todayInput = toDateInput(new Date());
  const currentTime24h = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;
  const dateRange = useMemo(() => {
    const days = [];
    let cursor = new Date(parsedMinDate);
    let guard = 0;
    const maxIterations = 120;
    while (days.length < BOOKING_WINDOW_DAYS && guard < maxIterations) {
      if (isAllowedDay(cursor)) {
        days.push(new Date(cursor));
      }
      cursor = addDays(cursor, 1);
      guard += 1;
    }
    return days;
  }, [isAllowedDay, parsedMinDate]);
  const allowedDateSet = useMemo(() => new Set(dateRange.map(day => toDateInput(day))), [dateRange]);
  const selectedDateInputs = useMemo(
    () =>
      Array.isArray(selectedDates)
        ? selectedDates.map((value) => toDateInput(value)).filter(Boolean).sort()
        : [],
    [selectedDates],
  );
  const selectedDateSet = useMemo(
    () => new Set(selectedDateInputs),
    [selectedDateInputs],
  );
  const rangeStartInput = selectedDateInputs[0] || "";
  const rangeEndInput = selectedDateInputs[selectedDateInputs.length - 1] || "";
  const hasSelectedRange = Boolean(
    showRangeHighlight &&
      selectedDateInputs.length > 1 &&
      rangeStartInput &&
      rangeEndInput,
  );
  const blockedDateSet = useMemo(
    () =>
      new Set(
        (blockedDates || []).map((value) => toDateInput(value)).filter(Boolean),
      ),
    [blockedDates],
  );
  const allSlots = useMemo(() => showTimeSlots && Array.isArray(timeGroups) ? timeGroups.flatMap(group => group?.slots || []).map(slot => normalizeTimeTo24h(slot)).filter(Boolean) : [], [showTimeSlots, timeGroups]);
  const normalizedSlotsByDate = useMemo(() => {
    const entries = Object.entries(disabledSlotsByDate || {});
    return entries.reduce((map, [dayInput, slots]) => {
      map[dayInput] = new Set((slots || []).map(slot => normalizeTimeTo24h(slot)).filter(Boolean));
      return map;
    }, {});
  }, [disabledSlotsByDate]);
  const selectedDisabledSlots = useMemo(() => {
    if (date && normalizedSlotsByDate?.[date]) {
      return [...normalizedSlotsByDate[date]];
    }
    return disabledSlots || [];
  }, [date, normalizedSlotsByDate, disabledSlots]);
  const disabledSlotSet = useMemo(() => new Set((selectedDisabledSlots || []).map(slot => normalizeTimeTo24h(slot)).filter(Boolean)), [selectedDisabledSlots]);
  const dayHasAvailableSlotMap = useMemo(() => dateRange.reduce((acc, day) => {
    const dayInput = toDateInput(day);
    if (!showTimeSlots) {
      acc[dayInput] = true;
      return acc;
    }
    const bookedSet = normalizedSlotsByDate?.[dayInput] || new Set();
    const isToday = dayInput === todayInput;
    const hasAvailableSlot = allSlots.some(slot => {
      if (bookedSet.has(slot)) return false;
      if (isToday && slot <= currentTime24h) return false;
      return true;
    });
    acc[dayInput] = hasAvailableSlot;
    return acc;
  }, {}), [dateRange, showTimeSlots, normalizedSlotsByDate, allSlots, todayInput, currentTime24h]);
  const isDateDisabled = useCallback((dayValue) => {
    const dayInput = typeof dayValue === "string" ? dayValue : toDateInput(dayValue);
    if (!dayInput || dayInput < minDateInput) return true;
    if (!allowedDateSet.has(dayInput)) return true;
    if (blockedDateSet.has(dayInput)) return true;
    if (!showTimeSlots) return false;
    return !dayHasAvailableSlotMap?.[dayInput];
  }, [allowedDateSet, blockedDateSet, dayHasAvailableSlotMap, minDateInput, showTimeSlots]);
  useEffect(() => {
    if (!selectedDate) return;
    const selectedDateInput = toDateInput(selectedDate);
    if (!selectedDateInput || isDateDisabled(selectedDateInput)) {
      onDateChange("");
      onTimeChange("");
      return;
    }
    if (!showTimeSlots) {
      if (time) onTimeChange("");
      return;
    }
    if (!time) return;
    const normalizedSelectedTime = normalizeTimeTo24h(time);
    const selectedBookedSlots = normalizedSlotsByDate?.[selectedDateInput] || new Set();
    const selectedIsToday = selectedDateInput === todayInput;
    if (!normalizedSelectedTime || selectedBookedSlots.has(normalizedSelectedTime) || selectedIsToday && normalizedSelectedTime <= currentTime24h) {
      onTimeChange("");
    }
  }, [selectedDate, time, minDateInput, allowedDateSet, blockedDateSet, showTimeSlots, dayHasAvailableSlotMap, normalizedSlotsByDate, todayInput, currentTime24h, isDateDisabled, onDateChange, onTimeChange]);
  const canGoPreviousWeek = false;
  const canGoNextWeek = false;
  const selectedDateLabel = useMemo(() => {
    if (selectedDateInputs.length > 1) {
      if (showRangeHighlight) {
        const rangeStartDate = selectedDateInputs[0];
        const rangeEndDate =
          selectedDateInputs[selectedDateInputs.length - 1];
        return `${toDisplayDate(rangeStartDate)} to ${toDisplayDate(rangeEndDate)}`;
      }
      return selectedDateInputs
        .map((dateValue) => toDisplayDate(dateValue))
        .join(", ");
    }
    return toDisplayDate(date || selectedDateInputs[0] || "");
  }, [date, selectedDateInputs, showRangeHighlight]);
  const selectedTimeLabel = showTimeSlots ? toDisplayTime(time) : "Full Day";
  const currentTime = showTimeSlots && todayInput === date ? currentTime24h : null;
  return <section className={styles.scheduleCard}>
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleHeading}>
          <h3 className={styles.scheduleTitle}>Select Availability</h3>
          <p className={styles.scheduleSubTitle}>Choose date and time slot</p>
        </div>
        <div className={styles.monthNav}>
          <Button type="button" className={styles.monthBtn} variant="ghost" size="sm" disabled={!canGoPreviousWeek} aria-label="Previous week">
            <ChevronLeft size={16} />
          </Button>
          <span className={styles.monthLabel}>
            {rangeStart.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
          })}
          </span>
          <Button type="button" className={styles.monthBtn} variant="ghost" size="sm" disabled={!canGoNextWeek} aria-label="Next week">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className={styles.dayRow}>
        {dateRange.map(day => {
        const dayInput = toDateInput(day);
        const disabled = isDateDisabled(day);
        const isSelected = dayInput === date || selectedDateSet.has(dayInput);
        const isRangeStart = hasSelectedRange && dayInput === rangeStartInput;
        const isRangeEnd = hasSelectedRange && dayInput === rangeEndInput;
        const isRangeMiddle = hasSelectedRange && dayInput > rangeStartInput && dayInput < rangeEndInput;
        const isEndpointActive = isSelected && (!hasSelectedRange || isRangeStart || isRangeEnd);
        const className = [
          styles.dayButton,
          isEndpointActive ? styles.dayButtonActive : "",
          isRangeMiddle ? styles.dayButtonRangeMiddle : "",
          isRangeStart ? styles.dayButtonRangeStart : "",
          isRangeEnd ? styles.dayButtonRangeEnd : "",
        ]
          .filter(Boolean)
          .join(" ");
        return <Button key={dayInput} type="button" className={className} onClick={() => {
          if (disabled) return;
          onDateChange(dayInput);
        }} onDoubleClick={() => {
          if (disabled) return;
          onDateDoubleClick?.(dayInput);
        }} disabled={disabled} variant={isEndpointActive ? "primary" : "ghost"} size="sm">
              <span className={styles.dayName}>
                {day.toLocaleDateString("en-US", {
              weekday: "short"
            })}
              </span>
              <span className={styles.dayDate}>{day.getDate()}</span>
            </Button>;
      })}
      </div>

      {showTimeSlots && (timeGroups.length === 0 ? <p className={styles.noSlotsText}>
          No available time slots for this provider.
        </p> : timeGroups.map(group => <div key={group.label} className={styles.slotGroup}>
            <div className={styles.slotGroupHeader}>
              <Clock3 size={14} />
              <span>{group.label}</span>
            </div>
            <div className={styles.slotGrid}>
              {group.slots.map(slot => {
          const normalizedSlot = normalizeTimeTo24h(slot);
          const active = normalizedSlot === normalizeTimeTo24h(time);
          const slotAlreadyBooked = disabledSlotSet.has(normalizedSlot);
          const isPastSlot = Boolean(currentTime && normalizedSlot && normalizedSlot <= currentTime);
          const disabled = !date || slotAlreadyBooked || isPastSlot;
          return <Button key={`${group.label}-${slot}`} type="button" className={`${styles.slotButton} ${active ? styles.slotButtonActive : ""}`} onClick={() => {
            if (disabled) return;
            onTimeChange(slot);
          }} disabled={Boolean(disabled)} variant={active ? "primary" : "outline"} size="sm">
                    {toDisplayTime(slot)}
                  </Button>;
        })}
            </div>
          </div>))}

      {!showTimeSlots && (
        <p className={styles.noSlotsText}>Caretaker booking is full day. No time selection required.</p>
      )}

      {showTimeSlots && date && (isLoadingSlots || disabledSlotSet.size > 0) && <p className={styles.noSlotsText}>
          {isLoadingSlots ? "Checking latest availability..." : "Booked slots are disabled automatically."}
        </p>}
      {blockedDateSet.size > 0 && (
        <p className={styles.noSlotsText}>
          Dates with confirmed bookings are disabled automatically.
        </p>
      )}
      <p className={styles.bookingWindowNote}>
        Booking is available only for the next {BOOKING_WINDOW_DAYS} working days.
      </p>

      <div className={styles.selectedMeta}>
        <CalendarDays size={16} />
        <span>{selectedDateLabel}</span>
        <span className={styles.metaDot}>•</span>
        {showTimeSlots && <Clock3 size={16} />}
        <span>{selectedTimeLabel}</span>
      </div>
    </section>;
};
export default AppointmentScheduleSelector;
