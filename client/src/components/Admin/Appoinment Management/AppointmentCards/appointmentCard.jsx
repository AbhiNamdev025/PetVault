import React, { useState, useRef, useEffect } from "react";
import styles from "./appointmentCard.module.css";
import {
  Calendar,
  Clock,
  PawPrint,
  User,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  ClipboardList,
  MoreVertical,
  Eye,
} from "lucide-react";
import { Button } from "../../../common";
const AppointmentCard = ({ appointment, onDelete, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={12} />;
      case "confirmed":
        return <ShieldCheck size={12} />;
      case "completed":
        return <CheckCircle size={12} />;
      case "cancelled":
        return <XCircle size={12} />;
      default:
        return null;
    }
  };
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.idCol}>
        <span className={styles.appointmentId}>
          #{appointment._id.slice(-8).toUpperCase()}
        </span>
        <span className={styles.serviceTag}>{appointment.service}</span>
      </div>

      <div className={styles.infoCol}>
        <div className={styles.primaryInfo}>
          <PawPrint size={14} />
          <span>{appointment.petName}</span>
          <span className={styles.dot}>•</span>
          <User size={12} />
          <span>{appointment.user?.name || "Unknown"}</span>
        </div>
        <div className={styles.secondaryInfo}>
          <ClipboardList size={11} />
          <span>{appointment.reason || "General Visit"}</span>
        </div>
      </div>

      <div className={styles.statusCol}>
        <span className={`${styles.statusBadge} ${styles[appointment.status]}`}>
          {getStatusIcon(appointment.status)}
          {appointment.status}
        </span>
      </div>

      <div className={styles.scheduleCol}>
        <div className={styles.dateRow}>
          <Calendar size={13} />
          <span>{new Date(appointment.date).toLocaleDateString()}</span>
        </div>
        <div className={styles.timeRow}>
          <Clock size={13} />
          <span>{appointment.time}</span>
        </div>
      </div>

      <div className={styles.actionsCol}>
        <div className={styles.menuContainer} ref={menuRef}>
          <button
            className={styles.menuBtn}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                  setShowMenu(false);
                }}
              >
                <Eye size={16} />
                <span>View Details</span>
              </button>
              <button
                className={`${styles.dropdownItem} ${styles.deleteItem}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(appointment._id);
                  setShowMenu(false);
                }}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AppointmentCard;
