import { Button } from "../../common";
import styles from "./QuantitySelector.module.css";
import { Minus, Plus, Loader2 } from "lucide-react";

const QuantitySelector = ({
  quantity,
  onIncrease,
  onDecrease,
  loading = false,
  max = 100,
  min = 1,
  className = "",
}) => {
  return (
    <div className={`${styles.quantityControl} ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          if (quantity > min) onDecrease();
        }}
        className={styles.qtyBtn}
        disabled={loading || quantity <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </Button>

      <div className={styles.quantity}>
        {loading ? <Loader2 size={12} className={styles.spinner} /> : quantity}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          if (quantity < max) onIncrease();
        }}
        className={styles.qtyBtn}
        disabled={loading || quantity >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </Button>
    </div>
  );
};

export default QuantitySelector;
