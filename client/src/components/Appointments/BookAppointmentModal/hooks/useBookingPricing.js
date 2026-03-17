import { useEffect, useMemo, useState } from "react";
import useCoins from "../../../../hooks/useCoins";
import {
  getPlatformFeePercent,
  roundCurrency,
} from "../../../../utils/platformFee";
import {
  APPOINTMENT_MAX_COINS_ABS,
  APPOINTMENT_MAX_PERCENT,
} from "../config";

const clampCoins = (value, balance, maxCoins) =>
  Math.max(0, Math.min(Number(value) || 0, Number(balance) || 0, maxCoins));

const useBookingPricing = ({
  provider,
  providerType,
  platformConfig,
  billingUnits = 1,
}) => {
  const { balance: coinBalance, rate: coinRate } = useCoins();
  const [coinsToUse, setCoinsToUse] = useState(0);

  const pricing = useMemo(() => {
    const unitProviderFee =
      provider?.roleData?.consultationFee ||
      provider?.roleData?.hourlyRate ||
      provider?.roleData?.charges ||
      0;
    const safeBillingUnits = Math.max(1, Number(billingUnits) || 1);
    const providerFee = roundCurrency(unitProviderFee * safeBillingUnits);

    const feePercent = getPlatformFeePercent(
      provider?.role || providerType,
      platformConfig,
    );
    const platformFee = roundCurrency((providerFee * feePercent) / 100);
    const totalPayable = roundCurrency(providerFee + platformFee);

    const maxCoinsByPercent = Math.floor(
      totalPayable * (coinRate || 10) * (APPOINTMENT_MAX_PERCENT / 100),
    );

    const maxCoins = Math.min(
      maxCoinsByPercent,
      APPOINTMENT_MAX_COINS_ABS,
      Math.max(0, Number(coinBalance) || 0),
    );

    const safeCoins = clampCoins(coinsToUse, coinBalance, maxCoins);
    const coinDiscount = roundCurrency(safeCoins / (coinRate || 10));
    const finalPayable = roundCurrency(
      Math.max(0, totalPayable - coinDiscount),
    );

    return {
      unitProviderFee,
      billingUnits: safeBillingUnits,
      providerFee,
      feePercent,
      platformFee,
      totalPayable,
      maxCoins,
      safeCoins,
      coinDiscount,
      finalPayable,
    };
  }, [
    billingUnits,
    coinBalance,
    coinRate,
    coinsToUse,
    platformConfig,
    provider,
    providerType,
  ]);

  useEffect(() => {
    if (coinsToUse !== pricing.safeCoins) {
      setCoinsToUse(pricing.safeCoins);
    }
  }, [coinsToUse, pricing.safeCoins]);

  return {
    coinBalance,
    coinRate,
    coinsToUse,
    setCoinsToUse,
    ...pricing,
  };
};

export default useBookingPricing;
