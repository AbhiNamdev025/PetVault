import React from "react";
import { Calendar, Search, ShoppingBag, Users, Filter } from "lucide-react";
import styles from "./TopNav.module.css";
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
      <div className={styles.searchContainer}>
        <Input
          placeholder="Global search (Orders, Users, Pets...)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search size={16} />}
          rightElement={
            isSearching && <div className={styles.loaderSmall}></div>
          }
          className={styles.globalSearch}
          fullWidth
        />

        {searchResults && searchQuery.trim().length >= 2 && (
          <div className={styles.searchDropdown}>
            {searchResults.users?.length > 0 && (
              <div className={styles.searchCat}>
                <label>Tenants & Users</label>
                {searchResults.users.map((u) => (
                  <div
                    key={u._id}
                    className={styles.searchResultItem}
                    onClick={() => {
                      onNavigate(`/admin/tenants/${u._id}`);
                      onSearchChange("");
                    }}
                  >
                    <Users size={14} />
                    {u.name}
                    <span>{u.role}</span>
                  </div>
                ))}
              </div>
            )}
            {searchResults.orders?.length > 0 && (
              <div className={styles.searchCat}>
                <label>Orders</label>
                {searchResults.orders.map((o) => (
                  <div
                    key={o._id}
                    className={styles.searchResultItem}
                    onClick={() => {
                      onNavigate("/admin/orders", {
                        state: { orderId: o._id },
                      });
                      onSearchChange("");
                    }}
                  >
                    <ShoppingBag size={14} />#{o._id.slice(-8).toUpperCase()}
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
                    className={styles.searchResultItem}
                    onClick={() => {
                      onNavigate("/admin/appointments", {
                        state: { appointmentId: a._id },
                      });
                      onSearchChange("");
                    }}
                  >
                    <Calendar size={14} />#{a._id.slice(-8).toUpperCase()}
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
