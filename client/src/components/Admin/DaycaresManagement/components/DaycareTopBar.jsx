import React from "react";
import { ArrowLeft } from "lucide-react";
import styles from "../daycareDetail.module.css";
import { Button } from "../../../common";
const DaycareTopBar = ({
  onBack
}) => {
  return <Button className={styles.backBtn} onClick={onBack} variant="ghost" size="sm">
      <ArrowLeft size={20} />
      Back to Tenants
    </Button>;
};
export default DaycareTopBar;
