// import mongoose from "mongoose";

// const folderSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.models.Folder || mongoose.model("Folder", folderSchema);


// import mongoose from "mongoose";

// const folderSchema = new mongoose.Schema({
//   name: { type: String, required: true },

//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "User", 
//     required: true 
//   },

//   parent: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Folder",
//     default: null
//   },

//   path: {
//     type: String,
//     default: ""
//   },

//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   },
// });

// export default mongoose.models.Folder || mongoose.model("Folder", folderSchema);

import mongoose from "mongoose";
 const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null }, // important
  createdAt: { type: Date, default: Date.now },
});

// Ensure unique per user + parent
folderSchema.index({ name: 1, user: 1, parent: 1 }, { unique: true });
export default mongoose.models.Folder || mongoose.model("Folder", folderSchema);
