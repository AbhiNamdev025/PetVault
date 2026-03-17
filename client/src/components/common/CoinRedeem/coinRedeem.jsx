import React from "react";
import { PawPrint, Coins } from "lucide-react";
import styles from "./coinRedeem.module.css";
import { Button, Input } from "..";
const CoinRedeem = ({
  balance = 0,
  rate = 10,
  value = 0,
  maxCoins = 0,
  onChange,
  label = "Use Pet Vault Coins",
  helper,
}) => {
  const safeMax = Math.max(0, Number(maxCoins) || 0);
  const safeValue = Math.max(0, Math.min(Number(value) || 0, safeMax));
  const rupeeValue = (safeValue / rate).toFixed(2);
  const helperText = helper || `${rate} coins = ₹1`;
  const handleInput = (e) => {
    const raw = e.target.value;
    const next = Math.max(0, Math.floor(Number(raw) || 0));
    onChange?.(Math.min(next, safeMax));
  };
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <PawPrint size={16} />
        </div>
        <div>
          <h4>{label}</h4>
          <p>{helperText}</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.balance}>
          <Coins size={16} />
          <span>
            Balance: <strong>{balance}</strong> coins
          </span>
        </div>

        <div className={styles.inputRow}>
          <Input
            type="number"
            min="0"
            max={safeMax}
            step="1"
            inputMode="numeric"
            value={safeValue}
            onChange={handleInput}
            placeholder="0"
            fullWidth
          />
          <Button
            type="button"
            onClick={() => onChange?.(safeMax)}
            variant="secondary"
            size="sm"
          >
            Use Max
          </Button>
        </div>

        <div className={styles.meta}>
          <span>Max usable: {safeMax} coins</span>
          <span>Discount: ₹{rupeeValue}</span>
        </div>
      </div>
    </div>
  );
};
export default CoinRedeem;
