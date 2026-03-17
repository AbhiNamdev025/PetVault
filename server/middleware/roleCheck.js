const PROVIDER_ROLES = [
  "shop",
  "doctor",
  "caretaker",
  "hospital",
  "daycare",
  "ngo",
];

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (req.user?.isArchived) {
      return res.status(403).json({ message: "Account is inactive" });
    }
    next();
  };
};

const requireProvider = requireRole(...PROVIDER_ROLES);

module.exports = {
  PROVIDER_ROLES,
  requireRole,
  requireProvider,
};
