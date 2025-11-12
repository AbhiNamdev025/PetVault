import React, { useEffect, useState } from "react";
import styles from "./orderManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import { toast } from "react-toastify";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  User,
  Filter,
  Trash2,
} from "lucide-react";
import StatusPopup from "./Status Popup/statusPopup";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [popup, setPopup] = useState({
    open: false,
    orderId: null,
    newStatus: "",
  });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
        setFilteredOrders(data);
      } else toast.error(data.message || "Failed to fetch orders");
    } catch {
      toast.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async () => {
    const { orderId, newStatus } = popup;
    setUpdatingId(orderId);

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success(`Order marked as ${newStatus}`);
        applyFilter(statusFilter);
      } else {
        toast.error("Failed to update order status");
      }
    } catch {
      toast.error("Error updating order status");
    } finally {
      setPopup({ open: false, orderId: null, newStatus: "" });
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Instantly remove from both lists
        setOrders((prev) => prev.filter((o) => o._id !== id));
        setFilteredOrders((prev) => prev.filter((o) => o._id !== id));
        toast.info("Order deleted");
      } else {
        toast.error("Failed to delete order");
      }
    } catch {
      toast.error("Error deleting order");
    }
  };

  const applyFilter = (filter) => {
    setStatusFilter(filter);
    if (filter === "all") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((order) => order.status === filter));
  };

  const renderStatusIcon = (status) => {
    if (status === "confirmed")
      return (
        <CheckCircle className={`${styles.statusIcon} ${styles.confirmed}`} />
      );
    else if (status === "shipped")
      return <Truck className={`${styles.statusIcon} ${styles.shipped}`} />;
    else if (status === "delivered")
      return <Package className={`${styles.statusIcon} ${styles.delivered}`} />;
    else if (status === "cancelled")
      return <XCircle className={`${styles.statusIcon} ${styles.cancelled}`} />;
    else return <Clock className={`${styles.statusIcon} ${styles.pending}`} />;
  };

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className={styles.orderManagement}>
      <div className={styles.headerBar}>
        <h1 className={styles.title}>Order Management</h1>

        <div className={styles.filterBar}>
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => applyFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={60} />
          <h2>No Orders Found</h2>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.header}>
                <div>
                  <h3>#{order._id.slice(-8)}</h3>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className={styles.topRightActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteOrder(order._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className={styles.status}>
                  {renderStatusIcon(order.status)}
                  <span
                    className={`${styles.statusText} ${styles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className={styles.userInfo}>
                <User size={18} />
                <p>
                  {order.user?.name || "Unknown"} •{" "}
                  <span>{order.user?.email || "No Email"}</span>
                </p>
              </div>

              <div className={styles.items}>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.item}>
                    <span>{item.name}</span>
                    <span>×{item.quantity}</span>
                    <strong>₹{item.price.toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div className={styles.footer}>
                <p>
                  <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Payment:</strong> {order.paymentMethod}
                </p>
              </div>

              <div className={styles.actions}>
                {order.status !== "cancelled" &&
                  order.status !== "delivered" && (
                    <>
                      {order.status === "pending" && (
                        <button
                          onClick={() =>
                            setPopup({
                              open: true,
                              orderId: order._id,
                              newStatus: "confirmed",
                            })
                          }
                          disabled={updatingId === order._id}
                          className={styles.confirmBtn}
                        >
                          Confirm
                        </button>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() =>
                            setPopup({
                              open: true,
                              orderId: order._id,
                              newStatus: "delivered",
                            })
                          }
                          disabled={updatingId === order._id}
                          className={styles.deliverBtn}
                        >
                          Mark Delivered
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setPopup({
                            open: true,
                            orderId: order._id,
                            newStatus: "cancelled",
                          })
                        }
                        disabled={updatingId === order._id}
                        className={styles.cancelBtn}
                      >
                        Cancel
                      </button>
                    </>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      <StatusPopup
        isOpen={popup.open}
        onClose={() => setPopup({ open: false, orderId: null, newStatus: "" })}
        onConfirm={handleStatusUpdate}
        status={popup.newStatus}
      />
    </div>
  );
};

export default OrderManagement;
