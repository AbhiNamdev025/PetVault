import React, { useEffect, useState } from "react";
import styles from "./order.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import { toast } from "react-toastify";
import { Package, CheckCircle, Clock, XCircle, X } from "lucide-react";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.info("Please login to view your orders");
        return;
      }
      const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
        setFilteredOrders(data);
      } else toast.error(data.message || "Failed to fetch orders");
    } catch {
      toast.error("Something went wrong while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filterStatus === "all") setFilteredOrders(orders);
    else
      setFilteredOrders(
        orders.filter((o) => o.status.toLowerCase() === filterStatus)
      );
  }, [filterStatus, orders]);

  const openCancelPopup = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/orders/${selectedOrder._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "cancelled" }),
        }
      );
      if (res.ok) {
        toast.success("Order cancelled successfully!");
        setOrders((prev) =>
          prev.map((o) =>
            o._id === selectedOrder._id ? { ...o, status: "cancelled" } : o
          )
        );
      } else {
        toast.error("Failed to cancel order");
      }
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setUpdating(false);
      setShowPopup(false);
      setSelectedOrder(null);
    }
  };

  const renderStatusIcon = (status) => {
    if (status === "confirmed")
      return (
        <CheckCircle className={`${styles.statusIcon} ${styles.confirmed}`} />
      );
    if (status === "delivered")
      return <Package className={`${styles.statusIcon} ${styles.delivered}`} />;
    if (status === "cancelled")
      return <XCircle className={`${styles.statusIcon} ${styles.cancelled}`} />;
    return <Clock className={`${styles.statusIcon} ${styles.pending}`} />;
  };

  if (loading)
    return <div className={styles.loading}>Loading your orders...</div>;

  if (orders.length === 0)
    return (
      <div className={styles.emptyState}>
        <Package size={60} />
        <h2>No Orders Yet</h2>
        <p>Looks like you haven’t placed any orders. Start shopping now!</p>
      </div>
    );

  return (
    <div className={styles.ordersPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={styles.ordersList}>
        {filteredOrders.map((order) => (
          <div className={styles.orderCard} key={order._id}>
            <div className={styles.orderHeader}>
              <div>
                <h3>Order ID: #{order._id.slice(-8)}</h3>
                <p>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={styles.statusBox}>
                {renderStatusIcon(order.status)}
                <span className={`${styles.status} ${styles[order.status]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className={styles.items}>
              {order.items.map((item, index) => (
                <div className={styles.item} key={index}>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemQty}>Qty: {item.quantity}</p>
                  </div>
                  <p className={styles.itemPrice}>₹{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
              </div>
              <div className={styles.payment}>
                Payment: <span>{order.paymentMethod}</span>
              </div>
            </div>

            {["pending", "confirmed"].includes(order.status) && (
              <button
                className={styles.cancelBtn}
                onClick={() => openCancelPopup(order)}
              >
                Cancel Order
              </button>
            )}
          </div>
        ))}
      </div>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <button
              className={styles.closeBtn}
              onClick={() => setShowPopup(false)}
            >
              <X size={20} />
            </button>
            <h3>Cancel Order</h3>
            <p>Are you sure you want to cancel this order?</p>
            <div className={styles.popupActions}>
              <button
                className={styles.confirmBtn}
                onClick={handleCancelOrder}
                disabled={updating}
              >
                {updating ? "Cancelling..." : "Yes, Cancel"}
              </button>
              <button
                className={styles.cancelPopupBtn}
                onClick={() => setShowPopup(false)}
              >
                No, Keep It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
