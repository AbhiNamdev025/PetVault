import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";
import { Button } from "..";
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnClickOutside = false,
  closeOnEsc = true,
  hideContentPadding = false,
  hideContentPaddingOnMobile = false,
  backdropClassName = "",
  headerClassName = "",
  contentClassName = "",
  footerClassName = "",
  closeButtonClassName = "",
  className = "",
  ...props
}) => {
  const contentRef = useRef(null);
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen && closeOnEsc) {
        onClose?.();
      }
    };

    const rootStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const lockCountAttr = "data-modal-lock-count";
    const lockScrollYAttr = "data-modal-scroll-y";
    const readLockCount = () =>
      Number.parseInt(document.body.getAttribute(lockCountAttr) || "0", 10) ||
      0;

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      const currentLocks = readLockCount();
      const nextLocks = currentLocks + 1;
      document.body.setAttribute(lockCountAttr, String(nextLocks));

      // Apply scroll lock only for the first open modal.
      if (currentLocks === 0) {
        const scrollY =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;

        document.body.setAttribute(lockScrollYAttr, String(scrollY));
        bodyStyle.setProperty("overflow", "hidden", "important");
        bodyStyle.setProperty("position", "fixed", "important");
        bodyStyle.setProperty("top", `-${scrollY}px`, "important");
        bodyStyle.setProperty("left", "0", "important");
        bodyStyle.setProperty("right", "0", "important");
        bodyStyle.setProperty("width", "100%", "important");
        bodyStyle.setProperty("overscroll-behavior", "none", "important");
        rootStyle.setProperty("overflow", "hidden", "important");
        rootStyle.setProperty("overscroll-behavior", "none", "important");
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);

      if (!isOpen) return;

      const currentLocks = readLockCount();
      const nextLocks = Math.max(0, currentLocks - 1);

      if (nextLocks > 0) {
        document.body.setAttribute(lockCountAttr, String(nextLocks));
        return;
      }

      document.body.removeAttribute(lockCountAttr);
      const scrollY = Number.parseInt(
        document.body.getAttribute(lockScrollYAttr) || "0",
        10,
      );
      document.body.removeAttribute(lockScrollYAttr);
      bodyStyle.removeProperty("overflow");
      bodyStyle.removeProperty("position");
      bodyStyle.removeProperty("top");
      bodyStyle.removeProperty("left");
      bodyStyle.removeProperty("right");
      bodyStyle.removeProperty("width");
      bodyStyle.removeProperty("overscroll-behavior");
      rootStyle.removeProperty("overflow");
      rootStyle.removeProperty("overscroll-behavior");
      window.scrollTo(0, Number.isFinite(scrollY) ? scrollY : 0);
    };
  }, [isOpen, onClose, closeOnEsc]);
  useEffect(() => {
    if (!isOpen) return undefined;
    const contentEl = contentRef.current;
    if (!contentEl) return undefined;

    const selector = [
      "[data-modal-actions]",
      '[class*="modalActions"]',
      '[class*="popupActions"]',
      '[class*="formActions"]',
      '[class*="actionRow"]',
      '[class*="actionFooter"]',
      '[class*="buttonGroup"]',
      '[class*="cancelReasonActions"]',
      '[class*="footerActions"]',
      '[class*="modalFooter"]',
      '[class*="formFooter"]',
      '[class*="actions"]',
      '[class*="footer"]',
    ].join(", ");

    const tracked = [];
    const trackedForms = [];
    const candidates = contentEl.querySelectorAll(selector);

    candidates.forEach((element) => {
      const hasActionControl = element.querySelector(
        "button, [role='button'], a[href], input[type='button'], input[type='submit']",
      );
      if (!hasActionControl) return;

      const className =
        typeof element.className === "string"
          ? element.className.toLowerCase()
          : "";
      const isExplicit = element.hasAttribute("data-modal-actions");
      const looksLikeActionRow =
        isExplicit ||
        className.includes("action") ||
        className.includes("footer") ||
        className.includes("button");
      if (!looksLikeActionRow) return;

      const previousValue = element.getAttribute("data-modal-actions");
      if (previousValue !== "true") {
        element.setAttribute("data-modal-actions", "true");
        tracked.push({
          element,
          previousValue,
        });
      }

      const parentForm = element.closest("form");
      if (parentForm) {
        const previousFormValue = parentForm.getAttribute(
          "data-modal-form-actions",
        );
        if (previousFormValue !== "true") {
          parentForm.setAttribute("data-modal-form-actions", "true");
          trackedForms.push({
            element: parentForm,
            previousValue: previousFormValue,
          });
        }
      }
    });

    return () => {
      tracked.forEach(({ element, previousValue }) => {
        if (previousValue === null) {
          element.removeAttribute("data-modal-actions");
        } else {
          element.setAttribute("data-modal-actions", previousValue);
        }
      });

      trackedForms.forEach(({ element, previousValue }) => {
        if (previousValue === null) {
          element.removeAttribute("data-modal-form-actions");
        } else {
          element.setAttribute("data-modal-form-actions", previousValue);
        }
      });
    };
  }, [isOpen, children]);
  if (!isOpen) return null;
  const handleBackdropClick = (e) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose?.();
    }
  };
  const backdropClasses = [styles.backdrop, backdropClassName]
    .filter(Boolean)
    .join(" ");
  const modalClasses = [styles.modal, styles[size], className]
    .filter(Boolean)
    .join(" ");
  const headerClasses = [styles.header, headerClassName]
    .filter(Boolean)
    .join(" ");
  const contentClasses = [
    styles.content,
    hideContentPadding && styles.contentNoPadding,
    hideContentPaddingOnMobile && styles.contentNoPaddingMobile,
    contentClassName,
  ]
    .filter(Boolean)
    .join(" ");
  const footerClasses = [styles.footer, footerClassName]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={backdropClasses} onClick={handleBackdropClick} {...props}>
      <div className={modalClasses}>
        {(title || showCloseButton) && (
          <div className={headerClasses}>
            {title && <h2 className={styles.title}>{title}</h2>}
            {showCloseButton && (
              <Button
                className={[styles.closeButton, closeButtonClassName]
                  .filter(Boolean)
                  .join(" ")}
                onClick={onClose}
                aria-label="Close modal"
                variant="ghost"
                size="sm"
              >
                <X size={20} />
              </Button>
            )}
          </div>
        )}
        <div className={contentClasses} ref={contentRef}>
          {children}
        </div>
        {footer && <div className={footerClasses}>{footer}</div>}
      </div>
    </div>
  );
};
export default Modal;
