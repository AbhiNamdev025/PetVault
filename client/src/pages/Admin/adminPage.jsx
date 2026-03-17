import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/AdminSidebar/adminSidebar";
import TopNav from "../../components/Admin/common/TopNav/TopNav";
import { Menu, X, Filter, PawPrint } from "lucide-react";
import styles from "./adminPage.module.css";
import Button from "../../components/common/Button/Button";
import FilterSidebar from "../../components/common/FilterSidebar/FilterSidebar";
import { API_BASE_URL } from "../../utils/constants";

const AdminPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [dashboardFilters, setDashboardFilters] = useState({
    range: "lifetime",
  });
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleGlobalSearch();
      } else {
        setSearchResults(null);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleGlobalSearch = async () => {
    setIsSearching(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const filterOptions = [
    {
      id: "range",
      label: "Time Range",
      values: [
        { id: "today", label: "Today" },
        { id: "week", label: "This Week" },
        { id: "month", label: "This Month" },
        { id: "lifetime", label: "Lifetime" },
      ],
    },
  ];

  return (
    <div className={styles.adminPage}>
      <aside
        className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ""}`}
      >
        <AdminSidebar />
        <Button
          variant="ghost"
          className={styles.mobileCloseBtn}
          onClick={closeSidebar}
        >
          <X size={26} />
        </Button>
      </aside>

      {isSidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar}></div>
      )}

      <main className={styles.mainContent} data-scroll-root="true">
        <header className={styles.mobileHeader}>
          <div className={styles.logo}>
            <PawPrint size={26} className={styles.logoIcon} />
            <h2>PetVault</h2>
          </div>
          <Button
            variant="ghost"
            className={styles.menuButton}
            onClick={toggleSidebar}
          >
            <Menu size={26} />
          </Button>
        </header>

        <div className={styles.topNavWrapper}>
          <TopNav
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
            searchResults={searchResults}
            onNavigate={navigate}
            onOpenReviewPortal={() => navigate("/admin/tenants")}
          />
        </div>

        <FilterSidebar
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
          filters={dashboardFilters}
          setFilters={setDashboardFilters}
          options={filterOptions}
          onReset={() => setDashboardFilters({ range: "lifetime" })}
          showSearch={false}
        />

        <div className={styles.outletWrapper}>
          <Outlet
            context={{
              dashboardFilters,
              onOpenFilters: () => setIsFilterSidebarOpen(true),
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
