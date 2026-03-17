import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BadgeIndianRupee, Filter } from "lucide-react";
import styles from "./payoutManagement.module.css";
import { API_BASE_URL } from "../../../utils/constants";
import { Button } from "../../common";
import FilterSidebar from "../../common/FilterSidebar/FilterSidebar";
import AdminHeader from "../common/AdminHeader/AdminHeader";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "disbursed", label: "Disbursed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "shop", label: "Shop" },
  { value: "doctor", label: "Doctor" },
  { value: "caretaker", label: "Caretaker" },
  { value: "hospital", label: "Hospital" },
  { value: "daycare", label: "Daycare" },
  { value: "ngo", label: "NGO" },
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value) => {
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

const toReadableStatus = (status) =>
  String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const filterOptions = [
  {
    id: "status",
    label: "Status",
    values: STATUS_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
  },
  {
    id: "period",
    label: "Period",
    values: PERIOD_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
  },
  {
    id: "role",
    label: "Role",
    values: ROLE_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
  },
];

const PayoutManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    period: "all",
    role: "all",
  });

  const fetchPayouts = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      setLoading(true);
      const query = new URLSearchParams({
        status: filters.status,
        period: filters.period,
        role: filters.role,
      }).toString();

      const res = await fetch(`${API_BASE_URL}/admin/payouts?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to fetch payout requests");
        setRequests([]);
        setSummary(null);
        return;
      }

      setRequests(Array.isArray(data?.requests) ? data.requests : []);
      setSummary(data?.summary || null);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch payout requests");
      setRequests([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [filters.period, filters.role, filters.status]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const totalRowsLabel = useMemo(
    () => Number(summary?.totalCount || requests.length || 0),
    [summary?.totalCount, requests.length],
  );

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.period !== "all" ||
    filters.role !== "all";

  return (
    <div className={styles.payoutManagement}>
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        showSearch={false}
        onReset={() =>
          setFilters({
            status: "all",
            period: "all",
            role: "all",
          })
        }
      />

      <AdminHeader
        title="Payout Management"
        subtitle="Review provider payout requests and complete disbursements."
        actions={
          <div className={styles.headerFilters}>
            <Button
              className={styles.filterBtn}
              onClick={() => setShowFilters(true)}
              variant="ghost"
              size="sm"
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && <span className={styles.filterDot} />}
            </Button>
            {hasActiveFilters && (
              <Button
                className={styles.clearBtnInline}
                onClick={() =>
                  setFilters({
                    status: "all",
                    period: "all",
                    role: "all",
                  })
                }
                variant="ghost"
                size="md"
              >
                Clear
              </Button>
            )}
          </div>
        }
      />

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p>Total Requests</p>
          <h3>{totalRowsLabel}</h3>
        </div>
        <div className={styles.summaryCard}>
          <p>Total Requested</p>
          <h3>{formatCurrency(summary?.totalRequested || 0)}</h3>
        </div>
        <div className={styles.summaryCard}>
          <p>Reserved (Pending/Processing)</p>
          <h3>{formatCurrency(summary?.reservedAmount || 0)}</h3>
        </div>
        <div className={styles.summaryCard}>
          <p>Disbursed</p>
          <h3>{formatCurrency(summary?.disbursedAmount || 0)}</h3>
        </div>
      </div>

      <div className={styles.listCard}>
        <div className={styles.listHeader}>
          <BadgeIndianRupee size={18} />
          <h3>Payout Requests</h3>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading payout requests...</div>
        ) : requests.length === 0 ? (
          <div className={styles.empty}>No payout requests found.</div>
        ) : (
          <div className={styles.requestList}>
            {requests.map((request) => (
              <article
                key={request._id}
                className={styles.requestRow}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/admin/payouts/${request._id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/admin/payouts/${request._id}`);
                  }
                }}
              >
                <div className={styles.rowMain}>
                  <div className={styles.providerCol}>
                    <p className={styles.providerName}>
                      {request?.provider?.name || "Provider"}
                    </p>
                    <span>
                      {request?.provider?.email || "-"} •{" "}
                      {toReadableStatus(request?.providerRole || "")}
                    </span>
                  </div>
                  <div className={styles.amountCol}>
                    <p>
                      {formatCurrency(request?.netAmount || request?.amount)}
                    </p>
                    <span>
                      Gross {formatCurrency(request?.amount)} • Fee{" "}
                      {formatCurrency(request?.platformFeeAmount || 0)}
                    </span>
                    <span>{formatDateTime(request?.createdAt)}</span>
                  </div>
                  <div className={styles.bankCol}>
                    <p>
                      {request?.bankDetails?.bankName ||
                        request?.bankDetailsMasked?.bankName ||
                        "-"}
                    </p>
                    <span>
                      {request?.bankDetails?.accountNumber ||
                        request?.bankDetailsMasked?.accountNumberMasked ||
                        "-"}{" "}
                      •{" "}
                      {request?.bankDetails?.ifscCode ||
                        request?.bankDetailsMasked?.ifscCode ||
                        "-"}
                    </span>
                  </div>
                  <div className={styles.statusCol}>
                    <span
                      className={`${styles.statusTag} ${styles[String(request?.status || "pending").toLowerCase()]}`}
                    >
                      {toReadableStatus(request?.status)}
                    </span>
                    {request?.disbursementReference && (
                      <span className={styles.reference}>
                        Ref: {request.disbursementReference}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutManagement;
