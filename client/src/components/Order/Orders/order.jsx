import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./order.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import { Funnel, Package, ShoppingBag, Sparkles, Truck, X, Filter, Search } from "lucide-react";
import OrderCard from "./components/OrderCard";
import { formatCurrency, formatCompactCurrency } from "./orderUtils";
import FilterSidebar from "../../common/FilterSidebar/FilterSidebar";
import { Button } from "../../common";
const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.info("Please login to view your orders");
        setOrders([]);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch {
      toast.error("Something went wrong while fetching orders");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filters.status !== "all") {
      result = result.filter(o => o.status?.toLowerCase() === filters.status);
    }
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(o => o._id.toLowerCase().includes(query) || o.items?.some(item => item.name?.toLowerCase().includes(query)) || o.invoiceNumber?.toLowerCase().includes(query));
    }
    return result;
  }, [filters, orders]);
  const orderStats = useMemo(() => {
    const totalSpend = orders.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);
    const activeCount = orders.filter(order => ["pending", "confirmed", "shipped"].includes(order.status)).length;
    const deliveredCount = orders.filter(order => order.status === "delivered").length;
    return {
      total: orders.length,
      activeCount,
      deliveredCount,
      totalSpend
    };
  }, [orders]);
  const statusOptions = [{
    id: "status",
    label: "Order Status",
    values: [{
      id: "all",
      label: "All Orders"
    }, {
      id: "pending",
      label: "Pending"
    }, {
      id: "confirmed",
      label: "Confirmed"
    }, {
      id: "shipped",
      label: "Shipped"
    }, {
      id: "delivered",
      label: "Delivered"
    }, {
      id: "cancelled",
      label: "Cancelled"
    }]
  }];
  const openCancelPopup = order => {
    setSelectedOrder(order);
    setShowPopup(true);
  };
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/orders/${selectedOrder._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "cancelled"
        })
      });
      if (res.ok) {
        toast.success("Order cancelled successfully!");
        setOrders(prev => prev.map(o => o._id === selectedOrder._id ? {
          ...o,
          status: "cancelled"
        } : o));
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
  const handleViewDetails = order => {
    navigate(`/my-orders/${order._id}`, {
      state: {
        order
      }
    });
  };
  const hasActiveFilters = filters.search !== "" || filters.status !== "all";
  if (loading) {
    return <div className={styles.loading}>Loading your orders...</div>;
  }
  if (orders.length === 0) {
    return <div className={styles.emptyState}>
        <Package size={56} />
        <h2>No Orders Yet</h2>
        <p>Looks like you have not placed an order yet.</p>
        <Button className={styles.primaryBtn} onClick={() => navigate("/pet-products")} variant="primary" size="md">
          Browse Products
        </Button>
      </div>;
  }
  return <div className={styles.ordersPage}>
      <FilterSidebar isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} setFilters={setFilters} options={statusOptions} onReset={() => setFilters({
      search: "",
      status: "all"
    })} />

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>
            Track every purchase, delivery status, and payment update in one
            place.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Button className={styles.filterBtn} onClick={() => setShowFilters(true)} variant="ghost" size="sm">
            <Filter size={16} />
            Filters
            {hasActiveFilters && <span className={styles.filterDot} />}
          </Button>
        </div>
      </section>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <ShoppingBag size={18} />
          </div>
          <div>
            <p className={styles.statLabel}>Total Orders</p>
            <p className={styles.statValue}>{orderStats.total}</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <Truck size={18} />
          </div>
          <div>
            <p className={styles.statLabel}>Active Deliveries</p>
            <p className={styles.statValue}>{orderStats.activeCount}</p>
          </div>
        </article>

        <article className={styles.statCard}>
          <div className={styles.statIcon}>
            <Sparkles size={18} />
          </div>
          <div>
            <p className={styles.statLabel}>Delivered</p>
            <p className={styles.statValue}>{orderStats.deliveredCount}</p>
          </div>
        </article>

        <article className={styles.statCard} title={`Total Exact Spend: ${formatCurrency(orderStats.totalSpend)}`}>
          <div className={styles.statIcon}>
            <Package size={18} />
          </div>
          <div>
            <p className={styles.statLabel}>Total Spend</p>
            <p className={styles.statValue}>
              {formatCompactCurrency(orderStats.totalSpend)}
            </p>
          </div>
        </article>
      </section>

      {filteredOrders.length === 0 ? <section className={styles.noMatch}>
          <Package size={42} />
          <h3>No matching orders</h3>
          <p>Try another status filter to view your complete history.</p>
          <Button className={styles.resetBtn} onClick={() => setFilters({
        search: "",
        status: "all"
      })} variant="ghost" size="md">
            Show All Orders
          </Button>
        </section> : <section className={styles.ordersList}>
          {filteredOrders.map(order => <OrderCard key={order._id} order={order} onCancel={openCancelPopup} onViewDetails={handleViewDetails} />)}
        </section>}

      {showPopup && <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <Button className={styles.closeBtn} onClick={() => setShowPopup(false)} aria-label="Close cancel popup" variant="ghost" size="sm">
              <X size={18} />
            </Button>

            <h3>Cancel this order?</h3>
            <p>
              This will mark order{" "}
              <strong>
                {selectedOrder?.invoiceNumber || `#${selectedOrder?._id?.slice(-8)?.toUpperCase()}`}
              </strong>{" "}
              as cancelled.
            </p>

            <div className={styles.popupActions}>
              <Button className={styles.confirmBtn} onClick={handleCancelOrder} disabled={updating} variant="primary" size="md">
                {updating ? "Cancelling..." : "Yes, Cancel Order"}
              </Button>
              <Button className={styles.cancelPopupBtn} onClick={() => setShowPopup(false)} variant="ghost" size="md">
                Keep Order
              </Button>
            </div>
          </div>
        </div>}
    </div>;
};
export default Order;
