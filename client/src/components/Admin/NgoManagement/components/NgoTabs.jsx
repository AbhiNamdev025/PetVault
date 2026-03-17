import React from "react";
import { PawPrint } from "lucide-react";
import styles from "../ngoDetail.module.css";
import { Button } from "../../../common";
const NgoTabs = ({
  petCount
}) => {
  return <div className={styles.tabs}>
      <Button className={`${styles.tab} ${styles.activeTab}`} variant="ghost" size="sm">
        <PawPrint size={18} /> Pets for Adoption ({petCount})
      </Button>
    </div>;
};
export default NgoTabs;
