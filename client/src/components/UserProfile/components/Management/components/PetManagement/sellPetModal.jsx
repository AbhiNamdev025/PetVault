import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "./petManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { Button, Modal, Select } from "../../../../../common";

const formatCompletedAt = (value) => {
  if (!value) return "Unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

/* ── Reusable static info row ── */
const InfoRow = ({ label, value }) => (
  <div className={styles.infoDisplayRow}>
    <span className={styles.infoDisplayLabel}>{label}</span>
    <span className={styles.infoDisplayValue}>{value || "—"}</span>
  </div>
);

const SellPetModal = ({ pet, onClose, onSold, prefillUserId }) => {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isNgo = savedUser?.role === "ngo";
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(prefillUserId || "");
  const [loadingBuyers, setLoadingBuyers] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedBuyer = useMemo(
    () => buyers.find((buyer) => buyer.userId === selectedBuyerId) || null,
    [buyers, selectedBuyerId],
  );

  const buyerOptions = useMemo(
    () =>
      buyers.map((buyer) => ({
        label: `${buyer.name} • ${buyer.phone || buyer.email || "No contact"} • ${formatCompletedAt(buyer.latestCompletedAt)}`,
        value: buyer.userId,
      })),
    [buyers],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchEligibleBuyers = async () => {
      try {
        setLoadingBuyers(true);
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          toast.error("Please login to continue");
          onClose?.();
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/pets/${pet?._id}/eligible-buyers`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load completed bookings");
        }

        if (!isMounted) return;
        setBuyers(Array.isArray(data?.buyers) ? data.buyers : []);
      } catch (error) {
        if (!isMounted) return;
        toast.error(error.message || "Unable to load eligible users");
        setBuyers([]);
      } finally {
        if (isMounted) setLoadingBuyers(false);
      }
    };

    fetchEligibleBuyers();
    return () => {
      isMounted = false;
    };
  }, [pet?._id, onClose]);

  const submit = async () => {
    if (!selectedBuyerId) {
      toast.error("Please select a user");
      return;
    }

    try {
      setSaving(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/pets/${pet?._id}/sell`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedBuyerId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Failed to mark pet as sold");

      toast.success(data.message || "Pet marked as sold");
      onSold?.();
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Failed to mark pet as sold");
    } finally {
      setSaving(false);
    }
  };

  const hasEligibleBuyers = buyers.length > 0;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${isNgo ? "Adopt Out" : "Sell"} — ${pet?.name || "Pet"}`}
      size="md"
      hideContentPadding
      contentClassName={styles.modalContent}
      footer={
        <div className={styles.modalFooter}>
          <Button
            onClick={onClose}
            className={styles.cancelBtn}
            variant="ghost"
            size="md"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            className={styles.submitBtn}
            variant="primary"
            size="md"
            disabled={
              saving || loadingBuyers || !hasEligibleBuyers || !selectedBuyerId
            }
          >
            {saving ? "Saving…" : isNgo ? "Mark as Adopted" : "Mark as Sold"}
          </Button>
        </div>
      }
    >
      {/* ── Static pet info ── */}
      <div className={styles.infoDisplayGroup}>
        <div className={styles.row}>
          <InfoRow label="Pet Name" value={pet?.name} />
          <InfoRow label="Type" value={pet?.type} />
        </div>
        <InfoRow
          label="Category"
          value={capitalize(pet?.category) || (isNgo ? "Adoption" : undefined)}
        />
      </div>

      {/* ── Buyer selector ── */}
      <div className={styles.formGroup}>
        {prefillUserId ? (
          <InfoRow
            label={isNgo ? "Adopt To" : "Sell To"}
            value={selectedBuyer?.name || "Loading user…"}
          />
        ) : (
          <Select
            label={isNgo ? "Adopt To" : "Sell To"}
            placeholder={loadingBuyers ? "Loading users…" : "Select user"}
            value={selectedBuyerId}
            onChange={(e) => setSelectedBuyerId(e.target.value)}
            options={buyerOptions}
            disabled={loadingBuyers || saving}
            helperText="Only users with completed bookings for this pet are shown."
            fullWidth
            className={`${styles.formGroup} ${styles.selectControl}`}
          />
        )}
      </div>

      {/* ── Empty state ── */}
      {!loadingBuyers && !hasEligibleBuyers && (
        <div className={styles.emptyHint}>
          No completed bookings found for this pet yet.
        </div>
      )}

      {/* ── Selected buyer summary ── */}
      {selectedBuyer && (
        <div className={styles.buyerSummary}>
          <p className={styles.buyerSummaryTitle}>Selected User</p>
          <p className={styles.buyerSummaryLine}>{selectedBuyer.name}</p>
          <p className={styles.buyerSummaryLine}>
            {selectedBuyer.phone || selectedBuyer.email || "No contact info"}
          </p>
          <p className={styles.buyerSummaryMeta}>
            Completed bookings: {selectedBuyer.appointmentCount}
          </p>
        </div>
      )}
    </Modal>
  );
};

export default SellPetModal;
