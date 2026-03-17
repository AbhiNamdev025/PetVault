import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Ban,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  User,
  Wallet as WalletIcon,
} from "lucide-react";
import styles from "./orderDetails.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import { redirectToAuthHome } from "../../../utils/authModalNavigation";
import OrderStatusBadge from "../Orders/components/OrderStatusBadge";
import {
  ORDER_STATUS_STEPS,
  calculateOrderBreakdown,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTitle,
  resolveOrderItemImage,
} from "../Orders/orderUtils";
import { Button } from "../../common";
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [updating, setUpdating] = useState(false);
  const fetchOrder = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        redirectToAuthHome(navigate, "login", `/my-orders/${id}`);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Unable to load order details");
        navigate("/my-orders");
        return;
      }
      setOrder(data);
    } catch {
      toast.error("Something went wrong while loading order details");
      navigate("/my-orders");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);
  const handleCancelOrder = async () => {
    if (!order || !["pending"].includes(order.status)) return;
    try {
      setUpdating(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/orders/${order._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to cancel order");
        return;
      }
      setOrder((prev) => ({
        ...prev,
        status: "cancelled",
      }));
      toast.success("Order cancelled successfully");
    } catch {
      toast.error("Unable to cancel this order right now");
    } finally {
      setUpdating(false);
    }
  };
  const timelineStepState = useMemo(() => {
    const status = order?.status || "pending";
    const currentIndex = ORDER_STATUS_STEPS.indexOf(status);
    const isCancelled = status === "cancelled";
    return ORDER_STATUS_STEPS.map((step, idx) => {
      if (isCancelled) {
        return {
          step,
          done: false,
          active: false,
        };
      }
      return {
        step,
        done: idx < currentIndex,
        active: idx === currentIndex,
      };
    });
  }, [order?.status]);
  if (loading) {
    return <div className={styles.loading}>Loading order details...</div>;
  }
  if (!order) {
    return (
      <div className={styles.empty}>
        <h2>Order not found</h2>
        <Button
          className={styles.backPrimary}
          onClick={() => navigate("/my-orders")}
          variant="ghost"
          size="sm"
        >
          Back to My Orders
        </Button>
      </div>
    );
  }
  const { subtotal, platformFee, coinsValue, walletUsedAmount, total } =
    calculateOrderBreakdown(order);
  const canCancel = ["pending"].includes(order.status);
  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <Button
          className={styles.backBtn}
          onClick={() => navigate("/my-orders")}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Button>

        <header className={styles.heroCard}>
          <div>
            <p className={styles.invoice}>
              {order.invoiceNumber ||
                `Order #${order._id.slice(-8).toUpperCase()}`}
            </p>
            <h1 className={styles.title}>Order Details</h1>
            <p className={styles.meta}>
              Placed on {formatDateTime(order.createdAt)} • Updated{" "}
              {formatDate(order.updatedAt)}
            </p>
          </div>

          <div className={styles.heroStatus}>
            <OrderStatusBadge status={order.status} />
          </div>
        </header>

        <section className={styles.timelineCard}>
          <h3>Order Progress</h3>
          {order.status === "cancelled" ? (
            <div className={styles.cancelNotice}>
              <div className={styles.cancelHeader}>
                <Ban size={16} />
                <span>This order has been cancelled.</span>
              </div>
              {order.cancellationReason && (
                <p className={styles.cancelReason}>
                  Reason: {order.cancellationReason}
                </p>
              )}
            </div>
          ) : (
            <div className={styles.timeline}>
              {timelineStepState.map((node, idx) => (
                <div className={styles.stepWrap} key={node.step}>
                  <div
                    className={`${styles.stepDot} ${node.done ? styles.dotDone : node.active ? styles.dotActive : ""}`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`${styles.stepLabel} ${node.done || node.active ? styles.stepLabelActive : ""}`}
                  >
                    {formatTitle(node.step)}
                  </span>
                  {idx < timelineStepState.length - 1 && (
                    <div
                      className={`${styles.stepLine} ${node.done ? styles.stepLineDone : ""}`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Package size={16} />
              Items ({order.items.length})
            </h3>
            <div className={styles.itemsList}>
              {order.items.map((item, index) => (
                <article
                  key={`${item._id || index}-${index}`}
                  className={styles.itemRow}
                >
                  <img
                    src={resolveOrderItemImage(item)}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemContent}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemSub}>
                      Qty {item.quantity} • {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className={styles.itemAmount}>
                    {formatCurrency(
                      Number(item.price || 0) * Number(item.quantity || 1),
                    )}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <div className={styles.stack}>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>
                <ReceiptText size={16} />
                Payment Summary
              </h3>
              <div className={styles.row}>
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className={styles.row}>
                <span>Platform Fee</span>
                <strong>{formatCurrency(platformFee)}</strong>
              </div>
              {coinsValue > 0 && (
                <div className={styles.row}>
                  <span>Coins Discount</span>
                  <strong className={styles.discount}>
                    -{formatCurrency(coinsValue)}
                  </strong>
                </div>
              )}
              {walletUsedAmount > 0 && (
                <div className={styles.row}>
                  <span>Wallet Used</span>
                  <strong className={styles.discount}>
                    -{formatCurrency(walletUsedAmount)}
                  </strong>
                </div>
              )}
              <div className={`${styles.row} ${styles.totalRow}`}>
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div className={styles.row}>
                <span>Payment Method</span>
                <strong>{order.paymentMethod}</strong>
              </div>
            </section>

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>
                <User size={16} />
                Customer & Shipping
              </h3>
              <div className={styles.infoRow}>
                <User size={14} />
                <span>{order.customerName}</span>
              </div>
              <div className={styles.infoRow}>
                <Phone size={14} />
                <span>{order.mobileNumber}</span>
              </div>
              <div className={styles.infoRow}>
                <MapPin size={14} />
                <span>
                  {[
                    order.shippingAddress?.street,
                    order.shippingAddress?.city,
                    order.shippingAddress?.state,
                    order.shippingAddress?.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              <div className={styles.infoRow}>
                <CreditCard size={14} />
                <span>
                  Payment status:{" "}
                  <strong>
                    {formatTitle(order.paymentStatus || "pending")}
                  </strong>
                </span>
              </div>
              {order.paidAt && (
                <div className={styles.infoRow}>
                  <CircleDollarSign size={14} />
                  <span>Paid on {formatDateTime(order.paidAt)}</span>
                </div>
              )}
              {Number(order.onlineRefundedToWalletAmount || 0) > 0 && (
                <div className={styles.infoRow}>
                  <WalletIcon size={14} />
                  <span>
                    Refunded to wallet:{" "}
                    {formatCurrency(order.onlineRefundedToWalletAmount)}
                  </span>
                </div>
              )}
            </section>

            <section className={styles.card}>
              <div className={styles.actionRow}>
                {canCancel ? (
                  <Button
                    className={styles.cancelBtn}
                    onClick={handleCancelOrder}
                    disabled={updating}
                    variant="ghost"
                    size="md"
                  >
                    {updating ? "Cancelling..." : "Cancel Order"}
                  </Button>
                ) : (
                  <p className={styles.actionInfo}>
                    This order can no longer be cancelled.
                  </p>
                )}

                <Button
                  className={styles.secondaryBtn}
                  onClick={() => navigate("/pet-products")}
                  variant="secondary"
                  size="md"
                >
                  Continue Shopping
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OrderDetails;
