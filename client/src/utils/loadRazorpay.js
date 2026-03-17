// Dynamically load Razorpay checkout SDK when needed.
export default function loadRazorpay() {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  return new Promise((resolve, reject) => {
    try {
      const src = "https://checkout.razorpay.com/v1/checkout.js";
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (window.Razorpay) return resolve(window.Razorpay);
        existing.addEventListener("load", () => resolve(window.Razorpay));
        existing.addEventListener("error", () =>
          reject(new Error("Razorpay SDK failed to load")),
        );
        return;
      }

      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve(window.Razorpay);
      s.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.head.appendChild(s);
    } catch (err) {
      reject(err);
    }
  });
}
