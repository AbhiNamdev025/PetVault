import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Landmark, Send } from "lucide-react";
import styles from "./payoutDetails.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import { Button, Input, Select, Textarea } from "../../common";

const ACTIONS_BY_STATUS = {
  pending: [
    { value: "approved", label: "Approve" },
    { value: "processing", label: "Mark Processing" },
    { value: "disbursed", label: "Mark Disbursed" },
    { value: "rejected", label: "Reject" },
  ],
  approved: [
    { value: "processing", label: "Mark Processing" },
    { value: "disbursed", label: "Mark Disbursed" },
    { value: "rejected", label: "Reject" },
  ],
  processing: [
    { value: "disbursed", label: "Mark Disbursed" },
    { value: "rejected", label: "Reject" },
  ],
};

const PAYMENT_MODE_OPTIONS = [
  { value: "", label: "Select mode" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "imps", label: "IMPS" },
  { value: "neft", label: "NEFT" },
  { value: "rtgs", label: "RTGS" },
  { value: "manual", label: "Manual" },
];

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

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

const PayoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [providerSummary, setProviderSummary] = useState(null);
  const [businessDayNotice, setBusinessDayNotice] = useState("");

  const [selectedAction, setSelectedAction] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [disbursementReference, setDisbursementReference] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        toast.error("Please login again");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/admin/payouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || "Failed to fetch payout details");
        return;
      }

      setDetails(data?.request || null);
      setProviderSummary(data?.providerSummary || null);
      setBusinessDayNotice(data?.businessDayNotice || "");
      setSelectedAction("");
      setAdminNote("");
      setDisbursementReference(data?.request?.disbursementReference || "");
      setPaymentMode(data?.request?.paymentMode || "");
      setUtrNumber(data?.request?.utrNumber || "");
      setTransactionId(data?.request?.transactionId || "");
      setProofFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch payout details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const actionOptions = useMemo(() => {
    const status = String(details?.status || "").toLowerCase();
    return ACTIONS_BY_STATUS[status] || [];
  }, [details?.status]);

  const handleUpdateStatus = async () => {
    if (!selectedAction) {
      toast.error("Select a status update action");
      return;
    }
    if (selectedAction === "disbursed" && !disbursementReference.trim()) {
      toast.error("Disbursement reference is required");
      return;
    }
    if (selectedAction === "disbursed" && !paymentMode.trim()) {
      toast.error("Payment mode is required");
      return;
    }
    if (selectedAction === "disbursed" && !utrNumber.trim()) {
      toast.error("UTR number is required");
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("status", selectedAction);
      formData.append("adminNote", adminNote.trim());
      formData.append("disbursementReference", disbursementReference.trim());
      formData.append("paymentMode", paymentMode.trim());
      formData.append("utrNumber", utrNumber.trim());
      formData.append("transactionId", transactionId.trim());
      if (proofFile) {
        formData.append("payoutProofImage", proofFile);
      }
      const res = await fetch(`${API_BASE_URL}/admin/payouts/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || "Failed to update payout status");
        return;
      }
      toast.success("Payout status updated");
      await fetchDetails();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update payout status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading payout details...</div>;
  }

  if (!details) {
    return (
      <div className={styles.empty}>
        <p>Payout request not found.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/payouts")}>
          Back
        </Button>
      </div>
    );
  }

  const provider = details?.provider || {};
  const payoutTotals = providerSummary?.payouts || {};
  const earningsSummary = providerSummary?.earnings || {};
  const proofImageUrl = details?.payoutProofImage
    ? `${BASE_URL}/uploads/payouts/${details.payoutProofImage}`
    : "";
  const readablePaymentMode = String(details?.paymentMode || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className={styles.page}>
      <Button
        variant="ghost"
        size="sm"
        className={styles.backBtn}
        onClick={() => navigate("/admin/payouts")}
      >
        <ArrowLeft size={16} />
        Back to Payouts
      </Button>

      <section className={styles.hero}>
        <div>
          <h2>Payout Request Details</h2>
          <p>
            Request ID: <strong>{details._id}</strong>
          </p>
        </div>
        <span className={`${styles.statusTag} ${styles[String(details.status || "pending").toLowerCase()]}`}>
          {toReadableStatus(details.status)}
        </span>
      </section>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>Provider</h3>
          <p>{provider.name || "-"}</p>
          <span>{provider.email || "-"}</span>
          <span>{provider.phone || "-"}</span>
          <span>{toReadableStatus(provider.role || "")}</span>
        </section>

        <section className={styles.card}>
          <h3>Payout</h3>
          <p>{formatCurrency(details.netAmount || details.amount)}</p>
          <span>Requested: {formatCurrency(details.amount || 0)}</span>
          <span>
            Platform Fee ({Number(details.platformFeePercent || 0)}%):{" "}
            {formatCurrency(details.platformFeeAmount || 0)}
          </span>
          <span>
            Net Disbursement: {formatCurrency(details.netAmount || details.amount || 0)}
          </span>
          <span>Requested: {formatDateTime(details.createdAt)}</span>
          <span>Reviewed: {formatDateTime(details.reviewedAt)}</span>
          <span>Disbursed: {formatDateTime(details.disbursedAt)}</span>
          {details.disbursementReference && (
            <span>Ref: {details.disbursementReference}</span>
          )}
          {readablePaymentMode && <span>Mode: {readablePaymentMode}</span>}
          {details.utrNumber && <span>UTR: {details.utrNumber}</span>}
          {details.transactionId && <span>Txn ID: {details.transactionId}</span>}
          {proofImageUrl && (
            <span>
              Proof:{" "}
              <a href={proofImageUrl} target="_blank" rel="noreferrer">
                View Screenshot
              </a>
            </span>
          )}
        </section>

        <section className={styles.card}>
          <h3>Bank Account</h3>
          <p>{details?.bankDetails?.bankName || "-"}</p>
          <span>{details?.bankDetails?.accountHolderName || "-"}</span>
          <span>{details?.bankDetails?.accountNumber || "-"}</span>
          <span>{details?.bankDetails?.ifscCode || "-"}</span>
          <span>{details?.bankDetails?.branchName || "-"}</span>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.sectionHead}>
          <Landmark size={16} />
          <h3>Provider Financial Snapshot</h3>
        </div>
        <div className={styles.metrics}>
          <div>
            <span>Total Earnings</span>
            <strong>{formatCurrency(earningsSummary.totalEarnings || 0)}</strong>
          </div>
          <div>
            <span>Online Earnings</span>
            <strong>{formatCurrency(earningsSummary.onlineEarnings || 0)}</strong>
          </div>
          <div>
            <span>Offline Earnings</span>
            <strong>{formatCurrency(earningsSummary.offlineEarnings || 0)}</strong>
          </div>
          <div>
            <span>Reserved Payouts</span>
            <strong>{formatCurrency(payoutTotals.reservedAmount || 0)}</strong>
          </div>
          <div>
            <span>Disbursed</span>
            <strong>{formatCurrency(payoutTotals.disbursedAmount || 0)}</strong>
          </div>
          <div>
            <span>Available To Request</span>
            <strong>{formatCurrency(payoutTotals.availableToRequest || 0)}</strong>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h3>Update Status</h3>
        {businessDayNotice && <p className={styles.notice}>{businessDayNotice}</p>}
        {actionOptions.length === 0 ? (
          <p className={styles.notice}>No actions available for this status.</p>
        ) : (
          <>
            <div className={styles.formGrid}>
              <div>
                <Select
                  label="Next Status"
                  name="nextStatus"
                  value={selectedAction}
                  onChange={(event) => setSelectedAction(event.target.value)}
                  options={actionOptions}
                  placeholder="Select action"
                  fullWidth
                />
              </div>
              <div>
                <label>Disbursement Reference</label>
                <Input
                  value={disbursementReference}
                  onChange={(event) => setDisbursementReference(event.target.value)}
                  placeholder="Required for disbursed"
                  fullWidth
                />
              </div>
              <div>
                <Select
                  label="Payment Mode"
                  name="paymentMode"
                  value={paymentMode}
                  onChange={(event) => setPaymentMode(event.target.value)}
                  options={PAYMENT_MODE_OPTIONS}
                  placeholder="Select payment mode"
                  fullWidth
                />
              </div>
              <div>
                <label>UTR Number</label>
                <Input
                  value={utrNumber}
                  onChange={(event) => setUtrNumber(event.target.value)}
                  placeholder="Enter UTR number"
                  fullWidth
                />
              </div>
              <div>
                <label>Transaction ID</label>
                <Input
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                  placeholder="Optional transaction ID"
                  fullWidth
                />
              </div>
              <div>
                <label>Payment Proof Screenshot</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setProofFile(event.target.files?.[0] || null)
                  }
                  fullWidth
                />
              </div>
            </div>
            {proofImageUrl && (
              <p className={styles.notice}>
                Current proof uploaded.{" "}
                <a href={proofImageUrl} target="_blank" rel="noreferrer">
                  View image
                </a>
              </p>
            )}
            <div className={styles.formGroup}>
              <label>Admin Note</label>
              <Textarea
                className={styles.adminNoteField}
                rows={3}
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Optional note for provider"
                fullWidth
              />
            </div>
            <div className={styles.actions}>
              <Button
                variant="primary"
                size="md"
                onClick={handleUpdateStatus}
                disabled={saving}
              >
                <Send size={14} />
                {saving ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default PayoutDetails;
