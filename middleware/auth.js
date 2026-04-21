const jwt = require("jsonwebtoken");

// ✅ Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ success: false, msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, msg: "Invalid or expired token" });
  }
};

// ✅ Authorization Middleware (role-based)
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, msg: "Access denied" });
    }
    next();
  };
};

// ✅ Ownership Check Middleware
const checkOwner = (paramKey = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, msg: "Unauthorized" });
    }

    // Compare logged-in user ID with the resource owner ID
    if (req.user.id !== req.params[paramKey] && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        msg: "You are not the owner of this resource",
      });
    }

    next();
  };
};

// ✅ Extra: Unified Error Handler for Middleware
const errorHandler = (err, req, res, next) => {
  console.error("Middleware Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    msg: err.message || "Internal Server Error",
  });
};

module.exports = { authMiddleware, authorizeRole, checkOwner, errorHandler };
