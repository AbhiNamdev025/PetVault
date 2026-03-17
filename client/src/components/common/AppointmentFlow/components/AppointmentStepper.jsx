import React from "react";
import { CheckCircle2 } from "lucide-react";
import styles from "../appointmentFlow.module.css";

const AppointmentStepper = ({ steps, currentStep }) => {
  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const completed = stepNumber < currentStep;
        const active = stepNumber === currentStep;

        return (
          <div key={step.id} className={styles.stepItem}>
            <div
              className={`${styles.stepCircle} ${
                completed
                  ? styles.stepCircleCompleted
                  : active
                    ? styles.stepCircleActive
                    : ""
              }`}
            >
              {completed ? <CheckCircle2 size={20} /> : stepNumber}
            </div>
            <span className={styles.stepLabel}>{step.label}</span>
            {index < steps.length - 1 && (
              <span
                className={`${styles.stepConnector} ${
                  stepNumber < currentStep ? styles.stepConnectorActive : ""
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AppointmentStepper;
