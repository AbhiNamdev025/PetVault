export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const toReadableStatus = (status) =>
  String(status || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getEmptyBankForm = () => ({
  nickname: "",
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifscCode: "",
  branchName: "",
  upiId: "",
  isDefault: false,
});

export const validateBankForm = (form, options = {}) => {
  const { allowEmptyAccountNumber = false } = options;
  const accountHolderName = String(form.accountHolderName || "").trim();
  const bankName = String(form.bankName || "").trim();
  const accountNumber = String(form.accountNumber || "").trim();
  const confirmAccountNumber = String(form.confirmAccountNumber || "").trim();
  const ifscCode = String(form.ifscCode || "")
    .trim()
    .toUpperCase();
  const upiId = String(form.upiId || "").trim();

  if (!/^[a-zA-Z.\s'-]{2,80}$/.test(accountHolderName)) {
    return "Enter a valid account holder name";
  }
  if (!/^[a-zA-Z0-9.&\s'-]{2,80}$/.test(bankName)) {
    return "Enter a valid bank name";
  }

  const isSkippingAccountNumber =
    allowEmptyAccountNumber && !accountNumber && !confirmAccountNumber;
  if (!isSkippingAccountNumber) {
    if (!/^\d{9,18}$/.test(accountNumber)) {
      return "Account number must be 9 to 18 digits";
    }
    if (accountNumber !== confirmAccountNumber) {
      return "Account numbers do not match";
    }
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
    return "Enter a valid IFSC code";
  }
  if (upiId && !/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
    return "Enter a valid UPI ID";
  }

  return "";
};
