import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import folderRoutes from "./routes/folderRoute.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS Update: Ab ye localhost ke bajaye aapke AWS Frontend URL ko allow karega
app.use(cors({
    origin: [
        "https://media-lib.conn-api.com", // Aapka naya production domain (HTTPS ke saath)
        "http://media-lib.conn-api.com",  // Safe side ke liye HTTP bhi
        "http://localhost:3000"           // Local testing ke liye
    ],
    credentials: true,
}));

// Test root route
app.get("/", (req, res) => res.send("Library System API is Running"));

app.use((req, res, next) => {
  console.log(`📩 Request: ${req.method} ${req.url}`);
  console.log(`📑 Headers:`, req.headers['content-type']);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/folders", folderRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log(err));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));