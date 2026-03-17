import React from "react";
import styles from "./detailProfile.module.css";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Store,
  Building2,
  Stethoscope,
  Home,
  Heart,
  Shield,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { BASE_URL } from "../../../../../../../utils/constants";

const DetailProfile = ({ userData, formatCurrency }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case "shop":
        return <Store size={24} />;
      case "hospital":
        return <Building2 size={24} />;
      case "doctor":
        return <Stethoscope size={24} />;
      case "daycare":
        return <Home size={24} />;
      case "caretaker":
        return <Heart size={24} />;
      case "ngo":
        return <Shield size={24} />;
      default:
        return <User size={24} />;
    }
  };

  const getStatusBadge = () => {
    if (userData.isArchived)
      return (
        <span className={`${styles.badge} ${styles.archived}`}>Archived</span>
      );
    switch (userData.kycStatus) {
      case "approved":
        return (
          <span className={`${styles.badge} ${styles.verified}`}>
            <CheckCircle2 size={14} /> Verified
          </span>
        );
      case "rejected":
        return (
          <span className={`${styles.badge} ${styles.rejected}`}>
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.pending}`}>
            <Clock size={14} /> Pending Verification
          </span>
        );
    }
  };

  return (
    <div className={styles.profileHeader}>
      <div className={styles.avatarArea}>
        {userData.avatar ? (
          <img
            src={`${BASE_URL}/uploads/avatars/${userData.avatar}`}
            alt={userData.name}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {userData.name?.[0].toUpperCase()}
          </div>
        )}
        <div className={`${styles.roleCircle} ${styles[userData.role]}`}>
          {getRoleIcon(userData.role)}
        </div>
      </div>

      <div className={styles.mainInfo}>
        <div className={styles.titleRow}>
          <h1>
            {userData.role === "doctor"
              ? ` ${userData.roleData?.doctorName || userData.name}`
              : userData.roleData?.shopName ||
                userData.roleData?.hospitalName ||
                userData.roleData?.daycareName ||
                userData.name}
          </h1>
          {getStatusBadge()}
        </div>
        <p className={styles.roleLabel}>{userData.role.toUpperCase()}</p>

        <div className={styles.contactGrid}>
          <div className={styles.contactItem}>
            <User size={16} /> <span>{userData.name}</span>
          </div>
          <div className={styles.contactItem}>
            <Mail size={16} /> <span>{userData.email}</span>
          </div>
          {userData.phone && (
            <div className={styles.contactItem}>
              <Phone size={16} /> <span>{userData.phone}</span>
            </div>
          )}
          {userData.lifetimeEarning !== undefined &&
            userData.role !== "user" && (
              <>
                <div
                  className={`${styles.contactItem} ${styles.earningItem}`}
                  title={`₹${(userData.lifetimeEarning || 0).toLocaleString()} (Total Gross)`}
                >
                  <div className={styles.earningIcon}>
                    <Heart size={14} fill="currentColor" />
                  </div>
                  <span className={styles.earningLabel}>Lifetime Earning:</span>
                  <span className={styles.earningValue}>
                    ₹{formatCurrency(userData.lifetimeEarning || 0)}
                  </span>
                </div>

                <div
                  className={styles.contactItem}
                  title={`₹${(userData.platformCut || 0).toLocaleString()} (Platform Fee${userData.platformFeePercent ? ` ${userData.platformFeePercent}%` : ""})`}
                >
                  <TrendingUp size={16} className={styles.feeIcon} />
                  <span className={styles.feeLabel}>Platform Fee:</span>
                  <span className={styles.feeValue}>
                    ₹{formatCurrency(userData.platformCut || 0)}
                  </span>
                </div>

                <div
                  className={styles.contactItem}
                  title={`₹${(userData.netEarning || 0).toLocaleString()} (Net Payable to Tenant)`}
                >
                  <CheckCircle2 size={16} className={styles.netIcon} />
                  <span className={styles.netLabel}>Net Payout:</span>
                  <span className={styles.netValue}>
                    ₹{formatCurrency(userData.netEarning || 0)}
                  </span>
                </div>
              </>
            )}
          <div className={styles.contactItem}>
            <Calendar size={16} />{" "}
            <span>
              Joined{" "}
              {new Date(userData.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProfile;
