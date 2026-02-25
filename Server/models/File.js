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
    }, // Ye Original Image (1024px ya Full Size) ka URL hoga

    fileType: { type: String }, 
    fileName: { type: String }, 
    public_id: { type: String, required: true },
    folder: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Folder" 
    },

    // 🔥 NEW: Versions Array
    // Isme sirf wo sizes save honge jo user manually "Resize" button daba kar banayega
    versions: [
      {
        size: { type: Number }, // e.g., 512, 256, 800
        url: { type: String },  // Cloudinary URL for this specific size
        public_id: { type: String } // Resized image ko delete karne ke liye
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.models.File || mongoose.model("File", fileSchema);