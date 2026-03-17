export const PROVIDER_APPOINTMENT_EDIT_WINDOW_MS = 15 * 60 * 1000;

export const getFilterOptions = (activeTab) => [
  {
    id: "status",
    label: "Appointment Status",
    values:
      activeTab === "upcoming"
        ? [
            { id: "all", label: "All Active" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
          ]
        : [
            { id: "all", label: "All History" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
          ],
  },
  {
    id: "type",
    label: "Provider Type",
    values: [
      { id: "all", label: "All Types" },
      { id: "doctor", label: "Vet Doctor" },
      { id: "caretaker", label: "Caretaker" },
      { id: "shop", label: "Pet Shop" },
      { id: "ngo", label: "NGO" },
    ],
  },
];
