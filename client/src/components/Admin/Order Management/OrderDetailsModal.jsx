import React, { useState, useCallback } from "react";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  CheckCircle2,
  Clock4,
  XCircle,
  Hash,
  Phone,
  Receipt,
  ArrowLeft,
  Trash2,
  ShieldCheck,
  FileText,
  Copy,
  CheckCheck,
  Coins,
  Wallet as WalletIcon,
  RotateCcw,
} from "lucide-react";
import styles from "./orderDetailsModal.module.css";
import { Button } from "../../common";

const OrderDetailsModal = ({ order, onBack, onStatusUpdate, onDelete }) => {
  /* ── Hooks always before any early return ── */
  const [copied, setCopied] = useState(null);
  const copyToClipboard = useCallback((text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  if (!order) return null;

  /* helpers */
  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const getStatusBadge = (status) => {
    const icons = {
      confirmed: <CheckCircle2 size={16} />,
      pending: <Clock4 size={16} />,
      delivered: <CheckCircle2 size={16} />,
      cancelled: <XCircle size={16} />,
      shipped: <Truck size={16} />,
    };
    return (
      <span className={`${styles.statusBadge} ${styles[status]}`}>
        {icons[status] || <Package size={16} />}
        {status}
      </span>
    );
  };

  /* reusable row — renders nothing when value is falsy */
  const AuditRow = ({ icon, label, value, copyKey, mono = false }) => {
    if (!value) return null;
    return (
      <div className={styles.auditRow}>
        <span className={styles.auditIcon}>{icon}</span>
        <span className={styles.auditLabel}>{label}</span>
        <span
          className={`${styles.auditValue} ${mono ? styles.monoValue : ""}`}
        >
          {value}
          {copyKey && (
            <Button
              variant="ghost"
              size="sm"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(value, copyKey)}
              aria-label="Copy"
            >
              {copied === copyKey ? (
                <CheckCheck size={10} />
              ) : (
                <Copy size={10} />
              )}
            </Button>
          )}
        </span>
      </div>
    );
  };

  /* derived payment values */
  const originalAmount = order.originalAmount || order.totalAmount || 0;
  const baseAmount = Math.max(0, originalAmount - (order.platformFee || 0));
  const coinsValue = Number(order.coinsValue) || 0;
  const walletUsed = Number(order.walletUsedAmount) || 0;
  const totalPayable =
    order.totalAmount || Math.max(0, originalAmount - coinsValue);

  const hasGatewayIds =
    order.paymentInfo?.razorpay_payment_id ||
    order.paymentInfo?.razorpay_order_id ||
    order.paymentInfo?.utrNumber ||
    order.paymentInfo?.razorpay_signature;

  const hasCoinsOrWallet =
    Number(order.coinsUsed) > 0 ||
    walletUsed > 0 ||
    Number(order.coinsRefunded) > 0 ||
    Number(order.walletUsageRefundedAmount) > 0 ||
    Number(order.onlineRefundedToWalletAmount) > 0;

  return (
    <div className={styles.sectionContainer}>
      {/* ── Top bar ── */}
      <div className={styles.sectionHeader}>
        <Button
          className={styles.backBtn}
          onClick={onBack}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft size={18} />
          <span>Back to Overview</span>
        </Button>
        <div className={styles.headerActions}>
          {order.status === "pending" && (
            <Button
              className={styles.confirmBtn}
              onClick={() => onStatusUpdate(order._id, "confirmed")}
              variant="primary"
              size="sm"
            >
              Confirm Order
            </Button>
          )}
          {order.status === "confirmed" && (
            <Button
              className={styles.deliverBtn}
              onClick={() => onStatusUpdate(order._id, "delivered")}
              variant="danger"
              size="sm"
            >
              Mark Delivered
            </Button>
          )}
          <Button
            className={styles.deleteBtn}
            onClick={() => onDelete(order._id)}
            variant="danger"
            size="sm"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── Banner ── */}
        <div className={styles.banner}>
          <div className={styles.bannerIcon}>
            <Package size={24} />
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.topRow}>
              <h2 className={styles.orderId}>#{order._id.toUpperCase()}</h2>
              {getStatusBadge(order.status)}
            </div>
            <div className={styles.metaRow}>
              <Calendar size={16} />
              <span>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </span>
              {order.invoiceNumber && (
                <>
                  <span className={styles.dot}>•</span>
                  <Receipt size={16} />
                  <span>{order.invoiceNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Cancellation reason ── */}
        {order.status === "cancelled" && order.cancellationReason && (
          <div className={`${styles.glassCard} ${styles.cancelCard}`}>
            <h3 className={`${styles.cardTitle} ${styles.cancelTitle}`}>
              Cancellation Reason
            </h3>
            <p className={`${styles.value} ${styles.cancelValue}`}>
              {order.cancellationReason}
            </p>
          </div>
        )}

        <div className={styles.mainGrid}>
          {/* ── Customer ── */}
          <div className={styles.glassCard}>
            <h3 className={styles.cardTitle}>Customer Credentials</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <User size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Full Name</p>
                  <p className={styles.value}>{order.customerName}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Phone size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Contact</p>
                  <p className={styles.value}>{order.mobileNumber}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <MapPin size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Shipping Address</p>
                  <p className={styles.value}>
                    {order.shippingAddress?.street},{" "}
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} –{" "}
                    {order.shippingAddress?.zipCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Items & Totals ── */}
          <div className={styles.glassCard}>
            <h3 className={styles.cardTitle}>Order Composition</h3>
            <div className={styles.itemsList}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <div className={styles.itemMain}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>×{item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <span>₹{baseAmount.toFixed(2)}</span>
            </div>
            <div className={styles.feeRow}>
              <span>Platform Fee</span>
              <span>₹{(order.platformFee || 0).toFixed(2)}</span>
            </div>
            {coinsValue > 0 && (
              <div className={styles.discountRow}>
                <span>Coins Discount</span>
                <span>-₹{coinsValue.toFixed(2)}</span>
              </div>
            )}
            {walletUsed > 0 && (
              <div className={styles.discountRow}>
                <span>Wallet Discount</span>
                <span>-₹{walletUsed.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>Grand Total</span>
              <span className={styles.totalValue}>
                ₹{totalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Payment Details — full audit trail ── */}
          <div className={`${styles.glassCard} ${styles.fullWidthCard}`}>
            <h3 className={styles.cardTitle}>Payment Details</h3>

            {/* Method + status chip */}
            <div className={styles.paymentFlex}>
              <div className={styles.paymentMethod}>
                <CreditCard size={18} />
                <span>{order.paymentMethod || "COD"}</span>
                <span
                  className={`${styles.paymentStatus} ${styles[order.paymentStatus]}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.paidAt && (
                <div className={styles.paidOnChip}>
                  <Calendar size={11} />
                  <span>Paid {fmtDate(order.paidAt)}</span>
                </div>
              )}
            </div>

            {/* Invoice */}
            <AuditRow
              icon={<FileText size={16} />}
              label="Invoice No."
              value={order.invoiceNumber}
              copyKey="invoice"
              mono
            />

            {/* Gateway & Audit IDs section */}
            {hasGatewayIds && (
              <p className={styles.auditSectionLabel}>
                <ShieldCheck size={10} /> Gateway &amp; Audit IDs
              </p>
            )}
            <AuditRow
              icon={<Hash size={16} />}
              label="Razorpay Payment ID"
              value={order.paymentInfo?.razorpay_payment_id}
              copyKey="pay_id"
              mono
            />
            <AuditRow
              icon={<Hash size={16} />}
              label="Razorpay Order ID"
              value={order.paymentInfo?.razorpay_order_id}
              copyKey="rp_order"
              mono
            />
            <AuditRow
              icon={<Hash size={16} />}
              label="UTR Number"
              value={order.paymentInfo?.utrNumber}
              copyKey="utr"
              mono
            />
            {order.paymentInfo?.razorpay_signature && (
              <div className={styles.auditRow}>
                <span className={styles.auditIcon}>
                  <ShieldCheck size={16} />
                </span>
                <span className={styles.auditLabel}>Signature Verified</span>
                <span className={`${styles.auditValue} ${styles.verifiedTag}`}>
                  ✓ Yes
                </span>
              </div>
            )}

            {/* Coins & Wallet section */}
            {hasCoinsOrWallet && (
              <p className={styles.auditSectionLabel}>
                <Coins size={10} /> Coins &amp; Wallet
              </p>
            )}
            <AuditRow
              icon={<Coins size={16} />}
              label="Coins Used"
              value={
                Number(order.coinsUsed) > 0
                  ? `${order.coinsUsed} coins${coinsValue > 0 ? ` (₹${coinsValue.toFixed(2)})` : ""}`
                  : null
              }
            />
            <AuditRow
              icon={<RotateCcw size={16} />}
              label="Coins Refunded"
              value={
                Number(order.coinsRefunded) > 0
                  ? `${order.coinsRefunded} coins${Number(order.coinsRefundedValue) > 0 ? ` (₹${Number(order.coinsRefundedValue).toFixed(2)})` : ""}`
                  : null
              }
            />
            <AuditRow
              icon={<Calendar size={16} />}
              label="Coins Refunded At"
              value={
                Number(order.coinsRefunded) > 0
                  ? fmtDate(order.coinsRefundedAt)
                  : null
              }
            />
            <AuditRow
              icon={<WalletIcon size={16} />}
              label="Wallet Used"
              value={walletUsed > 0 ? `₹${walletUsed.toFixed(2)}` : null}
            />
            <AuditRow
              icon={<RotateCcw size={16} />}
              label="Wallet Restored"
              value={
                Number(order.walletUsageRefundedAmount) > 0
                  ? `₹${Number(order.walletUsageRefundedAmount).toFixed(2)}`
                  : null
              }
            />
            <AuditRow
              icon={<Calendar size={16} />}
              label="Wallet Restored At"
              value={
                Number(order.walletUsageRefundedAmount) > 0
                  ? fmtDate(order.walletUsageRefundedAt)
                  : null
              }
            />
            <AuditRow
              icon={<RotateCcw size={16} />}
              label="Refunded to Wallet"
              value={
                Number(order.onlineRefundedToWalletAmount) > 0
                  ? `₹${Number(order.onlineRefundedToWalletAmount).toFixed(2)}`
                  : null
              }
            />
            <AuditRow
              icon={<Calendar size={16} />}
              label="Online Refund At"
              value={
                Number(order.onlineRefundedToWalletAmount) > 0
                  ? fmtDate(order.onlineRefundedToWalletAt)
                  : null
              }
            />
            <AuditRow
              icon={<CreditCard size={16} />}
              label="Platform Fee"
              value={
                Number(order.platformFee) > 0
                  ? `₹${Number(order.platformFee).toFixed(2)}`
                  : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
