import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollAppToTop } from "../../utils/scroll";

/**
 * ScrollRestoration component
 * Automatically scrolls to the top of the page when the route changes
 */
const ScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    scrollAppToTop({ behavior: "auto" });

    const frame = window.requestAnimationFrame(() => {
      scrollAppToTop({ behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.search, location.hash, location.key]);

  return null; // This component doesn't render anything
};

export default ScrollRestoration;
