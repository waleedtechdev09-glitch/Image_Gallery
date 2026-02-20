import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncMiddleware } from "../utils/asyncMiddleware.js";

export const protect = asyncMiddleware(async (req, res, next) => {
  let token;

  // 1. Check if Header exists and has Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from string
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach User to Request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Authorized user no longer exists" });
      }

      return next();
    } catch (error) {
      // 4. Handle Token Errors (Expired or Invalid)
      console.error("Auth Error:", error.message);
      return res.status(401).json({ 
        message: "Not authorized, token failed",
        error: error.name === "TokenExpiredError" ? "expired" : "invalid" 
      });
    }
  }

  // 5. If no token at all
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
});