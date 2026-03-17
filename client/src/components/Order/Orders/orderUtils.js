import { BASE_URL } from "../../../utils/constants";

export const ORDER_STATUS_STEPS = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
];

export const formatCurrency = (amount = 0) =>
  `₹${Number(amount || 0).toFixed(2)}`;

export const formatCompactCurrency = (amount = 0) => {
  const value = Number(amount || 0);
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return `₹${value.toFixed(0)}`;
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatTitle = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const getOrderStatusMeta = (status = "pending") => {
  switch (status) {
    case "delivered":
      return { label: "Delivered", tone: "success" };
    case "confirmed":
      return { label: "Confirmed", tone: "info" };
    case "shipped":
      return { label: "Shipped", tone: "accent" };
    case "cancelled":
      return { label: "Cancelled", tone: "danger" };
    default:
      return { label: "Pending", tone: "warning" };
  }
};

export const resolveOrderItemImage = (item) => {
  const image = item?.image;
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  if (item?.product) return `${BASE_URL}/uploads/products/${image}`;
  if (item?.pet) return `${BASE_URL}/uploads/pets/${image}`;

  return `${BASE_URL}/uploads/products/${image}`;
};

export const calculateOrderBreakdown = (order) => {
  const originalAmount = Number(
    order?.originalAmount || order?.totalAmount || 0,
  );
  const platformFee = Number(order?.platformFee || 0);
  const coinsValue = Number(order?.coinsValue || 0);
  const walletUsedAmount = Number(order?.walletUsedAmount || 0);
  const subtotal = Math.max(0, originalAmount - platformFee);
  const total = Number(
    order?.totalAmount || Math.max(0, originalAmount - coinsValue - walletUsedAmount),
  );

  return { subtotal, platformFee, coinsValue, walletUsedAmount, total };
};
