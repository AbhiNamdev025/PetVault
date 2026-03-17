import React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../../../common";
import styles from "./MobileToggle.module.css";

const MobileToggle = ({ isOpen, onClick }) => {
  return (
    <Button
      className={styles.mobileToggle}
      onClick={onClick}
      variant="primary"
      size="md"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </Button>
  );
};

export default MobileToggle;
