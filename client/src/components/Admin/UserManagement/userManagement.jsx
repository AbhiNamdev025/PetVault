import React, { useEffect, useState } from "react";
import styles from "./userManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import toast from "react-hot-toast";
import UserCard from "./UserCards/userCard";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setUsers(data);
      else toast.error(data.message || "Failed to fetch users");
    } catch {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.info("User deleted");
      } else toast.error("Failed to delete user");
    } catch {
      toast.error("Error deleting user");
    }
  };

  if (loading) return <div className={styles.loading}>Loading users...</div>;

  return (
    <div className={styles.userManagement}>
      <h1 className={styles.title}>User Management</h1>
      {users.length === 0 ? (
        <div className={styles.emptyState}>No Users Found</div>
      ) : (
        <div className={styles.grid}>
          {users.map((user) => (
            <UserCard key={user._id} user={user} onDelete={handleDeleteUser} />
          ))}
        </div>
      )}
    </div>
  );
}

export default UserManagement;
