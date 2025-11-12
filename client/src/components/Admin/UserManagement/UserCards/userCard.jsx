import React from "react";
import styles from "./userCard.module.css";
import { Mail, Phone, User, Trash2, IdCard, Shield } from "lucide-react";

const UserCard = ({ user, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <User size={18} />
        <h3>{user.name || "Unknown User"}</h3>
      </div>

      <div className={styles.info}>
        <p>
          <Mail size={15} /> {user.email || "No Email"}
        </p>
        <p>
          <Phone size={15} /> {user.phone || "Google User"}
        </p>
        <p>
          <IdCard size={15} /> User ID: {user._id}
        </p>
        <p className={styles.role}>
          <Shield size={15} /> Role:{" "}
          <span
            className={
              user.role === "admin" ? styles.adminRole : styles.userRole
            }
          >
            {user.role || "user"}
          </span>
        </p>
      </div>

      <button onClick={() => onDelete(user._id)} className={styles.deleteBtn}>
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default UserCard;
