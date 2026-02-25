import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary'; // Recommended import style
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Added for JSON support
app.use(express.urlencoded({ extended: true }));

// --- Cloudinary Configuration ---
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer limit set karein taake bohot bari files server crash na karein
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const uploadToCloudinary = (buffer, folderName) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folderName },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

app.post('/resize-and-upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image provided' });

        // 🔥 FIX: Check if file is actually an image
        // Sharp non-image files par crash ho jata hai
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            console.log(`⚠️ Skipping resize for non-image file: ${req.file.mimetype}`);
            return res.status(400).json({ 
                error: "Not an image", 
                details: "Resizer service only supports images." 
            });
        }

        const sizes = [512, 256];
        const results = {};

        await Promise.all(sizes.map(async (size) => {
            const resizedBuffer = await sharp(req.file.buffer)
                .resize(size, size, { fit: 'cover' })
                .toFormat('jpeg')
                .toBuffer();

            const folderPath = `library_system/resized_${size}`;
            const uploadedUrl = await uploadToCloudinary(resizedBuffer, folderPath);
            
            results[`size_${size}`] = uploadedUrl;
        }));

        res.json({
            success: true,
            message: "Images processed",
            data: results
        });

    } catch (error) {
        console.error("❌ Resizer Error Detail:", error.message);
        res.status(500).json({ error: "Processing failed", details: error.message });
    }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Resizer Service active on port ${PORT}`);
});