import express from "express";
import { uploadImage, getUserImages, deleteImage } from "../controllers/imageController.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Upload image (requires auth)
router.post(
  "/upload",
  authenticate,
  (req, res, next) => {
    console.log("Before multer", req.body);
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    console.log("After multer", req.file);
    next();
  },
  uploadImage
);





// Get all images for user
router.get("/", authenticate, getUserImages);

// Delete image
router.delete("/:id", authenticate, deleteImage);

export default router;
