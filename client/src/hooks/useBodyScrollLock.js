import { useEffect } from "react";

const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto"; // Or 'unset' to revert to CSS
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
