import React, { useState, useEffect } from "react";
import styles from "./management.module.css";

import DashboardTabs from "./dashboardTabs";

import HospitalManagement from "./components/HospitalManagement/hospitalManagement";
import DaycareManagement from "./components/DaycareManagement/daycareManagement";
import SharedProviderManagement from "./components/sharedProviderManagement";
import ShopManagement from "./components/ShopManagement/components/ShopProducts/ShopProducts";
import NgoManagement from "./components/NgoManagement/ngoManagement";
import UserManagement from "./components/UsersManagement/userManagement";
import PetManagement from "./components/PetManagement/petManagement";
import ShopOrders from "../Orders/components/shopOrders/shopOrders";

const Management = ({ user, userRole }) => {
  const [activeTab, setActiveTab] = useState("");
  const [allowedTabs, setAllowedTabs] = useState([]);

  //  allowed tabs based on role and shop type
  useEffect(() => {
    const getTabsForRole = () => {
      const roleTabs = {
        admin: ["hospital", "shop", "daycare", "caretaker", "ngo", "user"],
        hospital: ["hospital"],
        doctor: [],
        ngo: ["ngo"],
        daycare: ["daycare"],
        caretaker: ["caretaker"],
        user: [],
      };

      if (userRole === "shop") {
        const shopType = user.roleData?.shopType;

        if (shopType === "mixed") {
          return ["shop", "pets", "orders"];
        } else if (shopType === "petStore") {
          return ["pets"];
        } else if (
          shopType === "medicalStore" ||
          shopType === "groomingCenter"
        ) {
          return ["shop", "orders"];
        }
        return ["shop", "orders"];
      }

      return roleTabs[userRole] || [];
    };

    const tabs = getTabsForRole();
    setAllowedTabs(tabs);

    if (tabs.length > 0 && (!activeTab || !tabs.includes(activeTab))) {
      setActiveTab(tabs[0]);
    }
  }, [userRole, user.roleData?.shopType, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "hospital":
        return <HospitalManagement user={user} userRole={userRole} />;
      case "doctor":
        return <SharedProviderManagement user={user} title="Doctor" />;
      case "daycare":
        return <DaycareManagement user={user} userRole={userRole} />;
      case "caretaker":
        return <SharedProviderManagement user={user} title="Caretaker" />;
      case "shop":
        return <ShopManagement user={user} userRole={userRole} />;
      case "pets":
        return <PetManagement user={user} userRole={userRole} />;
      case "ngo":
        return <NgoManagement user={user} userRole={userRole} />;
      case "user":
        return <UserManagement user={user} userRole={userRole} />;
      case "orders":
        return <ShopOrders user={user} userRole={userRole} />;
      default:
        return <div className={styles.noAccess}>No Access</div>;
    }
  };
  return (
    <div className={styles.wrapper}>
      <DashboardTabs
        allowedTabs={allowedTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className={styles.contentWrapper}>
        {allowedTabs.length > 0 ? (
          renderTabContent()
        ) : (
          <div className={styles.noAccess}>
            No management options available for your account type.
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;
