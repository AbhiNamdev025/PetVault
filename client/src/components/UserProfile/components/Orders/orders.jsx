import React, { useState } from "react";
import styles from "./orders.module.css";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  MessageCircle,
} from "lucide-react";

const Orders = ({ list, onUpdateStatus }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return styles.statusCompleted;
      case "shipped":
        return styles.statusConfirmed;
      case "processing":
        return styles.statusPending;
      case "cancelled":
        return styles.statusCancelled;
      case "pending":
        return styles.statusPending;
      default:
        return styles.statusPending;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "processing":
        return <RefreshCw size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (onUpdateStatus) {
      await onUpdateStatus(orderId, newStatus);
    }
  };

  const calculateTotalItems = (items) => {
    return items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.sectionTitle}>My Orders</h3>

      {list.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <p>No orders placed yet</p>
          <button
            className={styles.primaryButton}
            onClick={() => (window.location.href = "/products")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {list.map((order) => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h4 className={styles.orderId}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h4>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </span>
                    <span className={styles.itemCount}>
                      {calculateTotalItems(order.items)} items
                    </span>
                  </div>
                </div>
                <div className={styles.orderStatus}>
                  <span
                    className={`${styles.status} ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  <span className={styles.orderTotal}>
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items?.slice(0, 3).map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <img
                      src={item.image || "/api/placeholder/40/40"}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemPrice}>
                        ₹{item.price} x {item.quantity || 1}
                      </span>
                    </div>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className={styles.moreItems}>
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>

              <div className={styles.orderActions}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetails(true);
                  }}
                >
                  <Eye size={16} />
                  View Details
                </button>

                {order.status === "delivered" && (
                  <button
                    className={styles.primaryButton}
                    onClick={() =>
                      (window.location.href = `/orders/${order._id}/review`)
                    }
                  >
                    <MessageCircle size={16} />
                    Add Review
                  </button>
                )}

                {(order.status === "pending" ||
                  order.status === "processing") && (
                  <button
                    className={styles.dangerButton}
                    onClick={() => handleStatusUpdate(order._id, "cancelled")}
                  >
                    <XCircle size={16} />
                    Cancel Order
                  </button>
                )}

                {order.status === "shipped" && (
                  <button
                    className={styles.successButton}
                    onClick={() => handleStatusUpdate(order._id, "delivered")}
                  >
                    <CheckCircle size={16} />
                    Mark Received
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetails && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                Order Details #{selectedOrder._id.slice(-8).toUpperCase()}
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowDetails(false)}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h4>Order Summary</h4>
                <div className={styles.orderSummary}>
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span
                      className={`${styles.status} ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p>
                    <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
                  </p>
                  {selectedOrder.paymentMethod && (
                    <p>
                      <strong>Payment Method:</strong>{" "}
                      {selectedOrder.paymentMethod}
                    </p>
                  )}
                  {selectedOrder.paymentStatus && (
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      {selectedOrder.paymentStatus}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Items ({calculateTotalItems(selectedOrder.items)})</h4>
                <div className={styles.itemsList}>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className={styles.detailItem}>
                      <img
                        src={item.image || "/api/placeholder/50/50"}
                        alt={item.name}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.name}</span>
                        {item.brand && (
                          <span className={styles.itemBrand}>{item.brand}</span>
                        )}
                        <span className={styles.itemQuantity}>
                          Qty: {item.quantity || 1}
                        </span>
                      </div>
                      <div className={styles.itemTotal}>
                        ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div className={styles.detailSection}>
                  <h4>Shipping Address</h4>
                  <div className={styles.address}>
                    <p>{selectedOrder.shippingAddress.line1}</p>
                    {selectedOrder.shippingAddress.line2 && (
                      <p>{selectedOrder.shippingAddress.line2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state} -{" "}
                      {selectedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              {(selectedOrder.status === "pending" ||
                selectedOrder.status === "processing") && (
                <button
                  className={styles.dangerButton}
                  onClick={() => {
                    handleStatusUpdate(selectedOrder._id, "cancelled");
                    setShowDetails(false);
                  }}
                >
                  Cancel Order
                </button>
              )}
              {selectedOrder.status === "delivered" && (
                <button
                  className={styles.primaryButton}
                  onClick={() =>
                    (window.location.href = `/orders/${selectedOrder._id}/review`)
                  }
                >
                  Write Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
