import React from "react";
import styles from "./userCard.module.css";
import { Mail, Shield, ChevronRight, MoreVertical, Eye, Check, X, Archive, RotateCcw } from "lucide-react";
import { BASE_URL } from "../../../../../utils/constants";
import { Button } from "../../../../common";
const UserCard = ({
  user,
  onDelete,
  onArchive,
  onClick,
  onApprove,
  onReject
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const getInitials = name => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  };
  return <div className={`${styles.card} ${showMenu ? styles.cardActive : ""}`} onClick={onClick}>
      <div className={styles.content}>
        <div className={styles.avatarWrapper}>
          {user.avatar ? <img src={`${BASE_URL}/uploads/avatars/${user.avatar}`} alt={user.name} className={styles.avatar} /> : <div className={styles.avatarPlaceholder}>
              {getInitials(user.name)}
            </div>}
        </div>

        <div className={styles.details}>
          <div className={styles.header}>
            <h3 className={styles.userName}>{user.name || "Unknown User"}</h3>
            <div className={styles.badgesRow}>
              <span className={`${styles.roleBadge} ${styles[user.role || "user"]}`}>
                {user.role || "user"}
              </span>
              {user.role !== "user" && user.role !== "admin" && <span className={`${styles.statusBadge} ${styles[user.kycStatus || "pending"]}`}>
                  {user.kycStatus || "pending"}
                </span>}
              {user.isArchived && <span className={`${styles.statusBadge} ${styles.archived}`}>
                  Archived
                </span>}
            </div>
          </div>

          <div className={styles.emailRow}>
            <Mail size={12} />
            <span>{user.email}</span>
          </div>
        </div>

        <div className={styles.menuWrapper}>
          <Button onClick={e => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }} className={styles.menuBtn} variant="primary" size="md">
            <MoreVertical size={16} />
          </Button>

          {showMenu && <div className={styles.menuDropdown} onMouseLeave={() => setShowMenu(false)}>
              <div className={styles.menuItem} onClick={e => {
            e.stopPropagation();
            setShowMenu(false);
            onClick();
          }}>
                <Eye size={14} /> View Details
              </div>

              {user.kycStatus === "pending" && user.role !== "user" && <>
                  <div className={`${styles.menuItem} ${styles.approve}`} onClick={e => {
              e.stopPropagation();
              setShowMenu(false);
              onApprove(user._id);
            }}>
                    <Check size={14} /> Approve
                  </div>
                  <div className={`${styles.menuItem} ${styles.reject}`} onClick={e => {
              e.stopPropagation();
              setShowMenu(false);
              onReject(user._id);
            }}>
                    <X size={14} /> Reject
                  </div>
                </>}

              <div className={`${styles.menuItem} ${styles.archive}`} onClick={e => {
            e.stopPropagation();
            setShowMenu(false);
            onArchive && onArchive(user._id, e);
            // Fallback to onDelete if onArchive not passed? No, explicit is better.
          }}>
                {user.isArchived ? <>
                    <RotateCcw size={14} /> Unarchive
                  </> : <>
                    <Archive size={14} /> Archive
                  </>}
              </div>
            </div>}
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.uid}>
          ID: {user._id.slice(-6).toUpperCase()}
        </span>
        <ChevronRight size={14} className={styles.arrow} />
      </div>
    </div>;
};
export default UserCard;
