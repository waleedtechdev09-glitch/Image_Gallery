import cloudinary from "../config/cloudinary.js";
import Image from "../models/Image.js";

// Upload Image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newImage = await Image.create({
      uploadedBy: req.user._id, // must match schema
      url: req.file.path,
      public_id: req.file.filename,
      
    });

    console.log("Image created:", newImage);
    res.status(201).json(newImage);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get User Images
export const getUserImages = async (req, res) => {
  try {
    console.log("REQ USER:", req.user); // check if user exists
    const images = await Image.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
    console.log("Fetched images:", images);
    res.status(200).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

// DELETE
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find image in DB
    const image = await Image.findById(id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    // Check ownership
    if (image.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete from Cloudinary
    if (image.public_id) {
      // ⚡ IMPORTANT: use the correct public_id
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Delete from MongoDB
    await Image.findByIdAndDelete(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("DELETE IMAGE ERROR:", err);
    res.status(500).json({ message: "Failed to delete image" });
  }
};
