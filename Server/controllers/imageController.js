import File from "../models/File.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

// Resizer Service URL (K8s Cluster Internal DNS)
const RESIZER_SERVICE_URL = "http://image-resizer-service.default.svc.cluster.local/resize-and-upload";

/**
 * SINGLE FILE UPLOAD (Original Only)
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let folderId = req.body.folderId;
    if (!folderId || folderId === "null" || folderId === "undefined") folderId = null;

    // 1. Cloudinary upload (Original)
    const result = await cloudinary.uploader.upload(req.file.path, { 
      folder: folderId || "root",
      resource_type: "auto" 
    });

    // 2. DB Entry (Explicitly defined fields to avoid old schema fields)
    const newFile = await File.create({
      uploadedBy: req.user._id,
      url: result.secure_url,
      public_id: result.public_id,
      folder: folderId,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      versions: [] // Khali array on upload
    });

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(201).json(newFile);
  } catch (err) {
    console.error("❌ Upload Error:", err.message);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

/**
 * MULTIPLE FILES UPLOAD (Original Only)
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No files" });
    
    let folderId = req.body.folderId;
    if (!folderId || folderId === "null" || folderId === "undefined") folderId = null;

    const results = [];
    for (const file of req.files) {
      const cloudRes = await cloudinary.uploader.upload(file.path, {
        folder: folderId || "root",
        resource_type: "auto"
      });

      const newFile = await File.create({
        uploadedBy: req.user._id,
        url: cloudRes.secure_url,
        fileType: file.mimetype,
        fileName: file.originalname,
        public_id: cloudRes.public_id,
        folder: folderId,
        versions: [] 
      });

      results.push(newFile);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
    res.status(201).json(results);
  } catch (err) {
    console.error("❌ Multiple Upload Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * MANUAL RESIZE (With Duplicate Check & DB Cleanup)
 */
export const manualResize = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetSize } = req.body; 

    if (!targetSize) return res.status(400).json({ message: "Target size is required" });

    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "File not found" });

    // 1. Validation: Size pehle se exist toh nahi karta?
    const alreadyExists = file.versions.some(v => v.size === Number(targetSize));
    if (alreadyExists) {
      return res.status(400).json({ 
        message: `Image version with ${targetSize}px already exists.` 
      });
    }

    // 2. Sirf images resize ho sakti hain
    if (!file.fileType.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files can be resized" });
    }

    // 3. Cloudinary URL se stream download
    const imgResponse = await axios({
      method: 'get',
      url: file.url,
      responseType: 'stream'
    });

    // 4. Resizer Service Call
    const form = new FormData();
    form.append("image", imgResponse.data, { filename: 'image.png' });
    form.append("targetSize", targetSize.toString()); 

    const response = await axios.post(RESIZER_SERVICE_URL, form, {
      headers: { ...form.getHeaders() },
      timeout: 60000 
    });

    const resizedUrl = response.data.data[`size_${targetSize}`];
    const resizedPublicId = response.data.data.public_id || `resized_${id}_${targetSize}`;

    // 5. DB Update ($push for version and $unset for old fields cleanup)
    const updatedFile = await File.findByIdAndUpdate(
      id,
      { 
        $push: { 
          versions: { size: Number(targetSize), url: resizedUrl, public_id: resizedPublicId } 
        },
        $unset: { thumbnail512: "", thumbnail256: "" } // Force delete old fields
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedFile });

  } catch (err) {
    console.error("❌ Resize Error:", err.message);
    res.status(500).json({ 
      message: "Resizer Service failed", 
      error: err.response?.data || err.message 
    });
  }
};

/**
 * FETCH FILES
 */
export const getImages = async (req, res) => {
  try {
    const { folderId } = req.query;
    const query = { uploadedBy: req.user._id };
    
    if (folderId && folderId !== 'null' && folderId !== 'undefined') {
      query.folder = folderId;
    } else {
      query.folder = null; 
    }
    
    const files = await File.find(query).sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch files" });
  }
};

/**
 * DELETE FILE
 */
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 1. Cloudinary se Original delete karein
    if (file.public_id) await cloudinary.uploader.destroy(file.public_id);

    // 2. Cloudinary se saaray Resized versions delete karein
    if (file.versions && file.versions.length > 0) {
      for (const version of file.versions) {
        if (version.public_id) await cloudinary.uploader.destroy(version.public_id);
      }
    }

    // 3. DB se entry delete karein
    await File.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
};