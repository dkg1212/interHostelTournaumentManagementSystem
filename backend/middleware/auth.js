const jwt = require("jsonwebtoken");

// Use environment variable or fallback secret (not recommended in prod)
const JWT_SECRET = process.env.JWT_SECRET || "your_fallback_secret";

// Middleware to check token and attach user data to req
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // { id, role, email, ... }
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or expired token",
    });
  }
};

// Middleware to restrict access to specific roles (e.g., 'dsw', 'tusc')
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access denied for your role",
      });
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
};
