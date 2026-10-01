import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
    },
    original_code: {
      type: String,
      required: true,
    },
    corrected_code: {
      type: String,
      default: null,
    },
    error_summary: {
      type: String,
      default: null,
    },
    root_cause: {
      type: String,
      default: null,
    },
    explanation: {
      type: String,
      default: null,
    },
    video_script: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

export default mongoose.model("Analysis", AnalysisSchema);
