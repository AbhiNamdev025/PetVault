import React, { useState, useRef, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Receipt,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react";
import styles from "./orderCard.module.css";
import { Button } from "../../../common";
const OrderCard = ({ order, onClick, onDelete }) => {
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
      case "confirmed":
        return <CheckCircle size={14} className={styles.confirmedIcon} />;
      case "shipped":
        return <Truck size={14} className={styles.shippedIcon} />;
      case "delivered":
        return <Package size={14} className={styles.deliveredIcon} />;
      case "cancelled":
        return <XCircle size={14} className={styles.cancelledIcon} />;
      default:
        return <Clock size={14} className={styles.pendingIcon} />;
    }
  };
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.idCol}>
        <span className={styles.orderId}>
          #{order._id.slice(-8).toUpperCase()}
        </span>
        <span className={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className={styles.customerCol}>
        <div className={styles.primaryInfo}>
          <User size={14} />
          <span>{order.customerName || order.user?.name || "Unknown"}</span>
        </div>
        <div className={styles.secondaryInfo}>
          <Package size={12} />
          <span>
            {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
          </span>
        </div>
      </div>

      <div className={styles.statusCol}>
        <span className={`${styles.statusBadge} ${styles[order.status]}`}>
          {getStatusIcon(order.status)}
          {order.status}
        </span>
      </div>

      <div className={styles.amountCol}>
        <div className={styles.totalLabel}>Grand Total</div>
        <div className={styles.totalAmount}>
          ₹{order.totalAmount.toFixed(2)}
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
            aria-label="Order actions"
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
                  onDelete && onDelete(order._id);
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
export default OrderCard;
