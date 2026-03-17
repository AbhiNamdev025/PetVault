import React, { useState, useEffect, useRef } from "react";
import styles from "./shopOrders.module.css";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  User as UserIcon,
  Calendar as CalendarIcon,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL, BASE_URL } from "../../../../../../utils/constants";
import { PROFILE_SEARCH_EVENT } from "../../../../../../utils/profileSearch";
import toast from "react-hot-toast";
import { TableRowSkeleton } from "../../../../../Skeletons";
import FilterSidebar from "../../../../../common/FilterSidebar/FilterSidebar";
import OrderDetails from "../ShopOrderDetails/OrderDetails";
import { Button, Pagination } from "../../../../../common";
import ConfirmationModal from "../../../../../ConfirmationModal/ConfirmationModal";
const ShopOrders = ({ user, setIsDetailsView }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const lastListPageRef = useRef(1);
  const ITEMS_PER_PAGE = 6;
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const shopId = user?._id;
  const toIdString = (value) => {
    if (!value) return "";
    if (typeof value === "object" && value._id) return String(value._id);
    return String(value);
  };
  useEffect(() => {
    let result = orders;
    if (filters.status !== "all") {
      result = result.filter((order) => order.status === filters.status);
    }
    if (filters.search?.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query),
      );
    }
    setFilteredOrders(result);
  }, [orders, filters]);

  useEffect(() => {
    if (setIsDetailsView) {
      setIsDetailsView(showDetails);
    }
  }, [showDetails, setIsDetailsView]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const handleProfileSearch = (event) => {
      const { query = "", targetTab = "" } = event.detail || {};
      if (targetTab && targetTab !== "orders" && targetTab !== "management")
        return;
      if (showDetails) return;

      const normalizedQuery = String(query || "");

      setFilters((previous) => {
        if (previous.search === normalizedQuery) return previous;
        return {
          ...previous,
          search: normalizedQuery,
        };
      });
    };

    window.addEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
    return () =>
      window.removeEventListener(PROFILE_SEARCH_EVENT, handleProfileSearch);
  }, [showDetails]);
  const fetchShopOrders = async () => {
    try {
      if (!shopId) return;
      const res = await fetch(`${API_BASE_URL}/orders/shop/${shopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchShopOrders();
  }, [shopId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchShopOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const updateOrderStatus = async (orderId, newStatus, reason) => {
    setIsStatusUpdating(true);
    try {
      const payload = {
        status: newStatus,
      };
      if (newStatus === "delivered") {
        payload.paymentStatus = "paid";
        payload.paidAt = new Date();
      }
      if (newStatus === "cancelled" && reason) {
        payload.cancellationReason = reason;
      }
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(`Order ${newStatus} successfully`);
      fetchShopOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          status: newStatus,
          cancellationReason: reason || prev.cancellationReason,
        }));
      }
      setShowConfirmModal(false);
    } catch {
      toast.error("Failed to update order");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleStatusUpdateClick = (
    orderId,
    newStatus,
    actionTitle,
    actionMessage,
  ) => {
    const isCancellation = newStatus === "cancelled";
    setConfirmConfig({
      type: isCancellation ? "cancel" : "confirm",
      title: actionTitle,
      message: actionMessage,
      confirmText: actionTitle.split(" ")[0],
      showInput: isCancellation,
      required: isCancellation,
      inputPlaceholder: "Reason for cancellation...",
      onConfirm: (reason) => updateOrderStatus(orderId, newStatus, reason),
    });
    setShowConfirmModal(true);
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
      default:
        return styles.statusPending;
    }
  };
  const getImageUrl = (img) => {
    if (!img) return `${BASE_URL}/uploads/products/default.png`;
    if (img.startsWith("http")) return img;
    return `${BASE_URL}/uploads/products/${img}`;
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
      case "confirmed":
        return <CheckCircle size={14} />;
      case "shipped":
        return <Truck size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      default:
        return <Package size={14} />;
    }
  };
  const calculateTotalItems = (items = []) =>
    items.reduce((t, i) => t + (Number(i.quantity) || 1), 0);
  const calculateItemsTotal = (items = []) =>
    items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0,
    );
  const getShopItems = (items = []) => {
    const currentShopId = toIdString(shopId);
    return items.filter((item) => toIdString(item.shopId) === currentShopId);
  };
  const filterOptions = [
    {
      id: "status",
      label: "Order Status",
      values: [
        {
          id: "all",
          label: "All Status",
        },
        {
          id: "pending",
          label: "Pending",
        },
        {
          id: "confirmed",
          label: "Confirmed",
        },
        {
          id: "shipped",
          label: "Shipped",
        },
        {
          id: "delivered",
          label: "Delivered",
        },
        {
          id: "cancelled",
          label: "Cancelled",
        },
      ],
    },
  ];
  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedOrder(null);
    setCurrentPage(lastListPageRef.current);
  };
  const handleViewOrder = (order, shopItems) => {
    lastListPageRef.current = currentPage;
    setSelectedOrder({
      ...order,
      shopItems,
    });
    setShowDetails(true);
  };
  const hasActiveFilters = filters.search !== "" || filters.status !== "all";
  if (loading)
    return (
      <div className={styles.container}>
        <TableRowSkeleton columns={4} rows={5} />
      </div>
    );
  return (
    <div className={styles.container}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        showSearch={false}
        onReset={() =>
          setFilters({
            search: "",
            status: "all",
          })
        }
      />

      {showDetails && selectedOrder ? (
        <div className={styles.detailsView}>
          <div className={styles.detailsTopBar}>
            <Button
              className={styles.backBtn}
              onClick={handleBackToList}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft size={18} /> Back to Orders
            </Button>

            <div className={styles.detailsActionGroup}>
              {selectedOrder.status === "pending" && (
                <>
                  <Button
                    className={styles.successButton}
                    onClick={() =>
                      handleStatusUpdateClick(
                        selectedOrder._id,
                        "confirmed",
                        "Confirm Order",
                        "Are you sure you want to confirm this order? This will notify the customer.",
                      )
                    }
                    variant="success"
                    size="md"
                  >
                    <CheckCircle size={14} /> Confirm
                  </Button>
                  <Button
                    className={styles.dangerButton}
                    onClick={() =>
                      handleStatusUpdateClick(
                        selectedOrder._id,
                        "cancelled",
                        "Cancel Order",
                        "Are you sure you want to cancel this order? This action cannot be undone.",
                      )
                    }
                    variant="danger"
                    size="md"
                  >
                    <XCircle size={14} /> Cancel
                  </Button>
                </>
              )}

              {selectedOrder.status === "confirmed" && (
                <Button
                  className={styles.primaryButton}
                  onClick={() =>
                    handleStatusUpdateClick(
                      selectedOrder._id,
                      "shipped",
                      "Ship Order",
                      "Has this order been picked up by the courier?",
                    )
                  }
                  variant="primary"
                  size="md"
                >
                  <Truck size={14} /> Mark Shipped
                </Button>
              )}

              {selectedOrder.status === "shipped" && (
                <Button
                  className={styles.successButton}
                  onClick={() =>
                    handleStatusUpdateClick(
                      selectedOrder._id,
                      "delivered",
                      "Deliver Order",
                      "Confirm that this order has been successfully delivered to the customer.",
                    )
                  }
                  variant="success"
                  size="md"
                >
                  <CheckCircle size={14} /> Mark Delivered
                </Button>
              )}
            </div>
          </div>

          <OrderDetails
            order={selectedOrder}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            getImageUrl={getImageUrl}
            calculateTotalItems={calculateTotalItems}
          />
        </div>
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>Shop Orders</h2>
              <p className={styles.subtitle}>
                Track and manage incoming orders with status updates.
              </p>
            </div>
            <div className={styles.headerActions}>
              <Button
                className={styles.filterBtn}
                onClick={() => setShowFilters(true)}
                variant="ghost"
                size="sm"
              >
                <Filter size={16} />
                Filters
                {hasActiveFilters && <span className={styles.filterDot} />}
              </Button>
              {hasActiveFilters && (
                <Button
                  className={styles.clearBtnInline}
                  onClick={() =>
                    setFilters({
                      search: "",
                      status: "all",
                    })
                  }
                  variant="ghost"
                  size="sm"
                >
                  Clear
                </Button>
              )}
              <Button
                className={styles.refreshBtn}
                onClick={handleRefresh}
                title="Refresh Orders"
                variant="ghost"
                size="md"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? styles.spinning : ""}
                />
              </Button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={48} className={styles.emptyIcon} />
              <p>No orders received yet</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <Search size={48} className={styles.emptyIcon} />
              <p>No orders match your filters</p>
            </div>
          ) : (
            <>
              <div className={styles.ordersList}>
                {filteredOrders
                  .slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE,
                  )
                  .map((order) => {
                    const shopItems = getShopItems(order.items);
                    if (shopItems.length === 0) return null;
                    const shopTotal = calculateItemsTotal(shopItems);
                    return (
                      <div
                        key={order._id}
                        className={styles.orderCard}
                        onClick={() => handleViewOrder(order, shopItems)}
                      >
                        <div className={styles.cardMain}>
                          <div className={styles.orderIdentRow}>
                            <div className={styles.orderIdentLeft}>
                              <h4 className={styles.orderId}>
                                Order #{order._id.slice(-8).toUpperCase()}
                              </h4>
                              <div className={styles.orderMeta}>
                                <span className={styles.customerName}>
                                  <UserIcon size={12} /> {order.customerName}
                                </span>
                                <span className={styles.orderDate}>
                                  <CalendarIcon size={12} />
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className={styles.orderIdentRight}>
                              <div className={styles.orderPriceBlock}>
                                <span className={styles.orderTotal}>
                                  ₹{shopTotal.toFixed(2)}
                                </span>
                                <span
                                  className={`${styles.status} ${getStatusColor(order.status)}`}
                                >
                                  {getStatusIcon(order.status)}
                                  {order.status}
                                </span>
                              </div>
                              <ChevronRight
                                size={18}
                                className={styles.cardArrow}
                              />
                            </div>
                          </div>
                        </div>

                        {["pending", "confirmed", "shipped"].includes(
                          order.status,
                        ) && (
                          <div className={styles.orderActions}>
                            {order.status === "pending" && (
                              <>
                                <Button
                                  className={styles.successButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdateClick(
                                      order._id,
                                      "confirmed",
                                      "Confirm Order",
                                      "Are you sure you want to confirm this order?",
                                    );
                                  }}
                                  variant="success"
                                  size="md"
                                >
                                  <CheckCircle size={14} /> Confirm
                                </Button>
                                <Button
                                  className={styles.dangerButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdateClick(
                                      order._id,
                                      "cancelled",
                                      "Cancel Order",
                                      "Please provide a reason for cancelling this order.",
                                    );
                                  }}
                                  variant="danger"
                                  size="md"
                                >
                                  <XCircle size={14} /> Cancel
                                </Button>
                              </>
                            )}

                            {order.status === "confirmed" && (
                              <Button
                                className={styles.primaryButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdateClick(
                                    order._id,
                                    "shipped",
                                    "Ship Order",
                                    "Mark this order as shipped?",
                                  );
                                }}
                                variant="primary"
                                size="md"
                              >
                                <Truck size={14} /> Shipped
                              </Button>
                            )}

                            {order.status === "shipped" && (
                              <Button
                                className={styles.successButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdateClick(
                                    order._id,
                                    "delivered",
                                    "Deliver Order",
                                    "Mark this order as delivered?",
                                  );
                                }}
                                variant="success"
                                size="md"
                              >
                                <CheckCircle size={14} /> Delivered
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              <div className={styles.paginationWrap}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
                  onPageChange={setCurrentPage}
                  showPageInfo
                />
              </div>
            </>
          )}
        </>
      )}
      {showConfirmModal && confirmConfig && (
        <ConfirmationModal
          config={confirmConfig}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setShowConfirmModal(false)}
          isLoading={isStatusUpdating}
        />
      )}
    </div>
  );
};

export default ShopOrders;
