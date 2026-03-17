import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea, Button } from "../../../../../common";
import styles from "../../appointments.module.css";
const getTodayDate = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

const CA_Vaccinations = ({
  vaccinations,
  onAdd,
  onRemove,
  onChange,
  disabled,
  errors = {},
}) => {
  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h3>Vaccinations</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAdd}
          disabled={disabled}
        >
          <Plus size={14} /> Add
        </Button>
      </div>
      {vaccinations.map((vac, index) => (
        <div key={index} className={styles.prescriptionRow}>
          <div className={styles.rowHeader}>
            <h4>Vaccine #{index + 1}</h4>
            {vaccinations.length > 1 && (
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
            placeholder="Vaccine Name"
            value={vac.name}
            onChange={(e) => onChange(index, "name", e.target.value)}
            disabled={disabled}
            error={errors[`vaccination_${index}_name`]}
            maxLength={50}
            fullWidth
          />
          <div className={styles.row}>
            <Input
              type="date"
              label="Vaccination Date"
              value={vac.date}
              onChange={(e) => onChange(index, "date", e.target.value)}
              disabled={disabled}
              error={errors[`vaccination_${index}_date`]}
              min={getTodayDate()}
              fullWidth
            />
            <Input
              type="date"
              label="Next Due Date"
              value={vac.nextDueDate}
              onChange={(e) => onChange(index, "nextDueDate", e.target.value)}
              disabled={disabled}
              min={getTodayDate()}
              fullWidth
            />
          </div>
          <Textarea
            placeholder="Notes"
            value={vac.notes}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            rows={2}
            disabled={disabled}
            maxLength={200}
            fullWidth
          />
          <div className={styles.charCount}>{vac.notes.length} / 200</div>
        </div>
      ))}
    </div>
  );
};
export default CA_Vaccinations;
