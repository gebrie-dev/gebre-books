const jwt = require("jsonwebtoken");

// JWT verification middleware
const verifyJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details to request
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware for role-based access control
const verifyRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Access forbidden, insufficient role" });
    }

    next();
  };
};

module.exports = { verifyJWT, verifyRole };
