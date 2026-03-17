import React from "react";
import { Input, Textarea } from "../../../../../common";
import styles from "../../appointments.module.css";

const getTodayDate = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

const CA_Notes = ({
  doctorNotes,
  followUpDate,
  onNotesChange,
  onFileChange,
  disabled,
  errors = {},
}) => {
  return (
    <>
      <div className={styles.formGroup}>
        <Textarea
          label="Clinical Notes"
          name="doctorNotes"
          value={doctorNotes}
          onChange={onNotesChange}
          rows={4}
          placeholder="Clinical observations..."
          disabled={disabled}
          error={errors.doctorNotes}
          maxLength={200}
          fullWidth
        />
        <div className={styles.charCount}>{doctorNotes.length} / 200</div>
      </div>

      <div className={styles.formGroup}>
        <Input
          type="file"
          label="Upload Report" // Common component handles label rendering
          onChange={onFileChange}
          disabled={disabled}
          fullWidth
        />
      </div>

      <div className={styles.formGroup}>
        <Input
          label="Follow-up Date"
          type="date"
          name="followUpDate"
          value={followUpDate}
          onChange={onNotesChange}
          disabled={disabled}
          min={getTodayDate()}
          fullWidth
        />
      </div>
    </>
  );
};

export default CA_Notes;
