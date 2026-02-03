import Image from "../models/Image.js";
import cloudinary from "../config/cloudinary.js";



export const uploadImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const folderId = req.body.folderId || null;

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: folderId || "root",
    });

    const newImage = await Image.create({
      uploadedBy: req.user._id,
      url: result.secure_url,
      public_id: result.public_id,
      folder: folderId,
    });

    res.status(201).json(newImage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Image upload failed" });
  }
};

export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const folderId = req.body.folderId || null;

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folderId || "root",
      });

      const newImage = await Image.create({
        uploadedBy: req.user._id,
        url: result.secure_url,
        public_id: result.public_id,
        folder: folderId,
      });

      uploadedImages.push(newImage);
    }

    res.status(201).json(uploadedImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Multiple image upload failed" });
  }
};



// Get images (optionally filter by folder)
export const getImages = async (req, res) => {
  try {
    const { folderId } = req.query;
    const query = { uploadedBy: req.user._id };
    if (folderId) query.folder = folderId;

    const images = await Image.find(query).sort({ createdAt: -1 });
    res.status(200).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

// Delete single image
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    if (image.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (image.public_id) await cloudinary.uploader.destroy(image.public_id);
    await Image.findByIdAndDelete(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete image" });
  }
};
