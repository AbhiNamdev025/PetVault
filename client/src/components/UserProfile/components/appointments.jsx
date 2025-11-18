import React from "react";
import styles from "../userProfile.module.css";

const Appointments = ({ list }) => (
  <div className={styles.card}>
    <h3 className={styles.sectionTitle}>Appointments</h3>

    {list.length === 0 ? (
      <p>No appointments</p>
    ) : (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Type</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {list.map((a) => (
            <tr key={a._id}>
              <td>{a.providerId?.name || "—"}</td>
              <td>{a.providerType}</td>
              <td>{a.status}</td>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default Appointments;
