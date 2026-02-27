import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    url: {
      type: String,
      required: true
    }, // Original image (full size) URL

    fileType: { type: String },
    fileName: { type: String },
    public_id: { type: String, required: true },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder"
    },

    // ✅ Auto-generated thumbnails after upload (images only)
    // These are set automatically by the background resize job
    thumbnail256: { type: String, default: null }, // 256px resized URL
    thumbnail512: { type: String, default: null }, // 512px resized URL

    // Manual resize versions (kept for compatibility)
    versions: [
      {
        size: { type: Number },    // e.g., 512, 256, 800
        url: { type: String },     // Cloudinary URL for this size
        public_id: { type: String } // For deletion
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.models.File || mongoose.model("File", fileSchema);