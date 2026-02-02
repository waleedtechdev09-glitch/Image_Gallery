import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // duplicate folder names prevent karne ke liye
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // har folder ek user ke liye hoga
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Folder || mongoose.model("Folder", folderSchema);
