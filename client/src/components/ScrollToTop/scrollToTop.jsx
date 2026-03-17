import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import Button from "../common/Button/Button";
import styles from "./scrollToTop.module.css";
import { getScrollRoots, scrollAppToTop } from "../../utils/scroll";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const roots = getScrollRoots();
    const getScrollY = (root) => {
      if (!root) return 0;
      if (root === document.body || root === document.documentElement) {
        return window.scrollY || document.documentElement.scrollTop || 0;
      }
      return Number(root.scrollTop) || 0;
    };

    const toggleVisibility = () => {
      const hasScrolled = roots.some((root) => getScrollY(root) > 300);
      setIsVisible(hasScrolled);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    roots.forEach((root) => {
      if (
        root &&
        root !== document.body &&
        root !== document.documentElement &&
        root !== document.scrollingElement
      ) {
        root.addEventListener("scroll", toggleVisibility, { passive: true });
      }
    });

    toggleVisibility();

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      roots.forEach((root) => {
        if (
          root &&
          root !== document.body &&
          root !== document.documentElement &&
          root !== document.scrollingElement
        ) {
          root.removeEventListener("scroll", toggleVisibility);
        }
      });
    };
  }, [location.pathname, location.search, location.hash, location.key]);

  const scrollToTop = () => {
    scrollAppToTop({ behavior: "smooth" });
    window.requestAnimationFrame(() => {
      scrollAppToTop({ behavior: "smooth" });
    });
  };

  return (
    <div className={`${styles.scrollToTop} ${isVisible ? styles.visible : ""}`}>
      <Button
        variant="primary"
        size="lg"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className={styles.button}
      >
        <ArrowUp size={24} />
      </Button>
    </div>
  );
};

export default ScrollToTop;
