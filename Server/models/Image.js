import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" }, // 👈 folder link
  },
  { timestamps: true }
);

export default mongoose.models.Image || mongoose.model("Image", imageSchema);
