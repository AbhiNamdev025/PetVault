import React from "react";
import { Check } from "lucide-react";
import { Select } from "../../../../common";
import {
  toDisplayDate,
  toDisplayTime,
} from "../../../../common/AppointmentFlow/appointmentFlow.utils";
import flowStyles from "../../../../common/AppointmentFlow/appointmentFlow.module.css";

const AppointmentReviewStep = ({
  providerName,
  formData,
  isContactFlow,
  resolvedPetName,
  resolvedPetType,
  coinBalance = 0,
  coinRate = 10,
  coinsToUse = 0,
  setCoinsToUse,
  feePercent = 0,
  platformFee = 0,
  totalPayable = 0,
  maxCoins = 0,
  coinDiscount = 0,
  providerFee,
  finalPayable,
  paymentMethod = "Cash",
  onPaymentMethodChange,
  showPaymentMethod = false,
}) => {
  const isOtherPetType =
    String(formData.petType || "").trim().toLowerCase() === "other" &&
    String(formData.otherPetType || "").trim();
  const petTypeLabel = isOtherPetType
    ? `Other (${String(formData.otherPetType || "").trim()})`
    : resolvedPetType;
  const reasonLabel = (formData.reason || "").trim() || "No additional notes provided.";
  const showPricing = Number(providerFee) > 0 || Number(totalPayable) > 0;
  const safeCoinsToUse = Math.max(0, Number(coinsToUse) || 0);
  const safeMaxCoins = Math.max(0, Number(maxCoins) || 0);
  const safeCoinRate = Math.max(1, Number(coinRate) || 10);
  const toMoney = (value) => `₹${Number(value || 0).toFixed(2)}`;
  const handleCoinChange = (event) => {
    if (typeof setCoinsToUse !== "function") return;
    const parsed = Number.parseInt(event.target.value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setCoinsToUse(0);
      return;
    }
    setCoinsToUse(Math.min(parsed, safeMaxCoins));
  };

  return (
    <div className={flowStyles.reviewGridTwoCol}>
      <div className={flowStyles.reviewItem}>
        <p className={flowStyles.reviewLabel}>Provider</p>
        <p className={flowStyles.reviewValue}>{providerName}</p>
      </div>

      <div className={flowStyles.reviewItem}>
        <p className={flowStyles.reviewLabel}>Service</p>
        <p className={flowStyles.reviewValue}>{formData.service || "Appointment"}</p>
      </div>

      {isContactFlow ? (
        <div className={flowStyles.reviewItem}>
          <p className={flowStyles.reviewLabel}>Name</p>
          <p className={flowStyles.reviewValue}>{formData.contactName}</p>
        </div>
      ) : (
        <div className={flowStyles.reviewItem}>
          <p className={flowStyles.reviewLabel}>Patient</p>
          <p className={flowStyles.reviewValue}>
            {resolvedPetName} ({petTypeLabel})
          </p>
        </div>
      )}

      <div className={flowStyles.reviewItem}>
        <p className={flowStyles.reviewLabel}>{isContactFlow ? "Mobile" : "Contact"}</p>
        <p className={flowStyles.reviewValue}>{formData.parentPhone}</p>
      </div>

      {isContactFlow && (
        <div className={flowStyles.reviewItem}>
          <p className={flowStyles.reviewLabel}>Email</p>
          <p className={flowStyles.reviewValue}>{formData.contactEmail}</p>
        </div>
      )}

      <div className={flowStyles.reviewItem}>
        <p className={flowStyles.reviewLabel}>Date & Time</p>
        <p className={flowStyles.reviewValue}>
          {toDisplayDate(formData.date)} • {toDisplayTime(formData.time)}
        </p>
      </div>

      <div className={flowStyles.reviewItem}>
        <p className={flowStyles.reviewLabel}>{isContactFlow ? "Enquiry" : "Reason"}</p>
        <p className={flowStyles.reviewValue}>{reasonLabel}</p>
      </div>

      {!isContactFlow && formData.healthIssues && (
        <div className={flowStyles.reviewItem}>
          <p className={flowStyles.reviewLabel}>Health Issues</p>
          <p className={flowStyles.reviewValue}>{formData.healthIssues}</p>
        </div>
      )}

      {showPricing && (
        <div className={`${flowStyles.coinsCard} ${flowStyles.reviewFullWidth}`}>
          <div className={flowStyles.coinsHeader}>
            <h4 className={flowStyles.coinsTitle}>Apply Pet Vault Coins</h4>
            <p className={flowStyles.coinsSubTitle}>
              {safeCoinRate} coins = ₹1
            </p>
          </div>
          <p className={flowStyles.coinsBalance}>
            Balance: <strong>{Math.max(0, Number(coinBalance) || 0)}</strong> coins
          </p>
          <div className={flowStyles.coinsInputRow}>
            <input
              type="number"
              min={0}
              max={safeMaxCoins}
              value={safeCoinsToUse}
              onChange={handleCoinChange}
              className={flowStyles.coinsInput}
              disabled={safeMaxCoins <= 0}
            />
            <button
              type="button"
              className={flowStyles.useMaxBtn}
              onClick={() => setCoinsToUse?.(safeMaxCoins)}
              disabled={safeMaxCoins <= 0}
            >
              Use Max
            </button>
          </div>
          <div className={flowStyles.coinsMetaRow}>
            <span>Max usable: {safeMaxCoins} coins</span>
            <span>Discount: {toMoney(coinDiscount)}</span>
          </div>
        </div>
      )}

      {showPaymentMethod && (
        <div className={`${flowStyles.reviewItem} ${flowStyles.reviewFullWidth}`}>
          <Select
            label="Payment Method"
            name="paymentMethod"
            value={paymentMethod}
            onChange={(event) => onPaymentMethodChange?.(event.target.value)}
            options={[
              { value: "Cash", label: "Cash" },
              { value: "Online", label: "Online" },
            ]}
            placeholder="Select payment method"
            fullWidth
          />
        </div>
      )}

      {showPricing && (
        <div className={`${flowStyles.feeCard} ${flowStyles.reviewFullWidth}`}>
          <h4 className={flowStyles.feeTitle}>Fee Breakdown</h4>
          <div className={flowStyles.feeRow}>
            <span>Service Fee</span>
            <span>{toMoney(providerFee)}</span>
          </div>
          <div className={flowStyles.feeRow}>
            <span>Platform Fee ({Number(feePercent || 0)}%)</span>
            <span>{toMoney(platformFee)}</span>
          </div>
          <div className={flowStyles.feeRow}>
            <span>Subtotal</span>
            <span>{toMoney(totalPayable)}</span>
          </div>
          <div className={flowStyles.feeRow}>
            <span>Coins Discount</span>
            <span>-{toMoney(coinDiscount)}</span>
          </div>
          <div className={`${flowStyles.feeRow} ${flowStyles.feeTotal}`}>
            <span>Total Payable</span>
            <span>{toMoney(finalPayable)}</span>
          </div>
        </div>
      )}

      <div className={`${flowStyles.checkList} ${flowStyles.reviewFullWidth}`}>
        <div className={flowStyles.checkItem}>
          <Check size={15} /> Provider receives this request instantly.
        </div>
        <div className={flowStyles.checkItem}>
          <Check size={15} /> You can track status from your appointments.
        </div>
        {showPaymentMethod && paymentMethod === "Online" && (
          <div className={flowStyles.checkItem}>
            <Check size={15} /> Online payments confirm booking automatically after successful payment.
          </div>
        )}
        <div className={flowStyles.checkItem}>
          <Check size={15} /> If cancelled, applied coins are refunded automatically.
        </div>
      </div>
    </div>
  );
};

export default AppointmentReviewStep;
