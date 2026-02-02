import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true }, // THIS IS CRUCIAL
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
