import React from "react";
import { Package } from "lucide-react";
import OrderCard from "../OrderCards/orderCard";
import styles from "../orderManagement.module.css";

const OrderList = ({
  orders,
  onViewDetails,
  onDelete,
  onStatusUpdate,
  updatingId,
}) => {
  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={48} className={styles.emptyIcon} />
        <h3>No Orders Found</h3>
        <p>We couldn't find any orders matching your filter.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <div className={styles.listHeader}>
        <div>Order</div>
        <div>Customer</div>
        <div>Status</div>
        <div>Total</div>
        <div className={styles.actionsHeader}>Actions</div>
      </div>
      {orders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          onClick={() => onViewDetails(order)}
          onDelete={onDelete}
          onStatusUpdate={onStatusUpdate}
          updatingId={updatingId}
        />
      ))}
    </div>
  );
};

export default OrderList;
