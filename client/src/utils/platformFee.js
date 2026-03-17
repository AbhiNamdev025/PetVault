import { API_BASE_URL } from "./constants";

export const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const fetchPlatformFeeConfig = async () => {
  const res = await fetch(`${API_BASE_URL}/platform-fee`);
  if (!res.ok) throw new Error("Failed to fetch platform fee");
  return res.json();
};

export const getPlatformFeePercent = (role, config) => {
  if (!config) return 2;
  const normalizedRole = role ? role.toLowerCase() : "default";
  const override = config.roleOverrides?.[normalizedRole];
  if (typeof override === "number") return override;
  return typeof config.defaultPercent === "number" ? config.defaultPercent : 2;
};

export const calculateTotalsForItems = (items, config) => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.productId?.price ?? item.price ?? 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const platformFeeRaw = items.reduce((sum, item) => {
    const price = item.productId?.price ?? item.price ?? 0;
    const qty = item.quantity || 1;
    const role = item.shopId?.role;
    const percent = getPlatformFeePercent(role, config);
    return sum + (price * qty * percent) / 100;
  }, 0);

  const platformFee = roundCurrency(platformFeeRaw);
  const total = roundCurrency(subtotal + platformFee);

  return { subtotal: roundCurrency(subtotal), platformFee, total };
};
