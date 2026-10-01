import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Analysis from "../models/Analysis.js";
import User from "../models/User.js";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const router = express.Router();
const FREE_DAILY_LIMIT = 5;

const AnalyzeInput = z.object({
  code: z.string().min(1).max(20000),
  language: z.string().min(1).max(40),
});

const AnalysisSchema = z.object({
  errorSummary: z.string(),
  rootCause: z.string(),
  correctedCode: z.string(),
  explanation: z.string(),
});

function createLovableAiGatewayProvider(lovableApiKey) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

// @route   POST /api/analyses
// @desc    Analyze code snippet with AI
router.post("/", requireAuth, async (req, res) => {
  try {
    const { code, language } = AnalyzeInput.parse(req.body);
    const user = req.user;

    // Daily limit check
    const today = new Date().toISOString().slice(0, 10);
    const usedToday = user.last_analysis_date === today ? user.analyses_used_today : 0;

    if (user.subscription === "free" && usedToday >= FREE_DAILY_LIMIT) {
      return res.status(403).json({
        message: `Daily limit reached (${FREE_DAILY_LIMIT}/day on Free). Upgrade to Prime for unlimited analyses.`,
      });
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "AI gateway not configured on server" });
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    let result;
    try {
      result = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        output: Output.object({ schema: AnalysisSchema }),
        system:
          "You are an expert code reviewer and debugger. Analyze the given source code, find bugs, edge cases, runtime errors, and logic mistakes. Always return a fixed, corrected version of the full code. Explanations must be beginner-friendly.",
        prompt: `Language: ${language}\n\nSource code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nAnalyze for bugs, issues and improvements. Return:\n- errorSummary: 1-2 sentence summary of what's wrong (or "No obvious bugs" if clean)\n- rootCause: brief root cause analysis\n- correctedCode: a complete, working version of the code\n- explanation: friendly explanation of the fixes and why they work`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI request failed";
      if (msg.includes("429")) {
        return res.status(429).json({ message: "Rate limit reached. Please try again in a moment." });
      }
      if (msg.includes("402")) {
        return res.status(402).json({ message: "AI credits exhausted. Add credits in workspace settings." });
      }
      return res.status(500).json({ message: msg });
    }

    const out = result.output;

    const analysis = new Analysis({
      user_id: user._id,
      language,
      original_code: code,
      corrected_code: out.correctedCode,
      error_summary: out.errorSummary,
      root_cause: out.rootCause,
      explanation: out.explanation,
    });

    await analysis.save();

    // Update usage counters
    await User.findByIdAndUpdate(user._id, {
      $set: { last_analysis_date: today },
      $inc: {
        analyses_used_today: user.last_analysis_date === today ? 1 : -user.analyses_used_today + 1,
        analyses_total: 1,
      },
    });

    // Format output similarly to MongoDB row structure
    res.status(201).json({
      id: analysis._id,
      user_id: analysis.user_id,
      language: analysis.language,
      original_code: analysis.original_code,
      corrected_code: analysis.corrected_code,
      error_summary: analysis.error_summary,
      root_cause: analysis.root_cause,
      explanation: analysis.explanation,
      video_script: analysis.video_script,
      created_at: analysis.created_at,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    console.error("Analysis error:", err);
    res.status(500).json({ message: "Server error during code analysis" });
  }
});

// @route   GET /api/analyses
// @desc    Get user's analysis history
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    let query = Analysis.find({ user_id: user._id }).sort({ created_at: -1 }).limit(200);

    // Free plan: only last 7 days
    if (user.subscription === "free") {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query = query.where("created_at").gte(cutoff);
    }

    const analyses = await query.exec();

    // Map _id to id to match supabase client types on frontend
    const formatted = analyses.map((a) => ({
      id: a._id,
      user_id: a.user_id,
      language: a.language,
      original_code: a.original_code,
      corrected_code: a.corrected_code,
      error_summary: a.error_summary,
      root_cause: a.root_cause,
      explanation: a.explanation,
      video_script: a.video_script,
      created_at: a.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("List analyses error:", err);
    res.status(500).json({ message: "Server error retrieving analysis history" });
  }
});

// @route   DELETE /api/analyses/:id
// @desc    Delete a specific analysis
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    await Analysis.deleteOne({ _id: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete analysis error:", err);
    res.status(500).json({ message: "Server error deleting analysis" });
  }
});

// @route   POST /api/analyses/:id/video
// @desc    Generate video explanation script
router.post("/:id/video", requireAuth, async (req, res) => {
  try {
    if (req.user.subscription !== "prime") {
      return res.status(403).json({ message: "Video explanations are a Prime feature. Upgrade to unlock." });
    }

    const analysis = await Analysis.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "AI gateway not configured on server" });
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system:
        "You write engaging short-form video narration scripts (60-90 seconds) for developer audiences. Use a friendly, conversational tone, with clear sections and verbal cues.",
      prompt: `Write a video narration script that explains this bug fix.\n\nLanguage: ${analysis.language}\nError summary: ${analysis.error_summary}\nRoot cause: ${analysis.root_cause}\nExplanation: ${analysis.explanation}\n\nReturn ONLY the spoken script in plain text, with [pause] cues where natural.`,
    });

    analysis.video_script = text;
    await analysis.save();

    res.json({ script: text });
  } catch (err) {
    console.error("Video script generation error:", err);
    res.status(500).json({ message: "Server error generating video explanation" });
  }
});

// @route   POST /api/analyses/:id/email
// @desc    Send report email via Resend
router.post("/:id/email", requireAuth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return res.status(500).json({
        message: "Email is not configured yet. Ask your admin to add a RESEND_API_KEY.",
      });
    }

    const analysis = await Analysis.findOne({ _id: req.params.id, user_id: req.user._id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const escapeHtml = (s) => {
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:640px;margin:auto;padding:24px;color:#0f172a">
        <h1 style="color:#7c3aed">Bug Replier — Analysis Report</h1>
        <p><b>Language:</b> ${analysis.language}</p>
        <h2>Error Summary</h2><p>${escapeHtml(analysis.error_summary ?? "")}</p>
        <h2>Root Cause</h2><p>${escapeHtml(analysis.root_cause ?? "")}</p>
        <h2>Explanation</h2><p>${escapeHtml(analysis.explanation ?? "")}</p>
        <h2>Corrected Code</h2>
        <pre style="background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;overflow:auto"><code>${escapeHtml(analysis.corrected_code ?? "")}</code></pre>
        ${analysis.video_script ? `<h2>Video Script</h2><pre style="white-space:pre-wrap">${escapeHtml(analysis.video_script)}</pre>` : ""}
      </div>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bug Replier <onboarding@resend.dev>",
        to: [email],
        subject: "Your Bug Replier analysis report",
        html,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      return res.status(500).json({ message: `Email failed: ${t}` });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Send email error:", err);
    res.status(500).json({ message: "Server error sending email report" });
  }
});

export default router;
