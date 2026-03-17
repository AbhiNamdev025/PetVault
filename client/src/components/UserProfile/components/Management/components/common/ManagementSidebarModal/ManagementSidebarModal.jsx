import React, { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./managementSidebarModal.module.css";
import { Button } from "../../../../../../common";
const ManagementSidebarModal = ({
  isOpen = true,
  onClose,
  title,
  subtitle,
  children,
  footer,
  closeOnOverlay = true
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEsc = event => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const handleBackdropClick = event => {
    if (!closeOnOverlay) return;
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };
  return <div className={styles.backdrop} onClick={handleBackdropClick}>
      <aside className={styles.drawer} role="dialog" aria-modal="true">
        {(title || subtitle) && <header className={styles.header}>
            <div className={styles.heading}>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <Button type="button" onClick={onClose} className={styles.closeButton} aria-label="Close panel" variant="ghost" size="sm">
              <X size={18} />
            </Button>
          </header>}

        <div className={styles.content}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </aside>
    </div>;
};
export default ManagementSidebarModal;
