import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/constants";

const useCoins = () => {
  const [balance, setBalance] = useState(0);
  const [rate, setRate] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setBalance(0);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/coins/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setBalance(0);
        return;
      }

      const data = await res.json();
      setBalance(Number(data.coins) || 0);
      setRate(Number(data.rate) || 10);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, rate, loading, refresh: fetchBalance };
};

export default useCoins;
