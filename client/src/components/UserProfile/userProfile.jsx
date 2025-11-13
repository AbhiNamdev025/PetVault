import React, { useEffect, useState } from "react";
import styles from "./userProfile.module.css";
import { API_BASE_URL, BASE_URL } from "../../utils/constants";

const SERVICE_PRICES = {
  vet: { name: "Veterinary Checkup", price: 899 },
  daycare: { name: "Pet Daycare", price: 1299 },
  boarding: { name: "Pet Boarding", price: 2499 },
  training: { name: "Obedience Training", price: 2999 },
  grooming: { name: "Grooming", price: 4999 },
  others: { name: "Other Services", price: 0 },
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data.user);
        setFormData(data.user);
        setAppointments(data.appointments || []);
        setOrders(data.orders || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [field, subfield] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subfield]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    const form = new FormData();

    form.append("name", formData.name || "");
    form.append("email", formData.email || "");
    form.append("phone", formData.phone || "");
    form.append("address.street", formData.address?.street || "");
    form.append("address.city", formData.address?.city || "");
    form.append("address.state", formData.address?.state || "");
    form.append("address.zipCode", formData.address?.zipCode || "");
    if (avatarFile) form.append("avatar", avatarFile);

    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();
    setUser(data);
    setFormData(data);
    setEditMode(false);
  };

  if (!user) return <div className={styles.loader}>Loading profile...</div>;

  return (
    <div className={styles.profileSection}>
      <div className={styles.profileCard}>
        <div className={styles.avatarWrapper}>
          <img
            src={
              avatarFile
                ? URL.createObjectURL(avatarFile)
                : user.avatar
                ? `${BASE_URL}/uploads/avatars/${user.avatar}`
                : "https://avatarfiles.alphacoders.com/377/thumb-1920-377617.png"
            }
            alt="User Avatar"
            className={styles.avatar}
          />
          <span
            className={`${styles.roleBadge} ${
              user.role === "admin" ? styles.adminBadge : styles.userBadge
            }`}
          >
            {user.role}
          </span>
          {editMode && (
            <input
              type="file"
              onChange={handleAvatarChange}
              className={styles.fileInput}
            />
          )}
        </div>

        <div className={styles.userInfo}>
          {editMode ? (
            <>
              <input
                name="name"
                value={formData.name || "User"}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="email"
                value={formData.email || "user@gmail.com"}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="phone"
                value={formData.phone || "9999999999"}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="address.street"
                value={formData.address?.street || "Moon"}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="address.city"
                value={formData.address?.city || "Moon"}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="address.state"
                value={formData.address?.state || "Moon"}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                name="address.zipCode"
                value={formData.address?.zipCode || "999999"}
                onChange={handleChange}
                className={styles.input}
              />
              <button onClick={handleUpdate} className={styles.saveButton}>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p>{user.phone || "No phone added"}</p>
              <p>
                {user.address
                  ? `${user.address.street || ""}, ${
                      user.address.city || ""
                    }, ${user.address.state || ""} ${
                      user.address.zipCode || ""
                    }`
                  : "No address added"}
              </p>
              <button
                onClick={() => setEditMode(true)}
                className={styles.editButton}
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.dataSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Appointments</h3>
          <button
            className={styles.viewAllBtn}
            onClick={() => (window.location.href = "/my-appointments")}
          >
            View All
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {appointments.slice(0, 3).map((a) => {
              const s = SERVICE_PRICES[a.service] || {};
              return (
                <tr key={a._id}>
                  <td>{s.name || "N/A"}</td>
                  <td>₹{s.price || "0"}</td>
                  <td
                    className={
                      a.status === "confirmed"
                        ? styles.confirmed
                        : styles.pending
                    }
                  >
                    {a.status}
                  </td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.dataSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Orders</h3>
          <button
            className={styles.viewAllBtn}
            onClick={() => (window.location.href = "/my-orders")}
          >
            View All
          </button>
        </div>

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
            {orders.slice(0, 3).map((o) => (
              <tr key={o._id}>
                <td>
                  {o.items?.[0]?.name ||
                    o.items?.[0]?.product?.name ||
                    "N/A"}
                </td>
                <td>₹{o.totalAmount}</td>
                <td
                  className={
                    o.status === "confirmed"
                      ? styles.confirmed
                      : styles.pending
                  }
                >
                  {o.status}
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Profile;
