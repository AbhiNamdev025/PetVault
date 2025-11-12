import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar/adminSidebar";
import { Menu, X } from "lucide-react";
import styles from "./adminPage.module.css";

const AdminPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={styles.adminPage}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebarWrapper} ${
          isSidebarOpen ? styles.open : ""
        }`}
      >
        <AdminSidebar />
      </aside>

      {isSidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar}></div>
      )}

      <main className={styles.mainContent}>
        {/* mobile  */}
        <header className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          <h2>Admin Panel</h2>
        </header>

        <div className={styles.outletWrapper}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
