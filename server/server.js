import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import analysesRoutes from "./routes/analyses.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================
// Middleware
// ====================

app.use(cors());
app.use(express.json());

// ====================
// API Routes
// ====================

app.use("/api/auth", authRoutes);
app.use("/api/analyses", analysesRoutes);

// ====================
// Health Check
// ====================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Bug Replier API is running",
  });
});

// ====================
// Serve React Frontend
// ====================

const clientBuildPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientBuildPath));

// React fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      res
        .status(200)
        .send("Bug Replier Express Backend is running.");
    }
  });
});

// ====================
// MongoDB Connection
// ====================

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");

    // Start server only after MongoDB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  });