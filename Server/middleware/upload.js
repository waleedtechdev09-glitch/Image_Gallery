import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "user_images",
    format: file.mimetype.includes("/") ? file.mimetype.split("/")[1] : "png",
    public_id: `${file.originalname.split(".")[0]}-${Date.now()}`,
  }),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});