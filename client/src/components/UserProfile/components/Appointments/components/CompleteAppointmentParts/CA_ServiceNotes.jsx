import React from "react";
import { Textarea } from "../../../../../common";
import styles from "../../appointments.module.css";

const CA_ServiceNotes = ({ serviceNotes, onChange, disabled, error }) => {
  return (
    <div className={styles.formGroup}>
      <Textarea
        label="Service Notes"
        name="serviceNotes"
        value={serviceNotes}
        onChange={onChange}
        rows={4}
        placeholder="Notes about the service..."
        required
        disabled={disabled}
        error={error}
        maxLength={200}
        fullWidth
      />
      <div className={styles.charCount}>{serviceNotes.length} / 2000</div>
    </div>
  );
};

export default CA_ServiceNotes;
