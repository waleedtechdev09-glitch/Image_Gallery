import express from "express";
import { uploadImage, getImages, deleteImage, uploadMultipleImages } from "../controllers/imageController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(protect);

router.post("/upload", upload.single("image"), uploadImage);
router.post("/upload-multiple", authenticate, upload.array("images"), uploadMultipleImages);
router.get("/", getImages);
router.delete("/:id", deleteImage);

export default router;
