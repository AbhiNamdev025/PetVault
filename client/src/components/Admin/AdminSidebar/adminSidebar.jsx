import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  PawPrint,
  Calendar,
  LogOut,
  Home,
  ClipboardList,
  CalendarClock,
  Building2,
  WalletCards,
  MailPlus,
} from "lucide-react";
import styles from "./adminSidebar.module.css";
import { emitAuthStateChanged } from "../../../utils/authState";
import { Button } from "../../common";
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
      path: "/admin/tenants",
      icon: <Building2 size={20} />,
      label: "Tenants Management",
    },
    {
      path: "/admin/services",
      icon: <Calendar size={20} />,
      label: "Services Management",
    },
    {
      path: "/admin/orders",
      icon: <ClipboardList size={20} />,
      label: "Order Management",
    },
    {
      path: "/admin/appointments",
      icon: <CalendarClock size={20} />,
      label: "Appointments Management",
    },
    {
      path: "/admin/payouts",
      icon: <WalletCards size={20} />,
      label: "Payout Management",
    },
    {
      path: "/admin/newsletter",
      icon: <MailPlus size={20} />,
      label: "Newsletter Broadcast",
    },
  ];
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    emitAuthStateChanged({
      status: "logged_out",
      source: "admin_sidebar",
    });
    window.location.href = "/";
  };
  const handleGoHome = () => {
    navigate("/");
  };
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo} onClick={handleGoHome}>
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
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <Button
          className={styles.footerBtn}
          onClick={handleGoHome}
          variant="primary"
          size="md"
        >
          <Home size={20} />
          <span>Back to Site</span>
        </Button>
        <Button
          className={`${styles.footerBtn} ${styles.logout}`}
          onClick={handleLogout}
          variant="primary"
          size="md"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
export default AdminSidebar;
