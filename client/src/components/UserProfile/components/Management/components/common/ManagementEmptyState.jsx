import React from "react";
import { Plus, Inbox } from "lucide-react";
import Button from "../../../../../common/Button/Button";
import styles from "./ManagementEmptyState.module.css";

const ManagementEmptyState = ({
  title,
  description,
  onAdd,
  icon: Icon = Inbox,
  buttonText,
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <Icon size={48} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {onAdd && (
        <Button variant="primary" onClick={onAdd} className={styles.addBtn}>
          <Plus size={20} />
          <span>{buttonText || "Add New Item"}</span>
        </Button>
      )}
    </div>
  );
};

export default ManagementEmptyState;
