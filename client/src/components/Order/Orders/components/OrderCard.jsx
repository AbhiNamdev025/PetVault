import React from "react";
import {
  Calendar,
  ChevronRight,
  CreditCard,
  Coins,
  Receipt,
} from "lucide-react";
import styles from "./orderCard.module.css";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  calculateOrderBreakdown,
  formatCurrency,
  formatCompactCurrency,
  formatDate,
  resolveOrderItemImage,
} from "../orderUtils";
import { Button } from "../../../common";
const OrderCard = ({ order, onViewDetails, onCancel }) => {
  const canCancel = ["pending"].includes(order.status);
  const previewItems = order.items.slice(0, 3);
  const extraItemsCount = Math.max(0, order.items.length - previewItems.length);
  const { coinsValue, total } = calculateOrderBreakdown(order);
  return (
    <article className={styles.card} onClick={() => onViewDetails(order)}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.orderRef}>
            {order.invoiceNumber || `#${order._id.slice(-8).toUpperCase()}`}
          </p>
          <p className={styles.date}>
            <Calendar size={14} />
            {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className={styles.itemsPreview}>
        {previewItems.map((item, idx) => (
          <div className={styles.itemPreview} key={`${item._id || idx}-${idx}`}>
            <img
              src={resolveOrderItemImage(item)}
              alt={item.name}
              className={styles.itemImage}
            />
            <div className={styles.itemText}>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemMeta}>
                Qty {item.quantity} • {formatCurrency(item.price)}
              </p>
            </div>
          </div>
        ))}
        {extraItemsCount > 0 && (
          <div className={styles.moreItems}>
            +{extraItemsCount} more item(s)
          </div>
        )}
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <Receipt size={14} />
          <span>{order.items.length} item(s)</span>
        </div>
        <div className={styles.summaryItem}>
          <CreditCard size={14} />
          <span>{order.paymentMethod}</span>
        </div>
        {coinsValue > 0 && (
          <div className={styles.summaryItem}>
            <Coins size={14} />
            <span>-{formatCurrency(coinsValue)}</span>
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <div title={`Exact Paid: ${formatCurrency(total)}`}>
          <p className={styles.totalLabel}>Total Paid</p>
          <p className={styles.totalValue}>{formatCompactCurrency(total)}</p>
        </div>

        <div className={styles.actionGroup}>
          {canCancel && (
            <Button
              className={styles.cancelBtn}
              onClick={(e) => {
                e.stopPropagation();
                onCancel(order);
              }}
              variant="ghost"
              size="md"
            >
              Cancel
            </Button>
          )}
          <Button
            className={styles.detailsBtn}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(order);
            }}
            variant="primary"
            size="md"
          >
            Details
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </article>
  );
};
export default OrderCard;
