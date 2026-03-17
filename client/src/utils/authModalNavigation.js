export const openAuthModal = (navigate, options = {}) => {
  const { location, view = "login", replace = false, from } = options;

  const pathname = location?.pathname || window.location.pathname || "/";
  const search = location?.search || window.location.search || "";
  const currentState =
    location?.state && typeof location.state === "object" ? location.state : {};

  const normalizedView = view === "signup" ? "signup" : "login";
  const params = new URLSearchParams(search);
  params.set("auth", normalizedView);

  navigate(`${pathname}?${params.toString()}`, {
    replace,
    state: {
      ...currentState,
      openAuthModal: true,
      authView: normalizedView,
      from: from || pathname,
    },
  });
};

export const redirectToAuthHome = (navigate, view = "login", from) => {
  const normalized = view === "signup" ? "signup" : "login";
  navigate(`/?auth=${normalized}`, {
    replace: true,
    state: {
      openAuthModal: true,
      authView: normalized,
      from: from || window.location.pathname || "/",
    },
  });
};
