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

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/analyses", analysesRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Bug Replier API is running",
  });
});

// Serve static assets in production
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// React fallback route
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      res
        .status(200)
        .send(
          "Bug Replier Express Backend is running. Frontend has not been built yet."
        );
    }
  });
});

// ====================
// MongoDB Connection
// ====================

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/bug-replier";

// DEBUG
console.log("MONGO_URI =", process.env.MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});