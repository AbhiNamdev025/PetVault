export const getBookingTitles = (isContactFlow) => ({
  1: {
    title: "Choose Date and Time",
    subtitle: "Pick the most convenient slot first.",
  },
  2: {
    title: isContactFlow
      ? "Share Contact Information"
      : "Share Pet Information",
    subtitle: isContactFlow
      ? "Fill your details and reason for enquiry."
      : "Fill patient and issue details.",
  },
  3: {
    title: "Confirmation",
    subtitle: "Review details and apply coins before booking.",
  },
  4: {
    title: "Booking Confirmed",
    subtitle: "Your appointment request has been submitted.",
  },
});
