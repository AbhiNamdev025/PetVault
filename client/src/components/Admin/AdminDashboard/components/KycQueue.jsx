import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import styles from "../adminDashboard.module.css";
import { Button } from "../../../common";

const KycQueue = ({
  filteredApps = [],
  onViewAll,
  onStatusUpdate,
  onRowClick,
}) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.contentSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleWithSub}>
          <h3>KYC Applications Queue</h3>
          <p>Verify and onboard new verified partners</p>
        </div>
        <Button
          className={styles.btnView}
          onClick={onViewAll}
          variant="ghost"
          size="md"
        >
          View All
        </Button>
      </div>

      <div className={styles.queueTable}>
        <div className={styles.queueHeader}>
          <div className={styles.colName}>USER</div>
          <div className={styles.colRole}>ROLE</div>
          <div className={styles.colDate}>APPLIED ON</div>
          <div className={styles.colActions}>ACTIONS</div>
        </div>

        <div className={styles.queueList}>
          {filteredApps.length > 0 ? (
            filteredApps.slice(0, 5).map((app) => (
              <div
                key={app._id}
                className={styles.queueRow}
                onClick={() => onRowClick && onRowClick(app)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.colName}>
                  <div className={styles.userCell}>
                    <div className={styles.avatarPlaceholder}>
                      {(app.name?.[0] || "U").toUpperCase()}
                    </div>
                    <span className={styles.userName}>{app.name}</span>
                  </div>
                </div>

                <div className={styles.colRole}>
                  <span className={styles.roleTag}>
                    {app.role?.charAt(0).toUpperCase() + app.role?.slice(1)}
                  </span>
                </div>

                <div className={styles.colDate}>
                  <div className={styles.dateCell}>
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.colActions}>
                  <div className={styles.menuContainer}>
                    <button
                      className={styles.miniActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === app._id ? null : app._id,
                        );
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {activeMenuId === app._id && (
                      <div className={styles.miniDropdown} ref={menuRef}>
                        <button
                          className={styles.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(app, "approve");
                            setActiveMenuId(null);
                          }}
                        >
                          <CheckCircle size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          className={`${styles.dropdownItem} ${styles.rejectItem}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusUpdate(app, "reject");
                            setActiveMenuId(null);
                          }}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noData}>
              <ShieldCheck size={32} opacity={0.2} />
              <p>No pending applications found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycQueue;
