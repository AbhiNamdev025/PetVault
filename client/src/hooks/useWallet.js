import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/constants";

const useWallet = () => {
  const [balance, setBalance] = useState(0);
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

      const res = await fetch(`${API_BASE_URL}/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setBalance(0);
        return;
      }

      const data = await res.json();
      setBalance(Number(data.balance) || 0);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, refresh: fetchBalance };
};

export default useWallet;
