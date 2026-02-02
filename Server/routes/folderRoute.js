import express from "express";
import { getFolders, createFolder, deleteFolder } from "../controllers/folders.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getFolders);
router.post("/", createFolder);
router.delete("/:id", deleteFolder);

export default router;
