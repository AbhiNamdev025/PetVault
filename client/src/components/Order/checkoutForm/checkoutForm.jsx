import React, { useState } from "react";
import { toast } from "react-toastify";
import styles from "./checkoutForm.module.css";
import { API_BASE_URL } from "../../../utils/constants";

const CheckoutForm = ({ cartItems, totalAmount, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "COD",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { customerName, mobileNumber, street, city, state, zipCode } = formData;

    if (!customerName || !mobileNumber || !street || !city || !state || !zipCode) {
      toast.warn("Please fill in all required fields");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.info("Please login to continue checkout");
      return;
    }

    const orderData = {
      customerName,
      mobileNumber,
      items: cartItems.map((item) => ({
        product: item.product?._id || item.product,
        pet: item.pet?._id || item.pet,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentMethod: formData.paymentMethod,
      shippingAddress: {
        street,
        city,
        state,
        zipCode,
      },
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Order placed successfully!");
        onSuccess(data);
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.checkoutForm} onSubmit={handleSubmit}>
      <h2>Checkout</h2>

      <div className={styles.formGroup}>
        <label>Full Name</label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          placeholder="Enter your full name"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Mobile Number</label>
        <input
          type="tel"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          placeholder="Enter 10-digit mobile number"
          maxLength="10"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Street</label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="Enter street address"
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
          />
        </div>
        <div className={styles.formGroup}>
          <label>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Zip Code</label>
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="Zip Code"
          maxLength="6"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Payment Method</label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
        >
          <option value="COD">Cash on Delivery</option>
          <option value="Online">Online Payment</option>
        </select>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "Placing order..." : `Place Order • ₹${totalAmount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default CheckoutForm;
