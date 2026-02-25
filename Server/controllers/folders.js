import Folder from "../models/Folder.js";
import Image from "../models/File.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Get all folders of the logged-in user
 */
export const getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch folders" });
  }
};


  // Get full path of a folder (e.g., parent/child/grandchild)
 
export const getFolderPath = async (req, res) => {
  try {
    const { id } = req.params;

    let folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    const pathNames = [folder.name];
    let current = folder;

    // Traverse up to build full path
    while (current.parent) {
      current = await Folder.findById(current.parent);
      if (current) pathNames.unshift(current.name);
      else break;
    }

    res.status(200).json({
      path: pathNames.join("/"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get path" });
  }
};


  // Create a folder (duplicates allowed)

export const createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    // Allow duplicate names, just create new folder
    const folder = await Folder.create({
      name,
      user: req.user._id,
      parent: parentId || null,
    });

    res.status(201).json(folder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Folder creation failed" });
  }
};


  // Delete folder and all images inside
 
export const deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;

    // Delete all images in this folder
    const images = await Image.find({ folder: folderId, uploadedBy: req.user._id });
    for (const img of images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }
    await Image.deleteMany({ folder: folderId, uploadedBy: req.user._id });

    // Delete the folder itself
    await Folder.findByIdAndDelete(folderId);

    res.status(200).json({ message: "Folder and its images deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};

/**
 * Resolve a path array into folder ID (used for nested routing)
 */
export const resolveFolderPath = async (req, res) => {
  try {
    const { path } = req.body; // path is an array of folder names
    let parent = null;
    let folder = null;

    for (const name of path) {
      folder = await Folder.findOne({ name, parent: parent, user: req.user._id });
      if (!folder) return res.status(404).json({ message: `Folder "${name}" not found` });
      parent = folder._id;
    }

    res.status(200).json({
      folderId: folder._id,
      fullPath: path.join("/"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resolve folder path" });
  }
};
