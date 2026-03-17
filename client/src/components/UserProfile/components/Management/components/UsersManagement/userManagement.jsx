import React, { useState, useEffect } from "react";
import styles from "./userManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import ManagementEmptyState from "../common/ManagementEmptyState";
import { Users } from "lucide-react";
import { Pagination } from "../../../../../common";

const UserManagement = ({ user: currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        // Update endpoint to match routes if different. Usually admin gets all users.
        const res = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUsers(data || []);
        } else {
          // Fallback or error handling
          const data = await res.json();
          console.error("Failed to fetch users", data);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) return <div>Loading users...</div>;

  if (users.length === 0) {
    return (
      <div className={styles.container}>
        <ManagementEmptyState
          title="No Users Found"
          description="There are currently no users in the system."
          icon={Users}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>User Management</h2>
          <p className={styles.subtitle}>
            View all users and monitor their account status.
          </p>
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isVerified ? "Verified" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showPageInfo
      />
    </div>
  );
};

export default UserManagement;
