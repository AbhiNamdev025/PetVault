import React, { useEffect, useState } from "react";
import ShopProducts from "../ShopProducts/ShopProducts";
import PetManagement from "../../../PetManagement/petManagement";
import styles from "./ShopDashboard.module.css";
import { Button } from "../../../../../../../common";
const ShopDashboard = ({ user }) => {
  const [allowedTabs, setAllowedTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  useEffect(() => {
    if (!user?.roleData?.shopType) {
      setAllowedTabs(["shop"]);
      setActiveTab((prev) => (prev === "" ? "shop" : prev));
      return;
    }
    const shopType = user.roleData.shopType;
    let tabs = ["shop"];
    if (shopType === "mixed") {
      tabs = ["shop", "pets"];
    } else if (shopType === "petStore") {
      tabs = ["pets"];
    } else if (shopType === "medicalStore" || shopType === "groomingCenter") {
      tabs = ["shop"];
    }
    setAllowedTabs(tabs);
    if (activeTab === "" || !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [user, activeTab]);
  if (allowedTabs.length === 0) return null;

  const hasMultipleTabs = allowedTabs.length > 1;
  const title = activeTab === "pets" ? "Manage Pets" : "Manage Products";
  const subtitle =
    activeTab === "pets"
      ? "Keep your pet listings updated with complete details and status."
      : "Manage product listings, pricing, and stock from one place.";

  return (
    <div className={styles.container}>
      {hasMultipleTabs && (
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      )}

      {hasMultipleTabs && (
        <div className={styles.tabsContainer}>
          {allowedTabs.includes("shop") && (
            <Button
              className={`${styles.tab} ${activeTab === "shop" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("shop")}
              variant="ghost"
              size="sm"
            >
              Products
            </Button>
          )}
          {allowedTabs.includes("pets") && (
            <Button
              className={`${styles.tab} ${activeTab === "pets" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("pets")}
              variant="ghost"
              size="sm"
            >
              Pets
            </Button>
          )}
        </div>
      )}

      <div className={styles.content}>
        {activeTab === "shop" && (
          <ShopProducts user={user} hideTitleBlock={hasMultipleTabs} />
        )}
        {activeTab === "pets" && (
          <PetManagement user={user} hideTitleBlock={hasMultipleTabs} />
        )}
      </div>
    </div>
  );
};
export default ShopDashboard;
