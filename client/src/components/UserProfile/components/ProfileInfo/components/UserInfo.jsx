import React from "react";
import styles from "../profileInfo.module.css";
import AddressInfo from "./AddressInfo";

const UserInfo = ({ address }) => {
  return (
    <div className={styles.roleSection}>
      <AddressInfo address={address} title="Address Information" />
    </div>
  );
};

export default UserInfo;
