import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const allowedMimetypes = [
    // Images
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp","image/svg+xml",
    // Videos
    "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
    // Audio
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Data
    "application/json",
    "text/plain",
    "text/csv",
    // Archives
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
];

const fileFilter = (req, file, cb) => {
    if (allowedMimetypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not supported: ${file.mimetype}`), false);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter,
});