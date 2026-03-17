import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../../../../../../common";
import styles from "../hospitalManagement.module.css";

const HospitalHeader = ({ onAdd }) => {
  return (
    <div className={styles.topRow}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>Manage Doctors</h2>
        <p className={styles.subtitle}>
          Add and manage doctor profiles for your hospital.
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={styles.addBtn}
        onClick={onAdd}
      >
        <Plus size={16} /> Add Doctor
      </Button>
    </div>
  );
};

export default HospitalHeader;
