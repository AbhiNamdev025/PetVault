import React from "react";
import {
  Package,
  User as UserIcon,
  MapPin,
  CreditCard,
  ChevronRight,
  ClipboardList,
  XCircle,
  Calendar,
  Coins,
  Wallet as WalletIcon,
  RotateCcw,
  FileText,
  Hash,
  Download,
} from "lucide-react";
import { Button } from "../../../../../common";
import styles from "../shopOrders/shopOrders.module.css";

const OrderDetails = ({
  order,
  getStatusColor,
  getStatusIcon,
  getImageUrl,
  calculateTotalItems,
}) => {
  if (!order) return null;

  const shopSubtotal = order.shopItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );
  const paymentStatus = (order.paymentStatus || "unpaid").toLowerCase();
  const titleCase = (value = "") =>
    value.charAt(0).toUpperCase() + value.slice(1);

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

  /* Simple label-value row — skips render if value is falsy */
  const InfoRow = ({ icon, label, value, highlight }) => {
    if (!value) return null;
    return (
      <div className={styles.paymentDetailRow}>
        <span className={styles.paymentDetailIcon}>{icon}</span>
        <span className={styles.paymentDetailLabel}>{label}</span>
        <span
          className={`${styles.paymentDetailValue} ${highlight ? styles.refundValue : ""}`}
        >
          {value}
        </span>
      </div>
    );
  };

  /* Client-side invoice download as a printable HTML blob */
  const downloadInvoice = () => {
    const lines = order.shopItems
      .map(
        (item) =>
          `<tr>
            <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0">${item.name}${item.brand ? ` <span style="color:#999;font-size:11px">(${item.brand})</span>` : ""}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity || 1}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${Number(item.price).toFixed(2)}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</td>
          </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice ${order.invoiceNumber || order._id}</title>
  <style>
    body{font-family:Arial,sans-serif;color:#222;margin:40px;font-size:13px}
    h1{margin:0;font-size:22px;color:#111}
    .meta{color:#666;font-size:12px;margin-top:4px}
    .section{margin-top:24px}
    .section h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#999;margin:0 0 8px}
    table{width:100%;border-collapse:collapse}
    th{background:#f8f8f8;padding:6px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#888}
    th:last-child,th:nth-child(3),th:nth-child(4){text-align:right}
    .total-row td{padding:10px 8px;font-weight:700;font-size:14px;border-top:2px solid #111}
    .total-row td:last-child{color:#4f46e5}
    .footer{margin-top:32px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:12px}
  </style>
</head>
<body>
  <h1>Tax Invoice</h1>
  <p class="meta">
    ${order.invoiceNumber ? `<strong>${order.invoiceNumber}</strong> &nbsp;|&nbsp; ` : ""}
    Dated: ${new Date(order.paidAt || order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
    ${order.paymentInfo?.utrNumber ? `&nbsp;|&nbsp; UTR: <strong>${order.paymentInfo.utrNumber}</strong>` : ""}
  </p>

  <div style="display:flex;gap:40px;margin-top:24px">
    <div class="section" style="flex:1">
      <h2>Bill To</h2>
      <p style="margin:0;font-weight:600">${order.customerName}</p>
      <p style="margin:2px 0;color:#555">+91 ${order.mobileNumber}</p>
      ${order.shippingAddress ? `<p style="margin:2px 0;color:#555">${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>` : ""}
    </div>
    <div class="section">
      <h2>Payment</h2>
      <p style="margin:0">Method: <strong>${order.paymentMethod || "COD"}</strong></p>
      <p style="margin:2px 0">Status: <strong>${order.paymentStatus || ""}</strong></p>
    </div>
  </div>

  <div class="section" style="margin-top:28px">
    <h2>Items</h2>
    <table>
      <thead><tr>
        <th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th>
      </tr></thead>
      <tbody>${lines}</tbody>
      <tfoot>
        ${Number(order.coinsValue) > 0 ? `<tr><td colspan="3" style="padding:4px 8px;text-align:right;color:#666">Coins Discount</td><td style="padding:4px 8px;text-align:right;color:#16a34a">-₹${Number(order.coinsValue).toFixed(2)}</td></tr>` : ""}
        ${Number(order.walletUsedAmount) > 0 ? `<tr><td colspan="3" style="padding:4px 8px;text-align:right;color:#666">Wallet Discount</td><td style="padding:4px 8px;text-align:right;color:#16a34a">-₹${Number(order.walletUsedAmount).toFixed(2)}</td></tr>` : ""}
        ${Number(order.platformFee) > 0 ? `<tr><td colspan="3" style="padding:4px 8px;text-align:right;color:#666">Platform Fee</td><td style="padding:4px 8px;text-align:right">+₹${Number(order.platformFee).toFixed(2)}</td></tr>` : ""}
        <tr class="total-row"><td colspan="3">Grand Total</td><td>₹${shopSubtotal.toFixed(2)}</td></tr>
      </tfoot>
    </table>
  </div>

  <div class="footer">This is a computer-generated invoice. | PetVault</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  };

  return (
    <div className={styles.orderDetailsContainer}>
      {/* Header Info Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerMain}>
          <div className={styles.headerIconWrapper}>
            <Package size={24} />
          </div>
          <div className={styles.headerText}>
            <h4 className={styles.headerName}>
              Order #{order._id.slice(-8).toUpperCase()}
            </h4>
            <p className={styles.headerSubtitle}>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className={styles.headerStatus}>
            <span
              className={`${styles.status} ${getStatusColor(order.status)}`}
            >
              {getStatusIcon(order.status)}
              {titleCase(order.status)}
            </span>
          </div>
        </div>

        <div className={styles.headerGrid}>
          <div className={styles.headerGridItem}>
            <span className={styles.metaLabel}>Customer</span>
            <span className={styles.metaValue}>{order.customerName}</span>
          </div>
          <div className={styles.headerGridItem}>
            <span className={styles.metaLabel}>Total Items</span>
            <span className={styles.metaValue}>
              {calculateTotalItems(order.shopItems)} Units
            </span>
          </div>
          <div className={styles.headerGridItem}>
            <span className={styles.metaLabel}>Order Total</span>
            <span className={styles.metaValue}>₹{shopSubtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Cancellation reason */}
      {order.status === "cancelled" && order.cancellationReason && (
        <div
          className={styles.contentCard}
          style={{
            marginBottom: "1rem",
            borderColor: "var(--color-error-light)",
          }}
        >
          <div className={`${styles.cardHeader} ${styles.dangerHeader}`}>
            <XCircle size={18} color="var(--color-error-dark)" />
            <h3 style={{ color: "var(--color-error-dark)" }}>
              Cancellation Reason
            </h3>
          </div>
          <div className={styles.cardContent}>
            <p
              className={styles.infoValueSimple}
              style={{ textAlign: "left", color: "var(--color-error-dark)" }}
            >
              {order.cancellationReason}
            </p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className={styles.detailsGrid}>
        {/* ── Left Column ── */}
        <div className={styles.detailsColumn}>
          {/* Customer Info */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <UserIcon size={18} />
              <h3>Customer Details</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoRowSimple}>
                <span className={styles.infoLabelSimple}>Name</span>
                <span className={styles.infoValueSimple}>
                  {order.customerName}
                </span>
              </div>
              <div className={styles.infoRowSimple}>
                <span className={styles.infoLabelSimple}>Phone</span>
                <span className={styles.infoValueSimple}>
                  +91 {order.mobileNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <MapPin size={18} />
              <h3>Shipping Address</h3>
            </div>
            <div className={styles.cardContent}>
              {order.shippingAddress ? (
                <div className={styles.addressBox}>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    - {order.shippingAddress.zipCode}
                  </p>
                </div>
              ) : (
                <p className={styles.emptyTextSimple}>No address provided</p>
              )}
            </div>
          </div>

          {/* ── Payment (provider-safe: no gateway IDs) ── */}
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <CreditCard size={18} />
              <h3>Payment</h3>
            </div>
            <div className={styles.cardContent}>
              {/* Method + Status */}
              <div className={styles.paymentFlex}>
                <div className={styles.paymentItemSimple}>
                  <span className={styles.infoLabelSimple}>Method</span>
                  <span className={styles.infoValueSimple}>
                    {order.paymentMethod || "COD"}
                  </span>
                </div>
                <div
                  className={`${styles.paymentItemSimple} ${styles.paymentItemRight}`}
                >
                  <span className={styles.infoLabelSimple}>Status</span>
                  <span
                    className={`${styles.paymentBadge} ${styles[paymentStatus]}`}
                  >
                    {titleCase(paymentStatus)}
                  </span>
                </div>
              </div>

              {/* Paid on */}
              <InfoRow
                icon={<Calendar size={13} />}
                label="Paid On"
                value={fmtDate(order.paidAt)}
              />

              {/* Invoice number */}
              <InfoRow
                icon={<FileText size={13} />}
                label="Invoice No."
                value={order.invoiceNumber}
              />

              {/* UTR number */}
              <InfoRow
                icon={<Hash size={13} />}
                label="UTR Number"
                value={order.paymentInfo?.utrNumber}
              />

              {/* Coins used */}
              <InfoRow
                icon={<Coins size={13} />}
                label="Coins Used"
                value={
                  Number(order.coinsUsed) > 0
                    ? `${order.coinsUsed} coins${Number(order.coinsValue) > 0 ? ` (₹${Number(order.coinsValue).toFixed(2)})` : ""}`
                    : null
                }
              />

              {/* Coins refunded */}
              <InfoRow
                icon={<RotateCcw size={13} />}
                label="Coins Refunded"
                highlight
                value={
                  Number(order.coinsRefunded) > 0
                    ? `${order.coinsRefunded} coins${Number(order.coinsRefundedValue) > 0 ? ` (₹${Number(order.coinsRefundedValue).toFixed(2)})` : ""}`
                    : null
                }
              />

              {/* Wallet used */}
              <InfoRow
                icon={<WalletIcon size={13} />}
                label="Wallet Used"
                value={
                  Number(order.walletUsedAmount) > 0
                    ? `₹${Number(order.walletUsedAmount).toFixed(2)}`
                    : null
                }
              />

              {/* Wallet restored */}
              <InfoRow
                icon={<RotateCcw size={13} />}
                label="Wallet Restored"
                highlight
                value={
                  Number(order.walletUsageRefundedAmount) > 0
                    ? `₹${Number(order.walletUsageRefundedAmount).toFixed(2)}`
                    : null
                }
              />

              {/* Online refunded to wallet */}
              <InfoRow
                icon={<RotateCcw size={13} />}
                label="Refunded to Wallet"
                highlight
                value={
                  Number(order.onlineRefundedToWalletAmount) > 0
                    ? `₹${Number(order.onlineRefundedToWalletAmount).toFixed(2)}`
                    : null
                }
              />

              {/* Platform fee */}
              <InfoRow
                icon={<CreditCard size={13} />}
                label="Platform Fee"
                value={
                  Number(order.platformFee) > 0
                    ? `₹${Number(order.platformFee).toFixed(2)}`
                    : null
                }
              />

              {/* Download Invoice */}
              <div className={styles.invoiceDownloadRow}>
                <Button variant="primary" size="sm" onClick={downloadInvoice}>
                  <Download size={14} />
                  Download Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column — Items ── */}
        <div className={styles.detailsColumn}>
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <ClipboardList size={18} />
              <h3>Order Summary</h3>
            </div>
            <div className={styles.itemListSimple}>
              {order.shopItems.map((item, index) => (
                <div key={index} className={styles.itemRowSimple}>
                  <div className={styles.itemImgBox}>
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  </div>
                  <div className={styles.itemInfoSimple}>
                    <p className={styles.itemNameSimple}>{item.name}</p>
                    <p className={styles.itemMetaSimple}>
                      {item.brand} • Qty: {item.quantity || 1}
                    </p>
                    <div className={styles.itemPricingSimple}>
                      <span>
                        ₹{item.price} x {item.quantity || 1}
                      </span>
                      <ChevronRight size={12} />
                      <span className={styles.itemSubtotalSimple}>
                        ₹{(item.price * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className={styles.summaryFooterSimple}>
                <div className={styles.summaryRowSimple}>
                  <span>Subtotal</span>
                  <span>₹{shopSubtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRowSimple}>
                  <span>Shipping</span>
                  <span className={styles.freeHighlight}>FREE</span>
                </div>
                {Number(order.coinsValue) > 0 && (
                  <div className={styles.summaryRowSimple}>
                    <span>Coins Discount</span>
                    <span className={styles.refundValue}>
                      -₹{Number(order.coinsValue).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(order.walletUsedAmount) > 0 && (
                  <div className={styles.summaryRowSimple}>
                    <span>Wallet Discount</span>
                    <span className={styles.refundValue}>
                      -₹{Number(order.walletUsedAmount).toFixed(2)}
                    </span>
                  </div>
                )}
                {Number(order.platformFee) > 0 && (
                  <div className={styles.summaryRowSimple}>
                    <span>Platform Fee</span>
                    <span>+₹{Number(order.platformFee).toFixed(2)}</span>
                  </div>
                )}
                <div
                  className={`${styles.summaryRowSimple} ${styles.totalRowSimple}`}
                >
                  <span>Grand Total</span>
                  <span>₹{shopSubtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
