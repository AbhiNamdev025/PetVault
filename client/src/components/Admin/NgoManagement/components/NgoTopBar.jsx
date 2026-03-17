import React from "react";
import { ArrowLeft } from "lucide-react";
import styles from "../ngoDetail.module.css";
import { Button } from "../../../common";
const NgoTopBar = ({
  onBack
}) => {
  return <div className={styles.topBar}>
      <Button className={styles.backBtn} onClick={onBack} variant="ghost" size="sm">
        <ArrowLeft size={18} /> Back to Tenants
      </Button>
    </div>;
};
export default NgoTopBar;
