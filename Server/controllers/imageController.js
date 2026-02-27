import File from "../models/File.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

console.log("🔑 RESIZER URL on startup:", process.env.RESIZER_SERVICE_URL);

const RESIZER_SERVICE_URL = process.env.RESIZER_SERVICE_URL || "http://image-resizer-service.default.svc.cluster.local/resize-and-upload";

/**
 * HELPER: Cloudinary Resource Type Detector
 * - video  → mp4, webm, mov, mp3, wav, aac, ogg
 * - raw    → json, docx, xlsx, pptx, zip, rar, txt, csv
 * - image  → jpg, png, gif, pdf, webp, svg
 * - auto   → everything else (treated as image on delete)
 */
const getCloudinaryResourceType = (file) => {
    const mimetype = file.mimetype || "";
    const extension = path.extname(file.originalname || "").toLowerCase();

    // Video & Audio → Cloudinary 'video' resource type
    if (mimetype.startsWith("video/")) return "video";
    if (mimetype.startsWith("audio/")) return "video"; // Cloudinary audio = video type

    // Raw files
    if (
        mimetype === "application/json" || extension === ".json" ||
        mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || extension === ".docx" ||
        mimetype === "application/msword" || extension === ".doc" ||
        mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || extension === ".xlsx" ||
        mimetype === "application/vnd.ms-excel" || extension === ".xls" ||
        mimetype === "text/csv" || extension === ".csv" ||
        mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || extension === ".pptx" ||
        mimetype === "application/vnd.ms-powerpoint" || extension === ".ppt" ||
        mimetype === "application/zip" || mimetype === "application/x-rar-compressed" ||
        mimetype === "application/x-zip-compressed" || extension === ".zip" || extension === ".rar" || extension === ".7z" ||
        mimetype === "text/plain" || extension === ".txt"
    ) return "raw";

    // PDF → image (Cloudinary handles PDFs as images)
    if (mimetype === "application/pdf" || extension === ".pdf") return "image";

    return "auto"; // images
};

/**
 * HELPER: Resize image — AWAITED before response
 */
const resizeAndSave = async (fileId, fileUrl) => {
    console.log("🔄 RESIZE START:", RESIZER_SERVICE_URL);
    const imgResponse = await axios({ method: 'get', url: fileUrl, responseType: 'stream' });
    const form = new FormData();
    form.append("image", imgResponse.data, { filename: 'image.png' });

    const response = await axios.post(RESIZER_SERVICE_URL, form, {
        headers: { ...form.getHeaders() },
        timeout: 60000
    });

    const { size_256, size_512 } = response.data.data;
    const updatedFile = await File.findByIdAndUpdate(
        fileId,
        { $set: { thumbnail256: size_256, thumbnail512: size_512 } },
        { new: true }
    );

    console.log(`✅ Resize complete for: ${fileId}`);
    return updatedFile;
};

/**
 * SINGLE FILE UPLOAD
 */
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        let folderId = req.body.folderId;
        if (!folderId || folderId === "null" || folderId === "undefined") folderId = null;

        const resourceType = getCloudinaryResourceType(req.file);
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: folderId || "root",
            resource_type: resourceType,
        });

        let newFile = await File.create({
            uploadedBy: req.user._id,
            url: result.secure_url,
            public_id: result.public_id,
            folder: folderId,
            fileType: req.file.mimetype,
            fileName: req.file.originalname,
            versions: [],
            thumbnail256: null,
            thumbnail512: null,
        });

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        if (req.file.mimetype.startsWith("image/")) {
            try { newFile = await resizeAndSave(newFile._id, newFile.url); }
            catch (resizeErr) { console.error("⚠️ Resize failed:", resizeErr.message); }
        }

        res.status(201).json(newFile);
    } catch (err) {
        console.error("❌ Single Upload Error:", err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
};

/**
 * MULTIPLE FILES UPLOAD
 */
export const uploadMultipleImages = async (req, res) => {
    console.log("🚀 REQUEST RECEIVED IN CONTROLLER");
    console.log("Files:", req.files?.length);

    try {
        if (!req.files || req.files.length === 0)
            return res.status(400).json({ message: "No files provided" });

        let folderId = req.body.folderId;
        if (!folderId || folderId === "null" || folderId === "undefined") folderId = null;

        const results = [];

        for (const file of req.files) {
            const resourceType = getCloudinaryResourceType(file);
            const cloudRes = await cloudinary.uploader.upload(file.path, {
                folder: folderId || "root",
                resource_type: resourceType
            });

            let newFile = await File.create({
                uploadedBy: req.user._id,
                url: cloudRes.secure_url,
                fileType: file.mimetype,
                fileName: file.originalname,
                public_id: cloudRes.public_id,
                folder: folderId,
                versions: [],
                thumbnail256: null,
                thumbnail512: null,
            });

            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

            if (file.mimetype.startsWith("image/")) {
                try { newFile = await resizeAndSave(newFile._id, newFile.url); }
                catch (resizeErr) { console.error("⚠️ Resize failed:", resizeErr.message); }
            }

            results.push(newFile);
        }

        res.status(201).json(results);
    } catch (err) {
        console.error("❌ Multiple Upload Error:", err);
        if (req.files) req.files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
        res.status(500).json({ message: "Multiple upload failed", error: err.message });
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

        // ✅ FIX: 'auto' → 'image' for Cloudinary delete
        let resourceType = getCloudinaryResourceType({ mimetype: file.fileType, originalname: file.fileName });
        if (resourceType === 'auto') resourceType = 'image';

        if (file.public_id) {
            await cloudinary.uploader.destroy(file.public_id, { resource_type: resourceType });
        }

        if (file.versions && file.versions.length > 0) {
            for (const version of file.versions) {
                if (version.public_id) await cloudinary.uploader.destroy(version.public_id, { resource_type: "image" });
            }
        }

        await File.findByIdAndDelete(id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("❌ Delete Error:", err);
        res.status(500).json({ message: "Failed to delete" });
    }
};

/**
 * MANUAL RESIZE
 */
export const manualResize = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetSize } = req.body;
        if (!targetSize) return res.status(400).json({ message: "Target size is required" });

        const file = await File.findById(id);
        if (!file) return res.status(404).json({ message: "File not found" });
        if (!file.fileType.startsWith("image/")) {
            return res.status(400).json({ message: "Only image files can be resized." });
        }

        const imgResponse = await axios({ method: 'get', url: file.url, responseType: 'stream' });
        const form = new FormData();
        form.append("image", imgResponse.data, { filename: 'image.png' });
        form.append("targetSize", targetSize.toString());

        const response = await axios.post(RESIZER_SERVICE_URL, form, {
            headers: { ...form.getHeaders() },
            timeout: 60000
        });

        const resizedUrl = response.data.data[`size_${targetSize}`];
        const resizedPublicId = response.data.data.public_id || `resized_${id}_${targetSize}`;

        const updatedFile = await File.findByIdAndUpdate(
            id,
            { $push: { versions: { size: Number(targetSize), url: resizedUrl, public_id: resizedPublicId } } },
            { new: true }
        );

        res.status(200).json({ success: true, data: updatedFile });
    } catch (err) {
        console.error("❌ Resize Error:", err.message);
        res.status(500).json({ message: "Resizer Service failed", error: err.response?.data || err.message });
    }
};