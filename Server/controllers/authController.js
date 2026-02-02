import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { asyncMiddleware } from "../utils/asyncMiddleware.js";

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register
export const registerUser = asyncMiddleware(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

// Login
export const loginUser = asyncMiddleware(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

  res.json({
    
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

// Logout (just clears token for frontend)
export const logoutUser = asyncMiddleware(async (req, res) => {
  res.json({ message: "Logged out successfully", token: "" });
});
