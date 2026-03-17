import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "./checkoutForm.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import CoinRedeem from "../../common/CoinRedeem/coinRedeem";
import { Button, Select } from "../../common";
import loadRazorpay from "../../../utils/loadRazorpay";

const toText = (value) => String(value ?? "").trim();

const normalizeAddress = (address) => ({
  street: toText(address?.street),
  city: toText(address?.city),
  state: toText(address?.state),
  zipCode: toText(address?.zipCode),
});

const mapProfileToFormDetails = (profile) => ({
  customerName: toText(profile?.customerName || profile?.name),
  mobileNumber: toText(
    profile?.mobileNumber ||
      profile?.phone ||
      profile?.mobile ||
      profile?.phoneNumber,
  ),
  ...normalizeAddress(profile?.address),
});

const hasAnyDetail = (details) =>
  Boolean(
    details.customerName ||
    details.mobileNumber ||
    details.street ||
    details.city ||
    details.state ||
    details.zipCode,
  );

const hasAllRequiredDetails = (details) =>
  Boolean(
    details.customerName &&
    details.mobileNumber &&
    details.street &&
    details.city &&
    details.state &&
    details.zipCode,
  );

const getEmptyDetails = () => ({
  customerName: "",
  mobileNumber: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
});

const CheckoutForm = ({
  cartItems,
  totalAmount,
  payableAmount,
  coinBalance,
  coinRate,
  coinsToUse,
  setCoinsToUse,
  walletBalance,
  walletToUse,
  setWalletToUse,
  initialProfileDetails,
  onDetailsPreviewChange,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "COD",
  });
  const [detailsMode, setDetailsMode] = useState("saved");
  const [loading, setLoading] = useState(false);
  const isCoinOnly = payableAmount <= 0 && Number(walletToUse || 0) <= 0;
  const isWalletCovered = payableAmount <= 0 && Number(walletToUse || 0) > 0;

  const savedDetails = useMemo(
    () => mapProfileToFormDetails(initialProfileDetails),
    [initialProfileDetails],
  );
  const hasSavedDetails = hasAnyDetail(savedDetails);
  const hasCompleteSavedDetails = hasAllRequiredDetails(savedDetails);
  const detailsLocked = detailsMode === "saved" && hasSavedDetails;

  const {
    customerName: savedName,
    mobileNumber: savedPhone,
    street: savedStreet,
    city: savedCity,
    state: savedState,
    zipCode: savedZipCode,
  } = savedDetails;

  useEffect(() => {
    if (isCoinOnly && formData.paymentMethod !== "Coins") {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: "Coins",
      }));
      return;
    }

    if (isWalletCovered && formData.paymentMethod !== "Wallet") {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: "Wallet",
      }));
      return;
    }

    if (
      !isCoinOnly &&
      !isWalletCovered &&
      ["Coins", "Wallet"].includes(formData.paymentMethod)
    ) {
      setFormData((prev) => ({
        ...prev,
        paymentMethod: "COD",
      }));
    }
  }, [isCoinOnly, isWalletCovered, formData.paymentMethod]);

  useEffect(() => {
    if (detailsMode !== "saved" || !hasSavedDetails) return;

    setFormData((previous) => ({
      ...previous,
      customerName: savedName,
      mobileNumber: savedPhone,
      street: savedStreet,
      city: savedCity,
      state: savedState,
      zipCode: savedZipCode,
    }));
  }, [
    detailsMode,
    hasSavedDetails,
    savedName,
    savedPhone,
    savedStreet,
    savedCity,
    savedState,
    savedZipCode,
  ]);

  useEffect(() => {
    onDetailsPreviewChange?.({
      customerName: toText(formData.customerName),
      mobileNumber: toText(formData.mobileNumber),
      address: normalizeAddress({
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      }),
      mode: detailsMode,
      hasCompleteDetails: hasAllRequiredDetails({
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      }),
    });
  }, [
    detailsMode,
    formData.customerName,
    formData.mobileNumber,
    formData.street,
    formData.city,
    formData.state,
    formData.zipCode,
    onDetailsPreviewChange,
  ]);

  const handleChange = (e) => {
    if (detailsMode === "saved" && !hasSavedDetails) {
      setDetailsMode("custom");
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleModeChange = (mode) => {
    if (mode === "saved") {
      if (!hasSavedDetails) return;
      setDetailsMode("saved");
      setFormData((previous) => ({
        ...previous,
        customerName: savedName,
        mobileNumber: savedPhone,
        street: savedStreet,
        city: savedCity,
        state: savedState,
        zipCode: savedZipCode,
      }));
      return;
    }

    setDetailsMode("custom");
    setFormData((previous) => ({
      ...previous,
      ...getEmptyDetails(),
    }));
  };

  const handleWalletChange = (event) => {
    const parsed = Number(event.target.value);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setWalletToUse(0);
      return;
    }

    setWalletToUse(parsed);
  };

  const placeOrder = async (orderData, token) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Order failed");
    return data;
  };

  // const handleOnlinePayment = async (orderData, token) => {
  //   const orderRes = await fetch(`${API_BASE_URL}/payment/create-order`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ amount: totalAmount }),
  //   });

  //   const razorOrder = await orderRes.json();

  //   const options = {
  //     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //     amount: razorOrder.amount,
  //     currency: "INR",
  //     name: "PetVault",
  //     order_id: razorOrder.id,
  //     handler: async (response) => {
  //       try {
  //         const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(response),
  //         });

  //         if (!verifyRes.ok) throw new Error("Verification failed");

  //         const finalOrder = await placeOrder(
  //           {
  //             ...orderData,
  //             paymentMethod: "Online",
  //             paymentStatus: "paid",
  //             paymentInfo: response,
  //             paidAt: new Date(),
  //           },
  //           token
  //         );

  //         toast.success("Payment successful & order placed");
  //         setLoading(false);
  //         onSuccess(finalOrder);
  //       } catch (err) {
  //         console.error(err);
  //         toast.error(
  //           "Payment successful but order could not be placed. Please contact support."
  //         );
  //         setLoading(false);
  //       }
  //     },
  //     modal: {
  //       ondismiss: () => {
  //         toast.error("Payment cancelled");
  //         setLoading(false);
  //       },
  //     },
  //     theme: { color: "#0d6efd" },
  //   };

  //   new window.Razorpay(options).open();
  // };

  const handleOnlinePayment = async (orderData, token) => {
    const createdOrder = await placeOrder(
      {
        ...orderData,
        paymentMethod: "Online",
        paymentStatus: "pending",
      },
      token,
    );
    const orderRes = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId: createdOrder._id,
      }),
    });
    const razorOrder = await orderRes.json();
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "PetVault",
      order_id: razorOrder.id,
      handler: async (response) => {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: createdOrder._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyRes.ok) throw new Error("Verification failed");
          const verifyData = await verifyRes.json();
          toast.success("Payment successful & order confirmed");
          setLoading(false);
          onSuccess(verifyData.order || createdOrder);
        } catch (err) {
          console.error(err);
          toast.error("Payment verification failed");
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => {
          toast.error("Payment cancelled");
          setLoading(false);
        },
      },
      theme: {
        color: "#0d6efd",
      },
    };
    await loadRazorpay();
    if (!window?.Razorpay) throw new Error("Razorpay SDK failed to load");
    new window.Razorpay(options).open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customerName, mobileNumber, street, city, state, zipCode } =
      formData;

    if (
      !customerName ||
      !mobileNumber ||
      !street ||
      !city ||
      !state ||
      !zipCode
    ) {
      toast.warn("Please fill in all required fields");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.info("Please login to continue checkout");
      return;
    }
    const orderData = {
      customerName,
      mobileNumber,
      items: cartItems.map((item) => ({
        product: item.productId?._id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        shopId: item.shopId?._id || item.shopId,
        image: item.image,
        brand: item.productId?.brand || "",
      })),
      shippingAddress: {
        street,
        city,
        state,
        zipCode,
      },
      coinsToUse: coinsToUse || 0,
      walletToUse: walletToUse || 0,
    };
    try {
      setLoading(true);
      const finalPaymentMethod = isCoinOnly
        ? "Coins"
        : isWalletCovered
          ? "Wallet"
          : formData.paymentMethod;
      if (finalPaymentMethod === "Online") {
        setLoading(true);
        await handleOnlinePayment(orderData, token);
        return;
      }
      const data = await placeOrder(
        {
          ...orderData,
          paymentMethod: finalPaymentMethod || "COD",
        },
        token,
      );
      toast.success("Order placed successfully");
      onSuccess(data);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const paymentMethodOptions = isCoinOnly
    ? [{ value: "Coins", label: "Coins" }]
    : isWalletCovered
      ? [{ value: "Wallet", label: "Wallet" }]
      : [
          { value: "COD", label: "Cash on Delivery" },
          { value: "Online", label: "Online Payment" },
        ];

  return (
    <form className={styles.checkoutForm} onSubmit={handleSubmit}>
      <h2>Checkout</h2>

      <div className={styles.detailsModeCard}>
        <p className={styles.detailsModeTitle}>Delivery Details</p>
        <div className={styles.detailsModeToggle}>
          <Button
            variant={detailsMode === "saved" ? "primary" : "outline"}
            size="lg"
            onClick={() => handleModeChange("saved")}
            disabled={!hasSavedDetails}
            className={detailsMode === "saved" ? styles.activeToggle : ""}
            fullWidth
          >
            Use Saved Details
          </Button>
          <Button
            variant={detailsMode === "custom" ? "primary" : "outline"}
            size="lg"
            onClick={() => handleModeChange("custom")}
            className={detailsMode === "custom" ? styles.activeToggle : ""}
            fullWidth
          >
            Use Custom Details
          </Button>
        </div>
        {!hasSavedDetails && (
          <p className={styles.detailsModeHint}>
            No saved profile details found. Please fill custom details.
          </p>
        )}
        {detailsMode === "saved" &&
          hasSavedDetails &&
          !hasCompleteSavedDetails && (
            <p className={styles.detailsModeHint}>
              Saved details are incomplete. Switch to custom details to edit.
            </p>
          )}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            disabled={detailsLocked}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mobile Number</label>
          <input
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            maxLength="10"
            disabled={detailsLocked}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Street</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            disabled={detailsLocked}
          />
        </div>

        <div className={styles.formGroup}>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={detailsLocked}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            disabled={detailsLocked}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Pin Code</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            maxLength="6"
            disabled={detailsLocked}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <Select
          label="Payment Method"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          options={paymentMethodOptions}
          placeholder="Select payment method"
          fullWidth
          disabled={isCoinOnly || isWalletCovered}
        />
      </div>

      <div className={styles.formGroup}>
        <CoinRedeem
          balance={coinBalance}
          rate={coinRate}
          value={coinsToUse}
          maxCoins={Math.min(
            Math.floor(totalAmount * (coinRate || 10) * 0.05),
            coinBalance || 0,
            100,
          )}
          onChange={setCoinsToUse}
          label="Apply Pet Vault Coins"
          helper={`${coinRate || 10} coins = ₹1 • Max 5% (max 100) • Refunded if cancelled`}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Use Wallet Balance (₹)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={walletToUse}
          onChange={handleWalletChange}
          disabled={Number(walletBalance || 0) <= 0}
        />
        <p className={styles.walletHint}>
          Available: ₹{Number(walletBalance || 0).toFixed(2)} • Online cancelled
          order refunds are added here automatically.
        </p>
      </div>

      <Button
        type="submit"
        className={styles.submitBtn}
        disabled={loading}
        variant="primary"
        size="lg"
        fullWidth
      >
        {loading
          ? "Processing..."
          : `Place Order • ₹${payableAmount.toFixed(2)}`}
      </Button>
    </form>
  );
};
export default CheckoutForm;
