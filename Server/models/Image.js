import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true }, // Original Image URL
    
    // --- Nayi Fields Resized Images ke liye ---
    thumbnail512: { type: String }, 
    thumbnail256: { type: String },
    // -----------------------------------------

    public_id: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" }, 
  },
  { timestamps: true }
);

export default mongoose.models.Image || mongoose.model("Image", imageSchema);