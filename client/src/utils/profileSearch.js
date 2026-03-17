export const PROFILE_SEARCH_EVENT = "profile:search";

export const emitProfileSearch = ({ query = "", targetTab = "" } = {}) => {
  window.dispatchEvent(
    new CustomEvent(PROFILE_SEARCH_EVENT, {
      detail: {
        query: String(query || ""),
        targetTab: String(targetTab || ""),
        timestamp: Date.now(),
      },
    }),
  );
};
