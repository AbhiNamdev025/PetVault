import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  PawPrint,
  ShoppingBag,
  Calendar,
  LogOut,
  Home,
  ClipboardList,
  CalendarClock,
} from "lucide-react";
import styles from "./adminSidebar.module.css";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/admin",
      icon: <BarChart3 size={20} />,
      label: "Dashboard",
      exact: true,
    },
    {
      path: "/admin/pets",
      icon: <PawPrint size={20} />,
      label: "Pets Management",
    },
    {
      path: "/admin/products",
      icon: <ShoppingBag size={20} />,
      label: "Products Management",
    },

    {
      path: "/admin/orders",
      icon: <ClipboardList size={20} />,
      label: "Order Management",
    },

    {
      path: "/admin/services",
      icon: <Calendar size={20} />,
      label: "Services Management",
    },
    {
      path: "/admin/appointments",
      icon: <CalendarClock size={20} />,
      label: "Appointments Management",
    },
    {
      path: "/admin/users",
      icon: <Users size={20} />,
      label: "Users Management",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <PawPrint className={styles.logoIcon} />
          <div>
            <h2>PetVault</h2>
            <span className={styles.adminBadge}>Admin Panel</span>
          </div>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.homeBtn} onClick={handleGoHome}>
          <Home size={20} />
          <span>Back to Site</span>
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
