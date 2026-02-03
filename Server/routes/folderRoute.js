// import express from "express";
// import { getFolders, createFolder, deleteFolder } from "../controllers/folders.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.use(protect);

// router.get("/", getFolders);
// router.post("/", createFolder);
// router.delete("/:id", deleteFolder);

// export default router;


import express from "express";
import { 
  getFolders, 
  createFolder, 
  deleteFolder,
  getFolderPath 
} from "../controllers/folders.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getFolders);
router.post("/", createFolder);
router.get("/path/:id", getFolderPath);
router.delete("/:id", deleteFolder);



export default router;
