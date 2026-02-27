import express from "express";
import { 
  uploadImage, 
  getImages, 
  deleteImage, 
  uploadMultipleImages, 
  manualResize 
} from "../controllers/imageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import multer from "multer"; 

const router = express.Router();

// Sirf ek Auth middleware use karein (protect)
router.use(protect);

// SINGLE UPLOAD: Frontend se field name "image" hona chahiye
router.post("/upload", protect,upload.single("image"), uploadImage);
router.post("/upload",protect, upload.single("image"), uploadImage);

// MULTIPLE UPLOAD: Frontend se field name "images" hona chahiye
// .array("images", 10) mein limit bhi set kar sakte hain (e.g., max 10 files)
router.post("/upload-multiple",protect, (req, res, next) => {
  upload.array("images")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer ke apne errors (e.g. Size limit)
      return res.status(400).json({ message: "Multer Error", error: err.message });
    } else if (err) {
      // Hamara custom error (e.g. File type not supported)
      return res.status(400).json({ message: err.message });
    }
    next(); // Agar sab theek hai to controller par jao
  });
}, uploadMultipleImages);

router.post("/resize/:id",protect, manualResize); 
router.get("/", protect,getImages);
router.delete("/:id",protect, deleteImage);

export default router;