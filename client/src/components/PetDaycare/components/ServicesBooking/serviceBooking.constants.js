export const petOptions = [
  { value: "Dog", label: "Dog", icon: "PawPrint" },
  { value: "Cat", label: "Cat", icon: "Cat" },
  { value: "Bird", label: "Bird", icon: "Feather" },
  { value: "Other", label: "Other", icon: "HelpCircle" },
];

export const serviceOptions = [
  { value: "daycare", label: "Daycare" },
  { value: "grooming", label: "Grooming" },
  { value: "training", label: "Training" },
  { value: "boarding", label: "Boarding" },
  { value: "others", label: "Others" },
];

export const BOOKING_STEPS = [
  { id: "schedule", label: "Schedule" },
  { id: "details", label: "Pet Details" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export const BOOKING_WINDOW_DAYS = 7;
export const MAX_DAYCARE_SELECTED_DAYS = 4;

export const VALID_PROVIDER_TYPES = new Set([
  "caretaker",
  "doctor",
  "shop",
  "ngo",
]);

export const DEFAULT_PROVIDER_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/1946/1946429.png";
