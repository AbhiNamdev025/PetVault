import React from "react";
import styles from "../userProfile.module.css";

const Orders = ({ list }) => (
  <div className={styles.card}>
    <h3 className={styles.sectionTitle}>Orders</h3>

    {list.length === 0 ? (
      <p>No orders</p>
    ) : (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o._id}>
              <td>{o.items?.[0]?.name || "—"}</td>
              <td>₹{o.totalAmount}</td>
              <td>{o.status}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default Orders;
