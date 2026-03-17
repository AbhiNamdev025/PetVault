import React from "react";
import { Calendar, Search, ShoppingBag, Users } from "lucide-react";
import styles from "../adminDashboard.module.css";
import { Input } from "../../../common";

const TopNav = ({
  searchQuery,
  onSearchChange,
  isSearching,
  searchResults,
  onNavigate,
  onOpenReviewPortal,
}) => {
  return (
    <div className={styles.topNav}>
      <div className={styles.searchBar}>
        <Search size={16} />
        <Input
          type="text"
          placeholder="Global search (Orders, Users, Pets...)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
          className={styles.searchInput}
        />
        {isSearching && <div className={styles.loaderSmall}></div>}

        {searchResults && (
          <div className={styles.searchDropdown}>
            {searchResults.users?.length > 0 && (
              <div className={styles.searchCat}>
                <label>Tenants & Users</label>
                {searchResults.users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => onNavigate(`/admin/tenants/${u._id}`)}
                  >
                    <Users size={12} /> {u.name} <span>{u.role}</span>
                  </div>
                ))}
              </div>
            )}
            {searchResults.orders?.length > 0 && (
              <div className={styles.searchCat}>
                <label>Orders</label>
                {searchResults.orders.map((o) => (
                  <div key={o._id} onClick={() => onNavigate("/admin/orders")}>
                    <ShoppingBag size={12} /> #{o._id.slice(-8).toUpperCase()}{" "}
                    <span>{o.customerName}</span>
                  </div>
                ))}
              </div>
            )}
            {searchResults.appointments?.length > 0 && (
              <div className={styles.searchCat}>
                <label>Appointments</label>
                {searchResults.appointments.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => onNavigate("/admin/appointments")}
                  >
                    <Calendar size={12} /> #{a._id.slice(-8).toUpperCase()}{" "}
                    <span>{a.userName}</span>
                  </div>
                ))}
              </div>
            )}
            {!searchResults.users?.length &&
              !searchResults.orders?.length &&
              !searchResults.appointments?.length && (
                <div className={styles.noResults}>
                  No matches found for "{searchQuery}"
                </div>
              )}
          </div>
        )}
      </div>
      <div className={styles.navActions}>
        <div className={styles.quickAction} onClick={onOpenReviewPortal}>
          Review Portal
        </div>
      </div>
    </div>
  );
};

export default TopNav;
