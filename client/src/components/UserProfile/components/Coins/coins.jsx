import React, { useEffect, useState } from "react";
import styles from "./coins.module.css";
import {
  PawPrint,
  Coins as CoinIcon,
  Sparkles,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../../../../utils/constants";
import useCoins from "../../../../hooks/useCoins";
import { Button } from "../../../common";
const UserCoins = () => {
  const { balance, rate, loading: balanceLoading, refresh } = useCoins();
  const [ledger, setLedger] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const INITIAL_LIMIT = 6;
  const fetchLedger = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/coins/ledger`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setLedger(data.ledger || []);
    } catch (err) {
      console.error("Ledger fetch error:", err);
    } finally {
      setLoadingLedger(false);
    }
  };
  useEffect(() => {
    fetchLedger();
  }, []);
  const rupeeValue = (balance / (rate || 10)).toFixed(2);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refresh(), fetchLedger()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };
  const formatNote = (note, sourceType) => {
    if (!note) return sourceType || "Coins reward";

    // If note is a long hex ID (MongoDB ObjectId pattern)
    if (/^[0-9a-fA-F]{24}$/.test(note)) {
      return `Service Booking (${sourceType || "Activity"})`;
    }

    // Clean up "Appointment for ..." strings if they contain IDs
    return note.replace(/[0-9a-fA-F]{24}/g, "...");
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <div>
            <h2>Pet Vault Coins</h2>
            <p>Use coins for bookings, products, and services.</p>
          </div>
        </div>
        <Button
          className={styles.refreshBtn}
          onClick={handleRefresh}
          variant="ghost"
          size="md"
          title="Refresh balance"
        >
          <RefreshCw
            size={18}
            className={isRefreshing ? styles.spinning : ""}
          />
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGold}`}>
            <CoinIcon size={18} />
          </div>
          <div>
            <p>Available Coins</p>
            <h3>{balanceLoading ? "…" : balance}</h3>
            <span>₹{rupeeValue} value</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <Sparkles size={18} />
          </div>
          <div>
            <p>Conversion Rate</p>
            <h3>
              {rate} <span>coins</span>
            </h3>
            <span>₹1 value</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <ArrowDownRight size={18} />
          </div>
          <div>
            <p>Rewarding Logic</p>
            <h3>First + Random</h3>
            <span>After completion</span>
          </div>
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.ledgerHeader}>
          <h3>Recent Activity</h3>
          <p>
            First order, appointment, and adoption earn 10 coins. Random rewards
            apply after completion at 5% (max 100 coins). Coins used in
            cancelled orders/appointments are refunded automatically.
          </p>
        </div>

        {loadingLedger ? (
          <div className={styles.loading}>Loading activity…</div>
        ) : ledger.length === 0 ? (
          <div className={styles.empty}>No coin activity yet.</div>
        ) : (
          <>
            <div className={styles.ledgerList}>
              {(isExpanded ? ledger : ledger.slice(0, INITIAL_LIMIT)).map(
                (item) => {
                  const amountValue = Number(item.amount) || 0;
                  const isAdjustment = item.type === "adjust";
                  const isEarn =
                    item.type === "earn" || (isAdjustment && amountValue > 0);
                  const tagLabel = isAdjustment
                    ? amountValue > 0
                      ? "Refunded"
                      : "Adjusted"
                    : isEarn
                      ? "Earned"
                      : "Spent";
                  return (
                    <div className={styles.ledgerRow} key={item._id}>
                      <div className={styles.ledgerLeft}>
                        <span
                          className={`${styles.tag} ${isEarn ? styles.earn : styles.spend}`}
                        >
                          {tagLabel}
                        </span>
                        <div>
                          <p>{formatNote(item.note, item.sourceType)}</p>
                          <span>{formatDateTime(item.createdAt)}</span>
                        </div>
                      </div>
                      <div
                        className={`${styles.amount} ${isEarn ? styles.earn : styles.spend}`}
                      >
                        {isEarn ? "+" : ""}
                        {amountValue} coins
                      </div>
                    </div>
                  );
                },
              )}
            </div>
            {ledger.length > INITIAL_LIMIT && (
              <Button
                className={styles.showMoreBtn}
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
              >
                {isExpanded ? (
                  <>
                    Show Less <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Show More ({ledger.length - INITIAL_LIMIT} more){" "}
                    <ChevronDown size={16} />
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default UserCoins;
