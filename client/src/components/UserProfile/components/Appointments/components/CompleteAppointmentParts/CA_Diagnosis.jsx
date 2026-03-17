import React from "react";
import { Input } from "../../../../../common";
import styles from "../../appointments.module.css";

const CA_Diagnosis = ({ diagnosis, onChange, required, disabled, error }) => {
  return (
    <div className={styles.formGroup}>
      <Input
        label="Diagnosis"
        name="diagnosis"
        value={diagnosis}
        onChange={onChange}
        placeholder="E.g., Viral Fever"
        required={required}
        disabled={disabled}
        error={error}
        maxLength={50}
        fullWidth
      />
    </div>
  );
};

export default CA_Diagnosis;
