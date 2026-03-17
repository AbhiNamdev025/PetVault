import React, { useEffect, useState } from "react";
import styles from "./appointmentFlow.module.css";
import { AppointmentStepper } from "./components";
import { Button } from "..";
const AppointmentFlow = ({
  steps,
  currentStep,
  title,
  subtitle,
  isSubmitting = false,
  onBack,
  onNext,
  onConfirm,
  children,
  nextLabel = "Continue",
  confirmLabel = "Confirm Booking"
}) => {
  const [compactButtons, setCompactButtons] = useState(() => typeof window !== "undefined" && window.innerWidth <= 680);
  useEffect(() => {
    const onResize = () => setCompactButtons(window.innerWidth <= 680);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isSuccessStep = currentStep >= steps.length;
  const isReviewStep = currentStep === steps.length - 1;
  return <div className={styles.flowShell}>
      <header className={styles.flowHeader}>
        <AppointmentStepper steps={steps} currentStep={currentStep} />
        {title && <h3 className={styles.flowTitle}>{title}</h3>}
        {subtitle && <p className={styles.flowSubtitle}>{subtitle}</p>}
      </header>

      <div className={styles.flowBody}>{children}</div>

      {!isSuccessStep && <div className={styles.flowControls}>
          <Button type="button" className={styles.backBtn} onClick={onBack} disabled={isSubmitting} variant="ghost" size="sm">
            Back
          </Button>

          {isReviewStep ? <Button type="button" className={styles.confirmBtn} onClick={onConfirm} disabled={isSubmitting} variant="primary" size="md">
              {isSubmitting ? "Processing..." : compactButtons ? "Book" : confirmLabel}
            </Button> : <Button type="button" className={styles.nextBtn} onClick={onNext} disabled={isSubmitting} variant="primary" size="md">
              {nextLabel}
            </Button>}
        </div>}
    </div>;
};
export default AppointmentFlow;
