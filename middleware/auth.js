const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Import user model

// JWT verification middleware
const verifyJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user data in the request object
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware for role-based access control
const verifyRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // Role from decoded JWT token

    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Access forbidden, insufficient role" });
    }

    next(); // User role is authorized, proceed to the next middleware or route
  };
};

module.exports = { verifyJWT, verifyRole };
