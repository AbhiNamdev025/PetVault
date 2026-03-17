import { useMemo } from "react";
import { getProviderInfo } from "../utils/appointmentUtils";
import { BASE_URL } from "../../../../../utils/constants";

export const useAppointmentFiltering = (appointments, activeTab, filters) => {
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      let matchesTab = false;
      if (activeTab === "upcoming") {
        matchesTab = appt.status !== "completed" && appt.status !== "cancelled";
      } else {
        matchesTab = appt.status === "completed" || appt.status === "cancelled";
      }
      if (!matchesTab) return false;

      const query = (filters.search || "").toLowerCase();
      const { providerName, providerSpec } = getProviderInfo(appt, BASE_URL);

      const safeProviderName = (providerName || "").toLowerCase();
      const safeProviderSpec = (providerSpec || "").toLowerCase();
      const safePetName = (
        appt.petName ||
        appt.pet?.name ||
        appt.petId?.name ||
        ""
      ).toLowerCase();
      const safeUserName = (
        appt.userName ||
        appt.user?.name ||
        appt.userId?.name ||
        ""
      ).toLowerCase();
      const safeUserEmail = (
        appt.user?.email ||
        appt.userId?.email ||
        ""
      ).toLowerCase();
      const safeService = (
        appt.serviceType ||
        appt.service ||
        ""
      ).toLowerCase();
      const safeReason = (appt.reason || appt.healthIssues || "").toLowerCase();
      const safeAppointmentId = (appt._id || "").toLowerCase();

      const matchesSearch =
        !query ||
        safeProviderName.includes(query) ||
        safeProviderSpec.includes(query) ||
        safePetName.includes(query) ||
        safeUserName.includes(query) ||
        safeUserEmail.includes(query) ||
        safeService.includes(query) ||
        safeReason.includes(query) ||
        safeAppointmentId.includes(query);

      const matchesType =
        filters.type === "all" || appt.providerType === filters.type;

      const matchesStatus =
        filters.status === "all" || appt.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [appointments, activeTab, filters]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.status !== "all";

  return { filteredAppointments, hasActiveFilters };
};
