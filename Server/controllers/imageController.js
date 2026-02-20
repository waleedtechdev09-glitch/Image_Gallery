import Image from "../models/Image.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

// Internal K8s DNS: Service name 'image-resizer-service' aur default port 80
const RESIZER_SERVICE_URL = "http://image-resizer-service.default.svc.cluster.local/resize-and-upload";

/**
 * Helper: Local file ko Resizer Service bhej kar thumbnails lena
 */
const getResizedUrls = async (filePath) => {
  try {
    const form = new FormData();
    form.append("image", fs.createReadStream(filePath));

    const response = await axios.post(RESIZER_SERVICE_URL, form, {
      headers: { ...form.getHeaders() },
      timeout: 60000, // 60 seconds (Resizing heavy images takes time)
    });

    return {
      thumbnail512: response.data.data.size_512,
      thumbnail256: response.data.data.size_256,
    };
  } catch (error) {
    // Agar resizer down hai to null return karein taake main image upload na ruke
    console.error("❌ Resizer Service Unreachable:", error.message);
    return { thumbnail512: null, thumbnail256: null };
  }
};

/**
 * SINGLE IMAGE UPLOAD
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const folderId = req.body.folderId || null;

    // 1. Original image Cloudinary pe upload karein
    const result = await cloudinary.uploader.upload(req.file.path, { folder: folderId || "root" });

    // 2. Resizer service se thumbnails lein
    const { thumbnail512, thumbnail256 } = await getResizedUrls(req.file.path);

    // 3. Database entry create karein
    const newImage = await Image.create({
      uploadedBy: req.user._id,
      url: result.secure_url,
      thumbnail512,
      thumbnail256,
      public_id: result.public_id,
      folder: folderId,
    });

    // Temp file delete karein
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(201).json(newImage);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Image upload failed", error: err.message });
  }
};

/**
 * MULTIPLE IMAGES UPLOAD
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files uploaded" });
    const folderId = req.body.folderId || null;
    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: folderId || "root" });
      const { thumbnail512, thumbnail256 } = await getResizedUrls(file.path);

      const newImage = await Image.create({
        uploadedBy: req.user._id,
        url: result.secure_url,
        thumbnail512,
        thumbnail256,
        public_id: result.public_id,
        folder: folderId,
      });

      uploadedImages.push(newImage);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    res.status(201).json(uploadedImages);
  } catch (err) {
    console.error("Multiple Upload Error:", err);
    res.status(500).json({ message: "Multiple image upload failed" });
  }
};

/**
 * MANUAL RESIZE (For existing images)
 */
export const manualResize = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetSize } = req.body;

    const image = await Image.findById(id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // 1. Cloudinary URL se stream download karein
    const imgResponse = await axios({
      method: 'get',
      url: image.url,
      responseType: 'stream'
    });

    // 2. Form Data banayein aur Resizer ko bhej dein
    const form = new FormData();
    form.append("image", imgResponse.data, { filename: 'image.png' });
    
    // Resizer ko instruction dena (Agar index.js use kar raha ho)
    form.append("targetSize", targetSize.toString()); 

    const response = await axios.post(RESIZER_SERVICE_URL, form, {
      headers: { ...form.getHeaders() },
      timeout: 60000 
    });

    // 3. Database mein wahi thumbnail update karein jo manga gaya hai
    if (targetSize === 512) {
      image.thumbnail512 = response.data.data.size_512;
    } else {
      image.thumbnail256 = response.data.data.size_256;
    }

    await image.save();
    res.status(200).json({ success: true, data: image });

  } catch (err) {
    console.error("❌ Resize Error Detail:", err.response?.data || err.message);
    res.status(500).json({ 
      message: "Resizer Service failed or timed out", 
      error: err.message 
    });
  }
};

/**
 * FETCH IMAGES
 */
export const getImages = async (req, res) => {
  try {
    const { folderId } = req.query;
    const query = { uploadedBy: req.user._id };
    if (folderId && folderId !== 'null') query.folder = folderId;
    
    const images = await Image.find(query).sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

/**
 * DELETE IMAGE
 */
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);

    if (!image) return res.status(404).json({ message: "Image not found" });
    if (image.uploadedBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    // Cloudinary se original delete karein
    if (image.public_id) await cloudinary.uploader.destroy(image.public_id);

    await Image.findByIdAndDelete(id);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete image" });
  }
};