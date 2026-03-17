import React from "react";
import { ArrowLeft } from "lucide-react";
import styles from "../AdminPetDetail.module.css";
import { Button } from "../../../common";
const AdminPetTopBar = ({
  onBack
}) => {
  return <div className={styles.topBar}>
      <Button className={styles.backBtn} onClick={onBack} variant="ghost" size="sm">
        <ArrowLeft size={18} /> Back
      </Button>
    </div>;
};
export default AdminPetTopBar;
