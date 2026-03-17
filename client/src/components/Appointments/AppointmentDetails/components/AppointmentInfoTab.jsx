import React, { useState, useCallback } from "react";
import {
  AlertCircle,
  Calendar,
  ClipboardList,
  FileText,
  PawPrint,
  Phone,
  Stethoscope,
  User,
  CreditCard,
  Hash,
  Copy,
  CheckCheck,
  ShieldCheck,
  Coins,
  Wallet as WalletIcon,
  RotateCcw,
} from "lucide-react";
import styles from "../../appointmentDetailsModal.module.css";
import { BASE_URL } from "../../../../utils/constants";
import { getPaymentSummary } from "../utils/appointmentDetails.utils";

const sectionSpacing = { marginTop: "var(--space-4)" };

const AppointmentInfoTab = ({
  appointment,
  provider,
  providerName,
  isMedical,
  providerLabel = "Provider",
  reasonLabel = "Service Request",
  isAdminView = false,
}) => {
  const [copied, setCopied] = useState(null);
  const copyToClipboard = useCallback((text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const payment = getPaymentSummary(appointment);
  const appointmentId = appointment?._id
    ? `#${String(appointment._id).toUpperCase()}`
    : "N/A";
  const serviceLabel = String(appointment?.service || "service").toUpperCase();

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const AuditRow = ({ icon, label, value, copyKey, mono = false }) => {
    if (!value) return null;
    return (
      <div className={styles.auditRow}>
        <span className={styles.auditIcon}>{icon}</span>
        <span className={styles.auditLabel}>{label}</span>
        <span
          className={`${styles.auditValue} ${mono ? styles.monoValue : ""}`}
        >
          {value}
          {copyKey && (
            <button
              className={styles.copyBtn}
              title="Copy"
              onClick={() => copyToClipboard(value, copyKey)}
            >
              {copied === copyKey ? (
                <CheckCheck size={10} />
              ) : (
                <Copy size={10} />
              )}
            </button>
          )}
        </span>
      </div>
    );
  };

  if (isAdminView) {
    const hasGatewayIds =
      appointment.paymentInfo?.razorpay_payment_id ||
      appointment.paymentInfo?.razorpay_order_id ||
      appointment.paymentInfo?.utrNumber ||
      appointment.paymentInfo?.razorpay_signature;

    return (
      <>
        <div className={styles.mainGrid}>
          <div className={styles.glassCard}>
            <h3 className={styles.cardTitle}>Admin Snapshot</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <ClipboardList size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Appointment ID</p>
                  <p className={styles.value}>{appointmentId}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <Calendar size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Service Type</p>
                  <p className={styles.value}>{serviceLabel}</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                {isMedical ? <Stethoscope size={18} /> : <User size={18} />}
                <div className={styles.infoText}>
                  <p className={styles.label}>{providerLabel}</p>
                  <p className={styles.value}>{providerName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.glassCard}>
            <h3 className={styles.cardTitle}>Costs & Totals</h3>
            {payment.hasPayment ? (
              <>
                <div className={styles.feeRow}>
                  <span>Service Fee</span>
                  <span>₹{payment.baseFee.toFixed(2)}</span>
                </div>
                <div className={styles.feeRow}>
                  <span>Platform Fee</span>
                  <span>₹{payment.platformFee.toFixed(2)}</span>
                </div>
                {payment.coinsValue > 0 && (
                  <div className={styles.feeRow}>
                    <span>Coins Used</span>
                    <span>-₹{payment.coinsValue.toFixed(2)}</span>
                  </div>
                )}
                <div className={styles.totalRow}>
                  <span>Total Amount</span>
                  <span className={styles.totalValue}>
                    ₹{payment.totalPayable.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.noPaymentNotice}>
                No financial record for this appointment type.
              </div>
            )}
          </div>
        </div>

        {payment.hasPayment && (
          <div
            className={`${styles.glassCard} ${styles.fullWidthCard}`}
            style={sectionSpacing}
          >
            <h3 className={styles.cardTitle}>Payment Audit Trail</h3>

            <div className={styles.paymentFlex}>
              <div className={styles.paymentMethod}>
                <CreditCard size={18} />
                <span>{payment.paymentMethod}</span>
                <span
                  className={`${styles.paymentStatus} ${styles[String(appointment.paymentStatus).toLowerCase()]}`}
                >
                  {payment.paymentStatus}
                </span>
              </div>
              {appointment.paidAt && (
                <div className={styles.paidOnChip}>
                  <Calendar size={11} />
                  <span>Paid {fmtDate(appointment.paidAt)}</span>
                </div>
              )}
            </div>

            {hasGatewayIds && (
              <p className={styles.auditSectionLabel}>
                <ShieldCheck size={10} /> Gateway & Audit IDs
              </p>
            )}
            <AuditRow
              icon={<Hash size={16} />}
              label="Razorpay Payment ID"
              value={appointment.paymentInfo?.razorpay_payment_id}
              copyKey="pay_id"
              mono
            />
            <AuditRow
              icon={<Hash size={16} />}
              label="Razorpay Order ID"
              value={appointment.paymentInfo?.razorpay_order_id}
              copyKey="rp_order"
              mono
            />
            <AuditRow
              icon={<Hash size={16} />}
              label="UTR Number"
              value={appointment.paymentInfo?.utrNumber}
              copyKey="utr"
              mono
            />
            {appointment.paymentInfo?.razorpay_signature && (
              <div className={styles.auditRow}>
                <span className={styles.auditIcon}>
                  <ShieldCheck size={16} />
                </span>
                <span className={styles.auditLabel}>Signature Verified</span>
                <span className={`${styles.auditValue} ${styles.verifiedTag}`}>
                  ✓ Yes
                </span>
              </div>
            )}

            {(payment.coinsRefunded > 0 ||
              payment.onlineRefundedToWallet > 0) && (
              <p className={styles.auditSectionLabel}>
                <RotateCcw size={10} /> Refunds & Reversals
              </p>
            )}
            <AuditRow
              icon={<Coins size={16} />}
              label="Coins Refunded"
              value={
                payment.coinsRefunded > 0
                  ? `₹${payment.coinsRefunded.toFixed(2)}`
                  : null
              }
            />
            <AuditRow
              icon={<WalletIcon size={16} />}
              label="Refunded to Wallet"
              value={
                payment.onlineRefundedToWallet > 0
                  ? `₹${payment.onlineRefundedToWallet.toFixed(2)}`
                  : null
              }
            />
          </div>
        )}

        <div className={styles.glassCard} style={sectionSpacing}>
          <h3 className={styles.cardTitle}>Pet Details</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <PawPrint size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Pet Name</p>
                <p className={styles.value}>{appointment?.petName || "N/A"}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <PawPrint size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Type / Breed</p>
                <p className={styles.value}>
                  {appointment?.petType || "Unknown"} •{" "}
                  {appointment?.petId?.breed ||
                    appointment?.petBreed ||
                    "Not specified"}
                </p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Phone size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Contact Reference</p>
                <p className={styles.value}>
                  {provider?.phone || appointment?.parentPhone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {appointment?.status === "cancelled" && (
          <div className={styles.glassCard} style={sectionSpacing}>
            <h3 className={styles.cardTitle}>Cancellation Details</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <AlertCircle size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Cancelled By</p>
                  <p className={styles.value}>
                    {appointment.cancelledBy === "user"
                      ? "User"
                      : appointment.cancelledBy === "admin"
                        ? "Administrator"
                        : "Provider"}
                  </p>
                </div>
              </div>
              {appointment.cancellationReason && (
                <div className={styles.infoItem}>
                  <FileText size={18} />
                  <div className={styles.infoText}>
                    <p className={styles.label}>Reason</p>
                    <p className={styles.value}>
                      {appointment.cancellationReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.mainGrid}>
        <div className={styles.glassCard}>
          <h3 className={styles.cardTitle}>Information Details</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <PawPrint size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Pet Name</p>
                <p className={styles.value}>{appointment?.petName}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              {isMedical ? <Stethoscope size={18} /> : <User size={18} />}
              <div className={styles.infoText}>
                <p className={styles.label}>{providerLabel}</p>
                <p className={styles.value}>{providerName}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <Phone size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Contact Reference</p>
                <p className={styles.value}>
                  {provider?.phone || appointment?.parentPhone}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.glassCard}>
          <h3 className={styles.cardTitle}>Schedule & Request</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <Calendar size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>{reasonLabel}</p>
                <p className={styles.value}>
                  {appointment?.reason || "Not provided"}
                </p>
              </div>
            </div>
            {appointment?.healthIssues && (
              <div className={styles.infoItem}>
                <AlertCircle size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Health Issues</p>
                  <p className={styles.value}>{appointment.healthIssues}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(appointment?.doctorNotes ||
        appointment?.serviceNotes ||
        appointment?.diagnosis) && (
        <div className={styles.glassCard} style={sectionSpacing}>
          <h3 className={styles.cardTitle}>Observations & Notes</h3>
          <div className={styles.infoList}>
            {appointment?.diagnosis && (
              <div className={styles.infoItem}>
                <ClipboardList size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Diagnosis</p>
                  <p className={styles.value}>{appointment.diagnosis}</p>
                </div>
              </div>
            )}
            {(appointment?.doctorNotes || appointment?.serviceNotes) && (
              <div className={styles.infoItem}>
                <FileText size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Internal Remarks</p>
                  <p className={styles.value}>
                    {appointment?.doctorNotes || appointment?.serviceNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.glassCard} style={sectionSpacing}>
        <h3 className={styles.cardTitle}>Payment Details</h3>
        {payment.hasPayment ? (
          <>
            <div className={styles.feeRow}>
              <span>Payment Method</span>
              <span>{payment.paymentMethod}</span>
            </div>
            <div className={styles.feeRow}>
              <span>Payment Status</span>
              <span>{payment.paymentStatus}</span>
            </div>
            <div className={styles.subtotalRow}>
              <span>Service Base Fee</span>
              <span>₹{payment.baseFee.toFixed(2)}</span>
            </div>
            <div className={styles.feeRow}>
              <span>Platform Fee</span>
              <span>₹{payment.platformFee.toFixed(2)}</span>
            </div>
            {payment.coinsValue > 0 && (
              <div className={styles.feeRow}>
                <span>Coins Discount</span>
                <span>-₹{payment.coinsValue.toFixed(2)}</span>
              </div>
            )}
            {payment.coinsRefunded > 0 && (
              <div className={styles.feeRow}>
                <span>Coins Refunded</span>
                <span>+₹{payment.coinsRefunded.toFixed(2)}</span>
              </div>
            )}
            {payment.onlineRefundedToWallet > 0 && (
              <div className={styles.feeRow}>
                <span>Online Refunded to Wallet</span>
                <span>+₹{payment.onlineRefundedToWallet.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>Grand Total</span>
              <span className={styles.totalValue}>
                ₹{payment.totalPayable.toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <div className={styles.noPaymentNotice}>
            No financial record for this appointment type.
          </div>
        )}
      </div>

      {appointment?.status === "cancelled" && (
        <div className={styles.glassCard} style={sectionSpacing}>
          <h3 className={styles.cardTitle}>Cancellation Details</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <AlertCircle size={18} />
              <div className={styles.infoText}>
                <p className={styles.label}>Cancelled By</p>
                <p className={styles.value}>
                  {appointment.cancelledBy === "user"
                    ? "User"
                    : appointment.cancelledBy === "admin"
                      ? "Administrator"
                      : "Provider"}
                </p>
              </div>
            </div>
            {appointment.cancellationReason && (
              <div className={styles.infoItem}>
                <FileText size={18} />
                <div className={styles.infoText}>
                  <p className={styles.label}>Reason</p>
                  <p className={styles.value}>
                    {appointment.cancellationReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {Array.isArray(appointment?.petImages) &&
        appointment.petImages.length > 0 && (
          <div className={styles.glassCard} style={sectionSpacing}>
            <h3 className={styles.cardTitle}>Pet Media / Evidence</h3>
            <div className={styles.imageGallery}>
              {appointment.petImages.map((img, idx) => (
                <img
                  key={`${img}-${idx}`}
                  src={`${BASE_URL}/uploads/appointments/${img}`}
                  alt="Pet"
                  className={styles.galleryImg}
                />
              ))}
            </div>
          </div>
        )}
    </>
  );
};

export default AppointmentInfoTab;
