import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { z } from "zod";

const router = express.Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helper to generate token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "default_jwt_secret_key", {
    expiresIn: "30d",
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post("/signup", async (req, res) => {
  try {
    const body = SignupSchema.parse(req.body);
    
    // Check if user exists
    const exists = await User.findOne({ email: body.email });
    if (exists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create user
    const user = new User({
      email: body.email,
      password: body.password,
      name: body.name || null,
      subscription: "free",
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        analyses_total: user.analyses_total,
        analyses_used_today: user.analyses_used_today,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @route   POST /api/auth/signin
// @desc    Authenticate user and get token
router.post("/signin", async (req, res) => {
  try {
    const body = SigninSchema.parse(req.body);

    const user = await User.findOne({ email: body.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(body.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription,
        analyses_total: user.analyses_total,
        analyses_used_today: user.analyses_used_today,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error during signin" });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      subscription: user.subscription,
      analyses_total: user.analyses_total,
      analyses_used_today: user.analyses_used_today,
      last_analysis_date: user.last_analysis_date,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error retrieving profile" });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user display name
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (name === undefined) {
      return res.status(400).json({ message: "Name is required" });
    }

    req.user.name = name;
    await req.user.save();

    res.json({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      subscription: req.user.subscription,
      analyses_total: req.user.analyses_total,
      analyses_used_today: req.user.analyses_used_today,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Check your email for the reset link" });
    }

    const token = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    console.log(`[PASSWORD_RESET] Token for ${email}: http://localhost:8080/reset-password?token=${token}`);

    res.json({ message: "Check your email for the reset link", token });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error during forgot password request" });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

export default router;
