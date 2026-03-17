import React from "react";
import styles from "./detailNav.module.css";
import { Button } from "../../../../../../common";
const DetailNav = ({ userData, onDashboardClick }) => {
  if (!["shop", "hospital", "daycare", "ngo"].includes(userData.role))
    return null;
  return (
    <div className={styles.specializedNav}>
      <p>
        For detailed inventory, pets, or medical records, access the primary
        dashboard:
      </p>
      <Button onClick={onDashboardClick} variant="primary" size="md">
        View {userData.role.toUpperCase()} Dashboard
      </Button>
    </div>
  );
};
export default DetailNav;
