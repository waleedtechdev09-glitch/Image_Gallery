import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if token exists in headers
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user and attach to request (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user; // Set final user object
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    
    // Check if error is due to expiration
    const message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ message });
  }
};