import express from "express";
import Folder from "../models/Folder.js";
import { authenticate } from "../middleware/auth.js"; 

const router = express.Router();

// Create folder
router.post("/", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Folder name is required" });

    const existing = await Folder.findOne({ name, user: req.user._id });
    if (existing) return res.status(400).json({ message: "Folder already exists" });

    const folder = await Folder.create({ name, user: req.user._id });
    res.status(201).json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all folders of user
router.get("/", authenticate, async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/:id", authenticate, async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Only owner can delete folder
    if (folder.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Folder.findByIdAndDelete(req.params.id);

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
