import React from "react";
import { Package, PawPrint } from "lucide-react";
import styles from "../shopDetail.module.css";
import { Button } from "../../../common";
const ShopTabs = ({
  activeTab,
  onTabChange,
  productsCount,
  petsCount
}) => {
  return <div className={styles.tabs}>
      <Button className={`${styles.tab} ${activeTab === "products" ? styles.activeTab : ""}`} onClick={() => onTabChange("products")} variant="ghost" size="sm">
        <Package size={18} />
        Products ({productsCount})
      </Button>
      <Button className={`${styles.tab} ${activeTab === "pets" ? styles.activeTab : ""}`} onClick={() => onTabChange("pets")} variant="ghost" size="sm">
        <PawPrint size={18} />
        Pets ({petsCount})
      </Button>
    </div>;
};
export default ShopTabs;
