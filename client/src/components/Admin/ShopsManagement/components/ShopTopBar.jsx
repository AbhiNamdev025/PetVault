import React from "react";
import { ArrowLeft } from "lucide-react";
import styles from "../shopDetail.module.css";
import { Button } from "../../../common";
const ShopTopBar = ({
  onBack
}) => {
  return <Button className={styles.backBtn} onClick={onBack} variant="ghost" size="sm">
      <ArrowLeft size={20} />
      Back to Tenants
    </Button>;
};
export default ShopTopBar;
