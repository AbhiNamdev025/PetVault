import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../../../../common";
import styles from "../daycareManagement.module.css";

const DaycareHeader = ({ onAdd }) => {
  return (
    <div className={styles.topRow}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>Manage Caretakers</h2>
        <p className={styles.subtitle}>
          Add and manage caretaker profiles for your daycare.
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={styles.addBtn}
        onClick={onAdd}
      >
        <Plus size={16} /> Add Caretaker
      </Button>
    </div>
  );
};

export default DaycareHeader;
