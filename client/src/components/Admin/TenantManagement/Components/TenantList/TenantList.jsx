import React from "react";
import styles from "./tenantList.module.css";
import {
  MoreVertical,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Archive as ArchiveIcon,
} from "lucide-react";
import { BASE_URL } from "../../../../../utils/constants";
import { Button } from "../../../../common";
const TenantList = ({
  users,
  loading,
  onRowClick,
  activeMenuId,
  setActiveMenuId,
  onArchive,
  onApprove,
  onReject,
}) => {
  const getStatusBadge = (user) => {
    if (user.isArchived)
      return (
        <span className={`${styles.badge} ${styles.archived}`}>Archived</span>
      );
    switch (user.kycStatus) {
      case "approved":
        return (
          <span className={`${styles.badge} ${styles.approved}`}>Active</span>
        );
      case "rejected":
        return (
          <span className={`${styles.badge} ${styles.rejected}`}>
            Suspended
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.pending}`}>Pending</span>
        );
    }
  };
  return (
    <div className={styles.userListContainer}>
      <div className={styles.listHeader}>
        <div className={styles.colUser}>USER</div>
        <div className={styles.colRole}>ROLE</div>
        <div className={styles.colStatus}>STATUS</div>
        <div className={`${styles.colMobile} ${styles.mobileHide}`}>MOBILE</div>
        <div className={`${styles.colDate} ${styles.mobileHide}`}>
          REGISTERED
        </div>
        <div className={styles.colActions}>ACTIONS</div>
      </div>

      <div className={styles.userList}>
        {loading ? (
          <div className={styles.loadingState}>Loading users...</div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <div
              key={user._id}
              className={styles.userRow}
              onClick={() => onRowClick(user)}
            >
              <div className={styles.colUser} data-label="User Info">
                <div className={styles.userInfo}>
                  {user.avatar ? (
                    <img
                      src={`${BASE_URL}/uploads/avatars/${user.avatar}`}
                      alt=""
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {(user.name?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                  <div className={styles.userText}>
                    <span className={styles.userName}>
                      {user.role === "doctor" ? ` ${user.name}` : user.name}
                    </span>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                </div>
              </div>

              <div className={styles.colRole} data-label="Role">
                <div className={styles.roleCell}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>

              <div className={styles.colStatus} data-label="Status">
                {getStatusBadge(user)}
              </div>

              <div
                className={`${styles.colMobile} ${styles.mobileHide}`}
                data-label="Mobile"
              >
                {user.phone || "N/A"}
              </div>

              <div
                className={`${styles.colDate} ${styles.mobileHide}`}
                data-label="Registered"
              >
                <div className={styles.dateCell}>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  <span className={styles.time}>
                    {new Date(user.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.colActions} data-label="Actions">
                <div
                  className={styles.actionWrapper}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={styles.miniAction}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(
                        activeMenuId === user._id ? null : user._id,
                      );
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {activeMenuId === user._id && (
                    <div className={styles.miniMenu}>
                      <div onClick={() => onArchive(user)}>
                        {user.isArchived ? (
                          <RotateCcw size={14} />
                        ) : (
                          <ArchiveIcon size={14} />
                        )}
                        {user.isArchived ? "Unarchive" : "Archive"}
                      </div>
                      {user.kycStatus === "pending" && user.role !== "user" && (
                        <>
                          <div
                            onClick={() => onApprove(user)}
                            className={styles.approve}
                          >
                            <CheckCircle2 size={14} /> Approve
                          </div>
                          <div
                            onClick={() => onReject(user)}
                            className={styles.reject}
                          >
                            <XCircle size={14} /> Reject
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No users found.</div>
        )}
      </div>
    </div>
  );
};
export default TenantList;
