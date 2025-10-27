import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar/adminSidebar";
import styles from "./adminPage.module.css";

const AdminPage = () => {
  return (
    <div className={styles.adminPage}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;
