import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea, Button } from "../../../../../common";
import styles from "../../appointments.module.css";
const CA_Prescriptions = ({
  prescriptions,
  onAdd,
  onRemove,
  onChange,
  disabled,
  errors = {},
}) => {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h3>Prescriptions</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus size={14} /> Add Med
        </Button>
      </div>
      {prescriptions.map((p, index) => (
        <div key={index} className={styles.prescriptionRow}>
          <div className={styles.rowHeader}>
            <h4>Medication #{index + 1}</h4>
            {prescriptions.length > 1 && (
              <Button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemove(index)}
                disabled={disabled}
                variant="danger"
                size="md"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
          <Input
            placeholder="Medication name"
            value={p.medication}
            onChange={(e) => onChange(index, "medication", e.target.value)}
            disabled={disabled}
            error={errors[`prescription_${index}_medication`]}
            maxLength={50}
            fullWidth
          />
          <div className={styles.row}>
            <Input
              placeholder="Dosage (e.g., 5mg)"
              value={p.dosage}
              onChange={(e) => onChange(index, "dosage", e.target.value)}
              disabled={disabled}
              maxLength={20}
              fullWidth
            />
            <Input
              placeholder="Duration (e.g., 5 days)"
              value={p.duration}
              onChange={(e) => onChange(index, "duration", e.target.value)}
              disabled={disabled}
              maxLength={20}
              fullWidth
            />
          </div>
          <div className={styles.row}>
            <Input
              placeholder="Frequency (e.g., 2 times/day)"
              value={p.frequency || ""}
              onChange={(e) => onChange(index, "frequency", e.target.value)}
              disabled={disabled}
              maxLength={20}
              fullWidth
            />
            <Input
              placeholder="Timing (e.g., After Food)"
              value={p.timing || ""}
              onChange={(e) => onChange(index, "timing", e.target.value)}
              disabled={disabled}
              maxLength={20}
              fullWidth
            />
          </div>
          <Textarea
            placeholder="Instructions"
            value={p.instructions}
            onChange={(e) => onChange(index, "instructions", e.target.value)}
            rows={2}
            disabled={disabled}
            maxLength={200}
            fullWidth
          />
          <div className={styles.charCount}>
            {(p.instructions || "").length} / 200
          </div>
        </div>
      ))}
    </div>
  );
};
export default CA_Prescriptions;
