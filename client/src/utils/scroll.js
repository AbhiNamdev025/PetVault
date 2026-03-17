const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

const toTop = (target, behavior = "auto") => {
  if (!target) return;

  if (typeof target.scrollTo === "function") {
    try {
      target.scrollTo({ top: 0, left: 0, behavior });
      return;
    } catch {
      // fallback below
    }
  }

  if (typeof target.scrollTop === "number") {
    target.scrollTop = 0;
  }
  if (typeof target.scrollLeft === "number") {
    target.scrollLeft = 0;
  }
};

export const getScrollRoots = () => {
  if (!isBrowser) return [];
  const roots = [
    document.scrollingElement,
    document.documentElement,
    document.body,
    ...Array.from(document.querySelectorAll("[data-scroll-root='true']")),
  ];

  const seen = new Set();
  return roots.filter((root) => {
    if (!root || seen.has(root)) return;
    seen.add(root);
    return true;
  });
};

export const scrollAppToTop = ({ behavior = "auto" } = {}) => {
  if (!isBrowser) return;

  toTop(window, behavior);

  getScrollRoots().forEach((root) => {
    toTop(root, behavior);
  });
};
