import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Settings,
  Calendar,
  ShoppingBag,
  Dog,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  PawPrint,
  Bell,
  Wallet,
  ArrowLeft,
  Coins
} from "lucide-react";
import styles from "./sidebar.module.css";
import { Button } from "../../../common";
import { scrollAppToTop } from "../../../../utils/scroll";
const Sidebar = ({
  activeTab,
  onTabChange,
  onLogout,
  onBackToSite,
  tabs = [],
}) => {
  const navigate = useNavigate();

  const handleBackToSite = () => {
    if (onBackToSite) {
      onBackToSite();
      return;
    }
    navigate("/");
  };

  const getIcon = (id) => {
    switch (id) {
      case "profile":
        return <User size={20} />;
      case "mypets":
        return <Dog size={20} />;
      case "appointments":
        return <Calendar size={20} />;
      case "orders":
        return <ShoppingBag size={20} />;
      case "management":
        return <LayoutDashboard size={20} />;
      case "coins":
        return <Coins  size={20} />;
      case "alerts":
        return <Bell size={20} />;
      case "wallet":
        return <Wallet size={20} />;
      case "edit":
        return <Settings size={20} />;
      default:
        return <FolderKanban size={20} />;
    }
  };
  return (
    <aside className={styles.sidebar}>
      <div className={`${styles.sidebarHeader} ${styles.desktopOnly}`}>
        <div className={styles.brand}>
          <Button
            onClick={handleBackToSite}
            className={styles.brandButton}
            variant="ghost"
            size="md"
            fullWidth
          >
            <span className={styles.brandIcon}>
              <PawPrint size={16} />
            </span>
            <span className={styles.brandLabel}>PetVault</span>
          </Button>
        </div>
      </div>

      <nav className={styles.nav}>
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              scrollAppToTop({ behavior: "auto" });
              window.requestAnimationFrame(() => {
                scrollAppToTop({ behavior: "auto" });
              });
            }}
            className={`${styles.navItem} ${activeTab === tab.id ? styles.activeItem : ""}`}
            variant="ghost"
            size="md"
            fullWidth
          >
            {getIcon(tab.id)}
            <span className={styles.label}>{tab.label}</span>
          </Button>
        ))}
      </nav>

      <div className={`${styles.footer} ${styles.desktopOnly}`}>
        <Button
          onClick={handleBackToSite}
          className={`${styles.footerBtn} ${styles.backToSiteBtn}`}
          variant="ghost"
          size="md"
          fullWidth
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Button>
        <Button
          onClick={onLogout}
          className={`${styles.footerBtn} ${styles.logoutBtn}`}
          variant="ghost"
          size="md"
          fullWidth
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};
export default Sidebar;
