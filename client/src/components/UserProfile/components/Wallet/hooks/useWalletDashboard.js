import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../../../utils/constants";
import {
  PAYOUT_STATUS_OPTIONS,
  PERIOD_OPTIONS,
  PROVIDER_SECTION_OPTIONS,
  USER_SECTION_OPTIONS,
} from "../constants/wallet.constants";
import {
  formatCurrency,
  getEmptyBankForm,
  getToken,
  validateBankForm,
} from "../utils/wallet.utils";

const useWalletDashboard = ({ user, refreshBalance }) => {
  const [period, setPeriod] = useState("all");
  const [sectionView, setSectionView] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [ledger, setLedger] = useState([]);

  const [providerSummary, setProviderSummary] = useState(null);
  const [payoutSummary, setPayoutSummary] = useState(null);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");

  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedPayoutAccountId, setSelectedPayoutAccountId] = useState("");
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState("");
  const [activeAccountMenuId, setActiveAccountMenuId] = useState("");
  const [bankForm, setBankForm] = useState(getEmptyBankForm());
  const [savingBank, setSavingBank] = useState(false);

  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [requestingPayout, setRequestingPayout] = useState(false);

  const isProvider = useMemo(
    () =>
      ["shop", "doctor", "caretaker", "hospital", "daycare", "ngo"].includes(
        user?.role,
      ),
    [user?.role],
  );

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;

      const requests = [
        fetch(`${API_BASE_URL}/wallet/ledger?period=${period}&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ];

      if (isProvider) {
        requests.push(
          fetch(`${API_BASE_URL}/wallet/provider-earnings?period=all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/wallet/payout-summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/wallet/payout-requests?limit=50`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );
      }

      const responses = await Promise.all(requests);
      let index = 0;

      const ledgerRes = responses[index++];
      if (ledgerRes?.ok) {
        const data = await ledgerRes.json();
        setLedger(Array.isArray(data?.ledger) ? data.ledger : []);
      } else {
        setLedger([]);
      }

      if (isProvider) {
        const providerRes = responses[index++];
        const payoutSummaryRes = responses[index++];
        const payoutRequestsRes = responses[index++];

        if (providerRes?.ok) {
          const data = await providerRes.json();
          setProviderSummary(data?.summary || null);
        } else {
          setProviderSummary(null);
        }

        if (payoutSummaryRes?.ok) {
          const data = await payoutSummaryRes.json();
          setPayoutSummary(data || null);
          const accounts = Array.isArray(data?.bankAccounts)
            ? data.bankAccounts
            : [];
          setBankAccounts(accounts);
          const defaultAccountId = String(data?.defaultBankAccountId || "");
          setSelectedPayoutAccountId((prev) => {
            if (
              prev &&
              accounts.some((account) => String(account._id) === prev)
            ) {
              return prev;
            }
            if (defaultAccountId) return defaultAccountId;
            return accounts[0]?._id ? String(accounts[0]._id) : "";
          });
        } else {
          setPayoutSummary(null);
          setBankAccounts([]);
          setSelectedPayoutAccountId("");
        }

        if (payoutRequestsRes?.ok) {
          const data = await payoutRequestsRes.json();
          setPayoutRequests(Array.isArray(data?.requests) ? data.requests : []);
        } else {
          setPayoutRequests([]);
        }
      } else {
        setProviderSummary(null);
        setPayoutSummary(null);
        setPayoutRequests([]);
        setBankAccounts([]);
        setSelectedPayoutAccountId("");
      }
    } catch (error) {
      console.error("Wallet fetch error:", error);
      setLedger([]);
      setProviderSummary(null);
      setPayoutSummary(null);
      setPayoutRequests([]);
      setBankAccounts([]);
      setSelectedPayoutAccountId("");
    } finally {
      setLoading(false);
    }
  }, [isProvider, period]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveAccountMenuId("");
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const filteredPayoutRequests = useMemo(() => {
    if (payoutStatusFilter === "all") return payoutRequests;
    return payoutRequests.filter(
      (entry) =>
        String(entry?.status || "").toLowerCase() === payoutStatusFilter,
    );
  }, [payoutRequests, payoutStatusFilter]);

  const payoutAccountOptions = useMemo(
    () =>
      bankAccounts.map((account) => ({
        value: String(account._id),
        label: `${account.bankName} (${account.accountNumberMasked})${account.isDefault ? " • Default" : ""}`,
      })),
    [bankAccounts],
  );

  const sectionOptions = useMemo(
    () => (isProvider ? PROVIDER_SECTION_OPTIONS : USER_SECTION_OPTIONS),
    [isProvider],
  );

  useEffect(() => {
    if (!sectionOptions.some((option) => option.value === sectionView)) {
      setSectionView("all");
    }
  }, [sectionOptions, sectionView]);

  const showProviderOverview =
    isProvider && ["all", "overview"].includes(sectionView);
  const showProviderAccounts =
    isProvider && ["all", "accounts"].includes(sectionView);
  const showProviderWithdraw =
    isProvider && ["all", "withdraw"].includes(sectionView);
  const showProviderRequests =
    isProvider && ["all", "requests"].includes(sectionView);
  const showWalletActivity = ["all", "activity"].includes(sectionView);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refreshBalance(), fetchWalletData()]);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [fetchWalletData, refreshBalance]);

  const handleBankFormChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setBankForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const closeAccountEditor = useCallback(() => {
    setShowAddAccountForm(false);
    setEditingAccountId("");
    setBankForm(getEmptyBankForm());
  }, []);

  const handleToggleAddAccountForm = useCallback(() => {
    if (showAddAccountForm) {
      closeAccountEditor();
      return;
    }
    setEditingAccountId("");
    setShowAddAccountForm(true);
  }, [closeAccountEditor, showAddAccountForm]);

  const handleSaveBankAccount = useCallback(async () => {
    const isEditing = Boolean(editingAccountId);
    const validationError = validateBankForm(bankForm, {
      allowEmptyAccountNumber: isEditing,
    });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSavingBank(true);
      const token = getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const payload = {
        nickname: bankForm.nickname,
        accountHolderName: bankForm.accountHolderName,
        bankName: bankForm.bankName,
        ifscCode: bankForm.ifscCode,
        branchName: bankForm.branchName,
        upiId: bankForm.upiId,
        isDefault: bankForm.isDefault,
      };

      if (bankForm.accountNumber || bankForm.confirmAccountNumber) {
        payload.accountNumber = bankForm.accountNumber;
        payload.confirmAccountNumber = bankForm.confirmAccountNumber;
      }

      const endpoint = isEditing
        ? `${API_BASE_URL}/wallet/bank-accounts/${editingAccountId}`
        : `${API_BASE_URL}/wallet/bank-accounts`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        const firstError =
          Array.isArray(data?.errors) && data.errors.length > 0
            ? data.errors[0]
            : data?.message;
        toast.error(
          firstError ||
            (isEditing
              ? "Failed to update payout account"
              : "Failed to add payout account"),
        );
        return;
      }

      toast.success(
        isEditing ? "Payout account updated" : "Payout account added",
      );
      closeAccountEditor();
      await fetchWalletData();
    } catch (error) {
      console.error(error);
      toast.error(
        editingAccountId
          ? "Unable to update payout account"
          : "Unable to add payout account",
      );
    } finally {
      setSavingBank(false);
    }
  }, [bankForm, closeAccountEditor, editingAccountId, fetchWalletData]);

  const handleEditAccount = useCallback((account) => {
    setActiveAccountMenuId("");
    setEditingAccountId(String(account?._id || ""));
    setShowAddAccountForm(true);
    setBankForm({
      nickname: account?.nickname || "",
      accountHolderName: account?.accountHolderName || "",
      bankName: account?.bankName || "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: account?.ifscCode || "",
      branchName: account?.branchName || "",
      upiId: account?.upiId || "",
      isDefault: Boolean(account?.isDefault),
    });
  }, []);

  const handleSetDefaultAccount = useCallback(
    async (accountId) => {
      try {
        setActiveAccountMenuId("");
        const token = getToken();
        if (!token) {
          toast.error("Please login again");
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/wallet/bank-accounts/${accountId}/default`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.message || "Failed to set default account");
          return;
        }

        toast.success("Default payout account updated");
        await fetchWalletData();
      } catch (error) {
        console.error(error);
        toast.error("Unable to set default account");
      }
    },
    [fetchWalletData],
  );

  const handleDeleteAccount = useCallback(
    async (accountId) => {
      const shouldDelete = window.confirm(
        "Delete this payout account? Active payout requests on this account must be resolved first.",
      );
      if (!shouldDelete) return;

      try {
        const token = getToken();
        if (!token) {
          toast.error("Please login again");
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/wallet/bank-accounts/${accountId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.message || "Failed to delete payout account");
          return;
        }

        toast.success("Payout account deleted");
        setActiveAccountMenuId("");
        if (editingAccountId === accountId) {
          closeAccountEditor();
        }
        await fetchWalletData();
      } catch (error) {
        console.error(error);
        toast.error("Unable to delete payout account");
      }
    },
    [closeAccountEditor, editingAccountId, fetchWalletData],
  );

  const handleCreatePayoutRequest = useCallback(async () => {
    const amount = Number(payoutAmount);
    const minPayoutAmount = Number(
      payoutSummary?.payouts?.minPayoutAmount || 0,
    );
    const maxPayoutAmountRaw = Number(payoutSummary?.payouts?.maxPayoutAmount);
    const hasMaxPayoutAmount =
      Number.isFinite(maxPayoutAmountRaw) && maxPayoutAmountRaw > 0;

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid payout amount");
      return;
    }
    if (minPayoutAmount > 0 && amount < minPayoutAmount) {
      toast.error(
        `Minimum payout amount is ${formatCurrency(minPayoutAmount)}`,
      );
      return;
    }
    if (hasMaxPayoutAmount && amount > maxPayoutAmountRaw) {
      toast.error(
        `Maximum payout amount per request is ${formatCurrency(maxPayoutAmountRaw)}`,
      );
      return;
    }
    if (!selectedPayoutAccountId) {
      toast.error("Select a payout account");
      return;
    }

    try {
      setRequestingPayout(true);
      const token = getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/wallet/payout-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          providerNote: payoutNote,
          bankAccountId: selectedPayoutAccountId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to submit payout request");
        return;
      }

      toast.success("Payout request submitted");
      setPayoutAmount("");
      setPayoutNote("");
      await fetchWalletData();
    } catch (error) {
      console.error(error);
      toast.error("Unable to submit payout request");
    } finally {
      setRequestingPayout(false);
    }
  }, [
    fetchWalletData,
    payoutAmount,
    payoutNote,
    payoutSummary?.payouts?.maxPayoutAmount,
    payoutSummary?.payouts?.minPayoutAmount,
    selectedPayoutAccountId,
  ]);

  const handleCancelPayout = useCallback(
    async (payoutId) => {
      const shouldCancel = window.confirm(
        "Cancel this payout request? This action cannot be undone.",
      );
      if (!shouldCancel) return;

      try {
        const token = getToken();
        if (!token) {
          toast.error("Please login again");
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/wallet/payout-requests/${payoutId}/cancel`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.message || "Failed to cancel payout request");
          return;
        }

        toast.success("Payout request cancelled");
        await fetchWalletData();
      } catch (error) {
        console.error(error);
        toast.error("Unable to cancel payout request");
      }
    },
    [fetchWalletData],
  );

  return {
    period,
    setPeriod,
    sectionView,
    setSectionView,
    loading,
    isRefreshing,
    ledger,
    providerSummary,
    payoutSummary,
    payoutRequests,
    payoutStatusFilter,
    setPayoutStatusFilter,
    bankAccounts,
    selectedPayoutAccountId,
    setSelectedPayoutAccountId,
    showAddAccountForm,
    editingAccountId,
    activeAccountMenuId,
    setActiveAccountMenuId,
    bankForm,
    savingBank,
    payoutAmount,
    setPayoutAmount,
    payoutNote,
    setPayoutNote,
    requestingPayout,
    isProvider,
    filteredPayoutRequests,
    payoutAccountOptions,
    sectionOptions,
    showProviderOverview,
    showProviderAccounts,
    showProviderWithdraw,
    showProviderRequests,
    showWalletActivity,
    handleRefresh,
    handleBankFormChange,
    handleToggleAddAccountForm,
    handleSaveBankAccount,
    handleEditAccount,
    handleSetDefaultAccount,
    handleDeleteAccount,
    handleCreatePayoutRequest,
    handleCancelPayout,
    periodOptions: PERIOD_OPTIONS,
    payoutStatusOptions: PAYOUT_STATUS_OPTIONS,
  };
};

export default useWalletDashboard;
