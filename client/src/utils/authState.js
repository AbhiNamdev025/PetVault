export const AUTH_STATE_CHANGED_EVENT = "petvault:auth-state-changed";

export const emitAuthStateChanged = (payload = {}) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_STATE_CHANGED_EVENT, { detail: payload }),
  );
};
