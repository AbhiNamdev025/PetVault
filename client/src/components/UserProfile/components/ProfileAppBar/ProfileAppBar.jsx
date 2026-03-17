import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Search, PawPrint, LogOut } from "lucide-react";
import { BASE_URL } from "../../../../utils/constants";
import { emitProfileSearch } from "../../../../utils/profileSearch";
import Notifications from "../Notifications/notifications";
import { Avatar, Button, Input } from "../../../common";
import styles from "./ProfileAppBar.module.css";

const normalizeSearchQuery = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const ProfileAppBar = ({
  user,
  tabs = [],
  activeTab,
  onTabChange,
  onLogout,
  onBackToSite,
  hideSearch,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [showAlerts, setShowAlerts] = useState(false);
  const alertsRef = useRef(null);
  const hiddenSearchTabs = useMemo(
    () => new Set(["coins", "wallet", "profile", "dashboard"]),
    [],
  );
  const showSearch =
    !hiddenSearchTabs.has(String(activeTab || "").toLowerCase()) && !hideSearch;

  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return undefined;
    return `${BASE_URL}/uploads/avatars/${user.avatar}`;
  }, [user?.avatar]);

  const tabSearchIndex = useMemo(() => {
    const keywordMap = {
      profile: ["profile", "account", "user", "me"],
      dashboard: ["dashboard", "home", "overview", "stats", "analytics"],
      management: ["management", "manage", "admin"],
      orders: ["orders", "order", "sales", "purchases"],
      appointments: ["appointments", "appointment", "booking", "consultation"],
      alerts: ["alerts", "alert", "notifications", "notification", "bell"],
      wallet: ["wallet", "balance", "payments", "earnings", "payout"],
      coins: ["coins", "coin", "rewards"],
      mypets: ["mypets", "my pets", "pets", "pet"],
    };

    return tabs.map((tab) => {
      const id = normalizeSearchQuery(tab.id);
      const label = normalizeSearchQuery(tab.label);
      const tokens = [id, label, ...(keywordMap[id] || [])].map(
        normalizeSearchQuery,
      );

      return { tab, tokens };
    });
  }, [tabs]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setShowAlerts(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (showAlerts) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showAlerts]);

  useEffect(() => {
    if (showSearch) return;
    if (!searchValue) return;
    setSearchValue("");
  }, [showSearch, searchValue]);

  // Live search (same typing behavior as existing filter search inputs).
  useEffect(() => {
    if (!showSearch) return;
    const query = normalizeSearchQuery(searchValue);
    const timer = window.setTimeout(() => {
      emitProfileSearch({
        query,
        targetTab: activeTab,
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [searchValue, activeTab, showSearch]);

  // Re-apply current global query after manual tab change.
  useEffect(() => {
    if (!showSearch) return;
    const query = normalizeSearchQuery(searchValue);
    emitProfileSearch({
      query,
      targetTab: activeTab,
    });
  }, [activeTab, showSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!showSearch) return;

    const query = normalizeSearchQuery(searchValue);
    if (!query) {
      emitProfileSearch({
        query: "",
        targetTab: activeTab,
      });
      return;
    }

    const matchedEntry = tabSearchIndex.find((entry) =>
      entry.tokens.some(
        (token) => token.includes(query) || query.includes(token),
      ),
    );

    if (matchedEntry && matchedEntry.tab.id !== activeTab) {
      const nextTab = matchedEntry.tab.id;
      onTabChange(nextTab);
      window.setTimeout(() => {
        emitProfileSearch({
          query,
          targetTab: nextTab,
        });
      }, 220);
      return;
    }

    emitProfileSearch({
      query,
      targetTab: matchedEntry?.tab?.id || activeTab,
    });
  };

  return (
    <header
      className={`${styles.appBar} ${!showSearch ? styles.appBarNoSearch : ""}`}
      data-profile-appbar="true"
    >
      <div className={styles.topRow}>
        <div className={styles.brand} onClick={onBackToSite}>
          <div className={styles.brandIcon}>
            <PawPrint size={18} />
          </div>
          <span className={styles.brandLabel}>PetVault</span>
        </div>

        <div className={styles.actions}>
          <div className={styles.alertsWrap} ref={alertsRef}>
            <Button
              type="button"
              className={styles.iconButton}
              onClick={() => setShowAlerts((previous) => !previous)}
              variant="ghost"
              size="md"
              aria-label="Open alerts"
            >
              <Bell size={18} />
            </Button>

            {showAlerts && (
              <div className={styles.alertsPanel}>
                <Notifications
                  compact
                  maxItems={4}
                  title="Latest Alerts"
                  onViewAll={() => {
                    setShowAlerts(false);
                    onTabChange("alerts");
                  }}
                />
              </div>
            )}
          </div>

          <Button
            type="button"
            className={styles.profileButton}
            onClick={() => onTabChange("profile")}
            variant="ghost"
            size="md"
          >
            <Avatar
              src={avatarSrc}
              name={user?.name || "User"}
              alt={user?.name || "User"}
              size="sm"
            />
            <span className={styles.profileLabel}>
              {user?.name || "Profile"}
            </span>
          </Button>

          <Button
            onClick={onLogout}
            className={styles.logoutBtn}
            variant="ghost"
            size="md"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      {showSearch && (
        <div className={styles.searchRow}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <Input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search sections..."
              icon={<Search size={16} />}
              className={styles.searchInput}
              fullWidth
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default ProfileAppBar;
