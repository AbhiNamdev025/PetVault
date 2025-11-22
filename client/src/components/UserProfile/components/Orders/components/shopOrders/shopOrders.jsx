import React, { useState, useEffect } from "react";
import styles from "./shopOrders.module.css";
import { Package, Truck, CheckCircle, XCircle, Eye } from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../../../utils/constants";
import toast from "react-hot-toast";
const ShopOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const shopId = user?._id;

  const fetchShopOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) fetchShopOrders();
  }, [shopId]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();

      toast.success("Order status updated");
      fetchShopOrders();
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return styles.statusCompleted;
      case "confirmed":
        return styles.statusConfirmed;
      case "shipped":
        return styles.statusShipped;
      case "cancelled":
        return styles.statusCancelled;
      case "pending":
        return styles.statusPending;
      default:
        return styles.statusPending;
    }
  };

  const getImageUrl = (img) => {
    if (!img) return `${BASE_URL}/uploads/products/default.png`;

    if (img.startsWith("http://") || img.startsWith("https://")) {
      return img;
    }

    return `${BASE_URL}/uploads/products/${img}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} />;
      case "confirmed":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const calculateTotalItems = (items) => {
    return items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  };

  const getShopItems = (items) => {
    return items.filter((item) => item.shopId === shopId);
  };

  if (loading) return <div className={styles.loading}>Loading orders...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shop Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <p>No orders received yet</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => {
            const shopItems = getShopItems(order.items);
            if (shopItems.length === 0) return null;

            return (
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
                        {calculateTotalItems(shopItems)} items
                      </span>
                      <span className={styles.customerName}>
                        Customer: {order.customerName}
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
                      ₹
                      {shopItems.reduce(
                        (sum, item) => sum + item.price * (item.quantity || 1),
                        0
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {shopItems.slice(0, 3).map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <img
                        src={getImageUrl(item.image)}
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
                  {shopItems.length > 3 && (
                    <div className={styles.moreItems}>
                      +{shopItems.length - 3} more items
                    </div>
                  )}
                </div>

                <div className={styles.orderActions}>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      setSelectedOrder({ ...order, shopItems });
                      setShowDetails(true);
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  {order.status === "pending" && (
                    <>
                      <button
                        className={styles.successButton}
                        onClick={() =>
                          updateOrderStatus(order._id, "confirmed")
                        }
                      >
                        <CheckCircle size={16} />
                        Confirm
                      </button>
                      <button
                        className={styles.dangerButton}
                        onClick={() =>
                          updateOrderStatus(order._id, "cancelled")
                        }
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </>
                  )}

                  {order.status === "confirmed" && (
                    <button
                      className={styles.primaryButton}
                      onClick={() => updateOrderStatus(order._id, "shipped")}
                    >
                      <Truck size={16} />
                      Mark Shipped
                    </button>
                  )}

                  {order.status === "shipped" && (
                    <button
                      className={styles.successButton}
                      onClick={() => updateOrderStatus(order._id, "delivered")}
                    >
                      <CheckCircle size={16} />
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
                <h4>Customer Information</h4>
                <div className={styles.orderSummary}>
                  <p>
                    <strong>Name:</strong> {selectedOrder.customerName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedOrder.mobileNumber}
                  </p>
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
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>
                  Order Items ({calculateTotalItems(selectedOrder.shopItems)})
                </h4>
                <div className={styles.itemsList}>
                  {selectedOrder.shopItems?.map((item, index) => (
                    <div key={index} className={styles.detailItem}>
                      <img
                        src={getImageUrl(item.image)}
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
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state} -{" "}
                      {selectedOrder.shippingAddress.zipCode}
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
              {selectedOrder.status === "pending" && (
                <>
                  <button
                    className={styles.successButton}
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, "confirmed");
                      setShowDetails(false);
                    }}
                  >
                    Confirm Order
                  </button>
                  <button
                    className={styles.dangerButton}
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, "cancelled");
                      setShowDetails(false);
                    }}
                  >
                    Cancel Order
                  </button>
                </>
              )}
              {selectedOrder.status === "confirmed" && (
                <button
                  className={styles.primaryButton}
                  onClick={() => {
                    updateOrderStatus(selectedOrder._id, "shipped");
                    setShowDetails(false);
                  }}
                >
                  Mark as Shipped
                </button>
              )}
              {selectedOrder.status === "shipped" && (
                <button
                  className={styles.successButton}
                  onClick={() => {
                    updateOrderStatus(selectedOrder._id, "delivered");
                    setShowDetails(false);
                  }}
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopOrders;
