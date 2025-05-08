const jwt = require("jsonwebtoken");

// Make sure to set JWT_SECRET in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret'; 

// Middleware to verify JWT and attach user info to req
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
    // Use JWT_SECRET from the environment
    const decoded = jwt.verify(token, JWT_SECRET); 
    req.user = decoded; // decoded should contain { id, role, ... }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or expired token",
    });
  }
};

// Middleware to allow only specific roles (e.g., dsw, tusc)
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access denied",
      });
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
};
