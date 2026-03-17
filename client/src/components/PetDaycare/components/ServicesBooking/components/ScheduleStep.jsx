import React from "react";
import { AppointmentScheduleSelector, Button } from "../../../../common";
import styles from "../serviceBookingForm.module.css";
import { MAX_DAYCARE_SELECTED_DAYS } from "../serviceBooking.constants";

const ScheduleStep = ({
  enableMultipleDates,
  dateMode,
  onDateModeChange,
  isFullDayCaretakerBooking,
  activeDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  sortedSelectedDates,
  providerTimeGroups,
  providerDays,
  bookedSlotsByDate,
  blockedDates,
  isLoadingSlots,
  showRangeHighlight,
}) => {
  const modeHint = isFullDayCaretakerBooking
    ? enableMultipleDates && dateMode === "multiple"
      ? `Select start and end day. Days between are auto-selected with full-day charges (max ${MAX_DAYCARE_SELECTED_DAYS} days).`
      : "Choose day(s). Charges are per full day."
    : enableMultipleDates && dateMode === "multiple"
      ? "Select start and end day. Days between are auto-selected and one time applies to all."
      : "Choose one date and one time slot.";

  return (
    <>
      {enableMultipleDates && (
        <div className={styles.modeToggle}>
          <Button
            type="button"
            className={`${styles.modeButton} ${dateMode === "single" ? styles.modeButtonActive : ""}`}
            variant={dateMode === "single" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onDateModeChange("single")}
          >
            Single Day
          </Button>
          <Button
            type="button"
            className={`${styles.modeButton} ${dateMode === "multiple" ? styles.modeButtonActive : ""}`}
            variant={dateMode === "multiple" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onDateModeChange("multiple")}
          >
            Date Range
          </Button>
        </div>
      )}

      <p className={styles.modeHint}>{modeHint}</p>

      <AppointmentScheduleSelector
        date={activeDate}
        time={selectedTime}
        onDateChange={onDateChange}
        onTimeChange={onTimeChange}
        minDate={new Date()}
        selectedDates={sortedSelectedDates}
        timeGroups={providerTimeGroups}
        availableDays={providerDays}
        disabledSlots={bookedSlotsByDate?.[activeDate] || []}
        disabledSlotsByDate={bookedSlotsByDate}
        blockedDates={blockedDates}
        showTimeSlots={!isFullDayCaretakerBooking}
        isLoadingSlots={isLoadingSlots}
        showRangeHighlight={Boolean(showRangeHighlight)}
      />
    </>
  );
};

export default ScheduleStep;
