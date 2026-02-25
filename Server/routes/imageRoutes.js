import express from "express";
import { 
  uploadImage, 
  getImages, 
  deleteImage, 
  uploadMultipleImages, 
  manualResize 
} from "../controllers/imageController.js";
import { protect } from "../middleware/authMiddleware.js";
// 🔥 Apne asli Multer config ko import karein
import { upload } from "../middleware/upload.js"; 
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// ❌ Purani 'const upload = multer...' wali line yahan se delete kar di hai

router.use(protect);

// Single upload ke liye field name 'image'
router.post("/upload", upload.single("image"), uploadImage);

// Multiple upload ke liye field name 'images' (Frontend ke mutabiq)
router.post("/upload-multiple",  upload.array("images"), uploadMultipleImages);

router.post("/resize/:id",  manualResize); 
router.get("/", getImages);
router.delete("/:id", deleteImage);

export default router;