import multer from "multer";
import path from "path";
import fs from "fs";

// 1. DiskStorage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    // Folder ensure karein ke exist karta ho
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  },
});

// 2. File Filter (Enhanced)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.json', '.mp4', '.mov', '.webm'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Extension check ke saath mimetype check bhi behtar hota hai
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    // Error pass karne ke bajaye 'false' bhejien aur controller mein check karein
    // Ya phir custom error message dein jo global handler pakar sakay
    const error = new Error(`File type ${ext} is not supported`);
    error.code = 'LIMIT_FILE_TYPES';
    cb(error, false);
  }
};

// 3. Export Multer Instance
export const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 100 * 1024 * 1024, 
    files: 10 
  }, 
});