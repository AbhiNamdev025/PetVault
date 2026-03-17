import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./orderManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import StatusPopup from "./Status Popup/statusPopup";
import OrderDetailsModal from "./OrderDetailsModal";
import { GridSkeleton } from "../../Skeletons";
import DeleteConfirmationModal from "../DeleteConfirmationModal/deleteConfirmationModal";
import FilterSidebar from "../../common/FilterSidebar/FilterSidebar";
import OrderHeader from "./components/OrderHeader";
import OrderList from "./components/OrderList";
import { Pagination } from "../../common";

const OrderManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' or 'details'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    period: "all",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [popup, setPopup] = useState({
    open: false,
    orderId: null,
    newStatus: "",
  });
  const [updatingId, setUpdatingId] = useState(null);

  // New Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

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

  // Handle order detail navigation from global search
  useEffect(() => {
    if (location.state?.orderId && orders.length > 0 && !selectedOrder) {
      const order = orders.find((o) => o._id === location.state.orderId);
      if (order) {
        setSelectedOrder(order);
        setView("details");
        // Clear the state after opening
        navigate(location.pathname + location.search, {
          replace: true,
          state: { ...location.state, orderId: null },
        });
      }
    }
  }, [
    location.state,
    orders,
    selectedOrder,
    navigate,
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredOrders = React.useMemo(() => {
    let result = orders;
    if (filters.status !== "all") {
      result = result.filter((o) => o.status === filters.status);
    }
    if (filters.period !== "all") {
      const now = new Date();
      const start = new Date(now);
      switch (filters.period) {
        case "today":
          start.setHours(0, 0, 0, 0);
          break;
        case "week": {
          const day = now.getDay();
          const diff = day === 0 ? 6 : day - 1;
          start.setDate(now.getDate() - diff);
          start.setHours(0, 0, 0, 0);
          break;
        }
        case "month":
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          break;
        default:
          break;
      }
      result = result.filter((o) => new Date(o.createdAt) >= start);
    }
    return result;
  }, [orders, filters]);

  const handleStatusUpdate = async () => {
    const { orderId, newStatus } = popup;
    if (!orderId) return;
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
        toast.success(`Order marked as ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
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

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/orders/${orderToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderToDelete));
        toast.success("Order deleted");
        if (selectedOrder?._id === orderToDelete) {
          setView("list");
          setSelectedOrder(null);
        }
      } else {
        toast.error("Failed to delete order");
      }
    } catch {
      toast.error("Error deleting order");
    } finally {
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setView("details");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedOrder(null);
  };

  const triggerStatusUpdate = (id, status) => {
    setPopup({
      open: true,
      orderId: id,
      newStatus: status,
    });
  };

  const triggerDelete = (id) => {
    setOrderToDelete(id);
    setShowDeleteModal(true);
  };

  if (loading) return <GridSkeleton count={8} />;

  const hasActiveFilters = filters.status !== "all" || filters.period !== "all";

  const filterOptions = [
    {
      id: "status",
      label: "Order Status",
      values: [
        { id: "all", label: "All Orders" },
        { id: "pending", label: "Pending" },
        { id: "confirmed", label: "Confirmed" },
        { id: "delivered", label: "Delivered" },
        { id: "cancelled", label: "Cancelled" },
      ],
    },
    {
      id: "period",
      label: "Time Period",
      values: [
        { id: "all", label: "All Time" },
        { id: "today", label: "Today" },
        { id: "week", label: "This Week" },
        { id: "month", label: "This Month" },
      ],
    },
  ];

  return (
    <div className={styles.orderManagement}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        onReset={() => setFilters({ status: "all", period: "all" })}
        showSearch={false}
      />
      {view === "list" ? (
        <>
          <OrderHeader
            onOpenFilters={() => setShowFilters(true)}
            hasActiveFilters={hasActiveFilters}
          />

          <OrderList
            orders={filteredOrders.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage,
            )}
            onViewDetails={handleViewDetails}
            onDelete={triggerDelete}
            onStatusUpdate={triggerStatusUpdate}
            updatingId={updatingId}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            showPageInfo={true}
            className={styles.pagination}
          />
        </>
      ) : (
        <OrderDetailsModal
          order={selectedOrder}
          onBack={handleBackToList}
          onStatusUpdate={triggerStatusUpdate}
          onDelete={triggerDelete}
        />
      )}

      <StatusPopup
        isOpen={popup.open}
        onClose={() => setPopup({ open: false, orderId: null, newStatus: "" })}
        onConfirm={handleStatusUpdate}
        status={popup.newStatus}
      />

      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDeleteOrder}
          itemType="order"
          itemName={`#${orderToDelete?.slice(-8).toUpperCase()}`}
        />
      )}
    </div>
  );
};

export default OrderManagement;
