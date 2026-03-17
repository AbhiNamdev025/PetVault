import React, { useEffect, useState } from "react";
import CheckoutForm from "../checkoutForm/checkoutForm";
import OrderConfirmation from "../Confirmation/confirmation";
import { getCart, clearCart } from "../../Cart/cartServices";
import styles from "./checkoutPage.module.css";
import toast from "react-hot-toast";
import {
  calculateTotalsForItems,
  fetchPlatformFeeConfig,
} from "../../../utils/platformFee";
import useCoins from "../../../hooks/useCoins";
import useWallet from "../../../hooks/useWallet";
import { API_BASE_URL } from "../../../utils/constants";

const toText = (value) => String(value ?? "").trim();

const normalizeAddress = (address) => ({
  street: toText(address?.street),
  city: toText(address?.city),
  state: toText(address?.state),
  zipCode: toText(address?.zipCode),
});

const mapProfileToPreviewDetails = (profile) => ({
  customerName: toText(profile?.customerName || profile?.name),
  mobileNumber: toText(
    profile?.mobileNumber || profile?.phone || profile?.mobile || profile?.phoneNumber,
  ),
  address: normalizeAddress(profile?.address),
  mode: "saved",
});

const hasAnyDetails = (details) =>
  Boolean(
    details?.customerName ||
      details?.mobileNumber ||
      details?.address?.street ||
      details?.address?.city ||
      details?.address?.state ||
      details?.address?.zipCode,
  );

const formatAddressLine = (address) =>
  [address?.street, address?.city, address?.state, address?.zipCode]
    .map((value) => toText(value))
    .filter(Boolean)
    .join(", ");

const CheckoutPage = () => {
  const ORDER_MAX_COINS = 100;
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [order, setOrder] = useState(null);
  const [platformConfig, setPlatformConfig] = useState(null);
  const { balance: coinBalance, rate: coinRate } = useCoins();
  const { balance: walletBalance } = useWallet();
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [walletToUse, setWalletToUse] = useState(0);
  const [initialProfileDetails, setInitialProfileDetails] = useState(null);
  const [checkoutDetailsPreview, setCheckoutDetailsPreview] = useState(null);

  const fetchCart = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const data = await getCart(token);
      setCartItems(data || []);
    } catch {
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  };

  const fetchProfileDetails = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-cache",
      });
      if (!response.ok) return;
      const profile = await response.json();
      setInitialProfileDetails(profile);
    } catch {
      setInitialProfileDetails(null);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchProfileDetails();
    fetchPlatformFeeConfig()
      .then((config) => setPlatformConfig(config))
      .catch(() => null);
  }, []);

  const { subtotal, platformFee, total } = calculateTotalsForItems(
    cartItems,
    platformConfig,
  );
  const maxCoinsByAmount = Math.floor((total || 0) * (coinRate || 10));
  const maxCoinsByOrderLimit = Math.min(maxCoinsByAmount, ORDER_MAX_COINS);
  const safeCoinsToUse = Math.max(
    0,
    Math.min(coinsToUse, coinBalance, maxCoinsByOrderLimit),
  );
  const coinDiscount = (safeCoinsToUse / (coinRate || 10)) || 0;
  const maxWalletUsable = Math.max(0, total - coinDiscount);
  const safeWalletToUse = Math.max(
    0,
    Math.min(Number(walletToUse) || 0, Number(walletBalance) || 0, maxWalletUsable),
  );
  const walletDiscount = safeWalletToUse;
  const payable = Math.max(0, total - coinDiscount - walletDiscount);

  useEffect(() => {
    if (coinsToUse !== safeCoinsToUse) {
      setCoinsToUse(safeCoinsToUse);
    }
  }, [coinsToUse, safeCoinsToUse]);

  useEffect(() => {
    if (Math.abs((Number(walletToUse) || 0) - safeWalletToUse) > 0.009) {
      setWalletToUse(safeWalletToUse);
    }
  }, [safeWalletToUse, walletToUse]);

  const fallbackPreviewDetails = mapProfileToPreviewDetails(initialProfileDetails);
  const activePreviewDetails = checkoutDetailsPreview || fallbackPreviewDetails;
  const activeAddress = activePreviewDetails?.address || {};
  const previewAddressLine = formatAddressLine(activeAddress);
  const hasPreviewDetails = hasAnyDetails(activePreviewDetails);

  const handleSuccess = async (orderData) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      await clearCart(token);
      setCartItems([]);
      setOrder(orderData);
      setCoinsToUse(0);
      setWalletToUse(0);
    } catch {
      toast.error("Order placed, but failed to clear cart.");
    }
  };

  if (loadingCart) return <div className={styles.loading}>Loading...</div>;
  if (cartItems.length === 0 && !order)
    return <div className={styles.empty}>Your cart is empty</div>;

  return order ? (
    <OrderConfirmation order={order} />
  ) : (
    <div className={styles.checkoutWrapper}>
      <div className={styles.left}>
        <CheckoutForm
          cartItems={cartItems}
          totalAmount={total}
          payableAmount={payable}
          coinBalance={coinBalance}
          coinRate={coinRate}
          coinsToUse={safeCoinsToUse}
          setCoinsToUse={setCoinsToUse}
          walletBalance={walletBalance}
          walletToUse={safeWalletToUse}
          setWalletToUse={setWalletToUse}
          initialProfileDetails={initialProfileDetails}
          onDetailsPreviewChange={setCheckoutDetailsPreview}
          onSuccess={handleSuccess}
        />
      </div>

      <aside className={styles.right}>
        <div className={styles.summaryBox}>
          <h3>Order Summary</h3>
          <div className={styles.row}>
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.row}>
            <span>Platform Fee</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          {safeCoinsToUse > 0 && (
            <div className={styles.row}>
              <span>Coins Discount</span>
              <span>-₹{coinDiscount.toFixed(2)}</span>
            </div>
          )}
          {safeWalletToUse > 0 && (
            <div className={styles.row}>
              <span>Wallet Applied</span>
              <span>-₹{walletDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.total}>
            <span>Total</span>
            <strong>₹{payable.toFixed(2)}</strong>
          </div>
          <p className={styles.walletNote}>
            Wallet Balance: ₹{Number(walletBalance || 0).toFixed(2)}
          </p>
        </div>

        <div className={styles.addressBox}>
          <div className={styles.addressHeader}>
            <h4>Delivery Address</h4>
            <span
              className={`${styles.addressModeTag} ${
                activePreviewDetails?.mode === "custom"
                  ? styles.addressModeCustom
                  : styles.addressModeSaved
              }`}
            >
              {activePreviewDetails?.mode === "custom" ? "Custom" : "Saved"}
            </span>
          </div>

          {hasPreviewDetails ? (
            <div className={styles.addressDetails}>
              <p className={styles.addressName}>
                {activePreviewDetails?.customerName || "Name not set"}
              </p>
              <p className={styles.addressPhone}>
                {activePreviewDetails?.mobileNumber || "Phone not set"}
              </p>
              <p className={styles.addressLine}>
                {previewAddressLine || "Address not set"}
              </p>
            </div>
          ) : (
            <p className={styles.addressEmpty}>
              Add your profile details or switch to custom details in the form.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CheckoutPage;
