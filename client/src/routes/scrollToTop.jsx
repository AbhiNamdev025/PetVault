import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollAppToTop } from "../utils/scroll";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    scrollAppToTop({ behavior: "auto" });
  }, [location.pathname, location.search, location.hash, location.key]);

  return null;
};

export default ScrollToTop;
