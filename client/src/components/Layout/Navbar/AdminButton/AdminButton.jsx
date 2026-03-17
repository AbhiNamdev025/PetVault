import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { Button } from "../../../common";
import styles from "./AdminButton.module.css";

const AdminButton = ({ user }) => {
  const navigate = useNavigate();

  if (!user || user.role !== "admin") return null;

  return (
    <Button
      className={styles.adminBtn}
      onClick={() => navigate("/admin")}
      title="Go to Admin Dashboard"
      variant="primary"
      size="md"
    >
      <LayoutDashboard size={20} />
      <span className={styles.adminText}>Admin Panel</span>
    </Button>
  );
};

export default AdminButton;
