import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL, BASE_URL } from "../../../../utils/constants";
import { fetchPlatformFeeConfig } from "../../../../utils/platformFee";
import {
  buildProviderTimeGroups,
  normalizeTimeTo24h,
} from "../utils/bookingFlow.utils";

const useBookingResources = ({ providerId, providerType, selectedDate }) => {
  const [provider, setProvider] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [platformConfig, setPlatformConfig] = useState(null);
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState({});
  const [blockedDatesByDate, setBlockedDatesByDate] = useState({});
  const [isLoadingBookedSlots, setIsLoadingBookedSlots] = useState(false);

  const providerName = useMemo(() => {
    if (!provider) return "Service Provider";
    if (providerType === "doctor") {
      return provider.roleData?.doctorName || provider.name || "Vet Doctor";
    }
    if (providerType === "ngo") {
      return provider.businessName || provider.name || "NGO";
    }
    return (
      provider.roleData?.shopName ||
      provider.businessName ||
      provider.name ||
      "Service Provider"
    );
  }, [provider, providerType]);

  const providerMeta = useMemo(() => {
    if (!provider) return "";
    if (providerType === "doctor") {
      return provider.roleData?.doctorSpecialization || "Veterinarian";
    }
    if (providerType === "ngo") {
      return "Pet Adoption NGO";
    }
    return provider.roleData?.shopType || provider.role || "Pet Services";
  }, [provider, providerType]);

  const providerImage = useMemo(() => {
    if (!provider) return "";
    if (provider.avatar) {
      return `${BASE_URL}/uploads/avatars/${provider.avatar}`;
    }
    return (
      provider.roleData?.doctorImages?.[0] ||
      provider.roleData?.serviceImages?.[0] ||
      "https://via.placeholder.com/300"
    );
  }, [provider]);

  const providerDays = useMemo(
    () =>
      Array.isArray(provider?.availability?.days)
        ? provider.availability.days
        : [],
    [provider?.availability?.days],
  );

  const providerDaySet = useMemo(
    () =>
      new Set(
        providerDays
          .map((day) => String(day).trim().toLowerCase())
          .filter(Boolean),
      ),
    [providerDays],
  );

  const providerTimeGroups = useMemo(() => {
    if (provider?.availability?.available === false) {
      return [];
    }

    return (
      buildProviderTimeGroups(
        provider?.availability?.startTime,
        provider?.availability?.endTime,
      ) || undefined
    );
  }, [
    provider?.availability?.available,
    provider?.availability?.startTime,
    provider?.availability?.endTime,
  ]);

  const providerSlots = useMemo(
    () =>
      Array.isArray(providerTimeGroups)
        ? providerTimeGroups.flatMap((group) => group.slots || [])
        : [],
    [providerTimeGroups],
  );

  const bookedSlotsForSelectedDate = useMemo(
    () =>
      (bookedSlotsByDate?.[selectedDate] || [])
        .map((slot) => normalizeTimeTo24h(slot))
        .filter(Boolean),
    [bookedSlotsByDate, selectedDate],
  );

  const blockedDates = useMemo(
    () =>
      Object.entries(blockedDatesByDate)
        .filter(([, isBlocked]) => Boolean(isBlocked))
        .map(([dateValue]) => dateValue),
    [blockedDatesByDate],
  );

  const fetchBookedSlotsForDate = useCallback(
    async (targetDate, options = {}) => {
      const { signal } = options;
      if (!providerId || !targetDate) {
        return { slots: [], isDateBlocked: false };
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return { slots: [], isDateBlocked: false };

      try {
        const response = await fetch(
          `${API_BASE_URL}/appointments/booked-slots?providerId=${providerId}&date=${targetDate}&t=${Date.now()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal,
          },
        );

        if (!response.ok) return { slots: [], isDateBlocked: false };

        const data = await response.json();
        const slots = Array.isArray(data?.slots)
          ? data.slots.map((slot) => normalizeTimeTo24h(slot)).filter(Boolean)
          : [];
        const isDateBlocked = Boolean(data?.isDateBlocked);

        setBookedSlotsByDate((previous) => ({
          ...previous,
          [targetDate]: slots,
        }));
        setBlockedDatesByDate((previous) => ({
          ...previous,
          [targetDate]: isDateBlocked,
        }));

        return { slots, isDateBlocked };
      } catch (error) {
        if (!signal?.aborted) {
          console.error("Error fetching booked slots", error);
        }
        return { slots: [], isDateBlocked: false };
      }
    },
    [providerId],
  );

  const cacheBookedSlot = useCallback((date, time) => {
    const normalizedTime = normalizeTimeTo24h(time);
    if (!date || !normalizedTime) return;

    setBookedSlotsByDate((previous) => {
      const current = previous[date] || [];
      if (current.includes(normalizedTime)) return previous;

      return {
        ...previous,
        [date]: [...current, normalizedTime],
      };
    });
  }, []);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      try {
        const endpointByType = {
          caretaker: `caretaker/${providerId}`,
          daycare: `daycare/${providerId}`,
          doctor: `doctor/${providerId}`,
          shop: `shop/${providerId}`,
          ngo: `user/${providerId}`,
        };
        const endpoint = endpointByType[providerType] || `shop/${providerId}`;
        if (!endpoint) return;

        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) return;

        const data = await response.json();
        setProvider(data);
      } catch (error) {
        console.error("Error fetching provider details", error);
      }
    };

    const fetchUserPets = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/user-pets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const data = await response.json();
        setUserPets(data);
      } catch (error) {
        console.error("Error fetching user pets", error);
      }
    };

    fetchUserPets();
    fetchProviderDetails();
    fetchPlatformFeeConfig()
      .then((config) => setPlatformConfig(config))
      .catch(() => null);
  }, [providerId, providerType]);

  useEffect(() => {
    if (!providerId || !selectedDate) return;

    const controller = new AbortController();

    const fetchBookedSlots = async () => {
      setIsLoadingBookedSlots(true);
      try {
        await fetchBookedSlotsForDate(selectedDate, { signal: controller.signal });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingBookedSlots(false);
        }
      }
    };

    fetchBookedSlots();
    return () => controller.abort();
  }, [
    providerId,
    selectedDate,
    fetchBookedSlotsForDate,
  ]);

  return {
    provider,
    userPets,
    platformConfig,
    providerName,
    providerMeta,
    providerImage,
    providerDays,
    providerDaySet,
    providerTimeGroups,
    providerSlots,
    bookedSlotsForSelectedDate,
    bookedSlotsByDate,
    blockedDatesByDate,
    blockedDates,
    isLoadingBookedSlots,
    fetchBookedSlotsForDate,
    cacheBookedSlot,
  };
};

export default useBookingResources;
