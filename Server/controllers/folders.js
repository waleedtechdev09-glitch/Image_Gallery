import Folder from "../models/Folder.js";
import Image from "../models/Image.js";
import cloudinary from "../config/cloudinary.js";

// Get all folders of user
export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch folders" });
  }
};

// Create folder
export const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const folder = await Folder.create({ name, user: req.user._id });
    res.status(201).json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Folder creation failed" });
  }
};

// Delete folder + all images inside
export const deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;

    // Find all images in this folder
    const images = await Image.find({ folder: folderId, uploadedBy: req.user._id });

    // Delete from Cloudinary
    for (const img of images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    // Delete images from DB
    await Image.deleteMany({ folder: folderId, uploadedBy: req.user._id });

    // Delete folder
    await Folder.findByIdAndDelete(folderId);

    res.status(200).json({ message: "Folder and its images deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};
