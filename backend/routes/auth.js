const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const { requireAuth } = require("../middleware/authMiddleware");
const { sendOtpEmail } = require("../services/emailService");
const logger = require("../services/logger");
const {
  validateSignup,
  validateLogin,
  validateVerifyEmail,
  validateResendOtp,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

// Rate limiting middleware
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 signup requests per windowMs
  message: "Too many signup attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 OTP attempts per windowMs
  message: "Too many OTP attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isAllowedEmail(email) {
  if (!email || typeof email !== "string") return false;
  const lower = email.toLowerCase();
  // Accept common Gmail and Microsoft domains
  return (
    /@gmail\.com$/.test(lower) ||
    /@(outlook|hotmail|live|microsoft)\.com$/.test(lower)
  );
}

// Step 1: Register user and send OTP
router.post(
  "/signup",
  signupLimiter,
  validateSignup,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        logger.warn(`Signup attempt with existing user: ${email}`);
        return res.status(409).json({
          error: "User with provided email or username already exists",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        email,
        passwordHash,
        isEmailVerified: false,
      });
      await user.save();

      // Generate OTP and store in EmailVerification collection (keep only latest)
      const otp = generateOtp();
      await EmailVerification.updateOne(
        { userId: user._id },
        {
          userId: user._id,
          email: email.toLowerCase(),
          otp: otp,
          createdAt: new Date(),
        },
        { upsert: true }
      );

      // Send OTP via email
      try {
        await sendOtpEmail(email, otp);
        logger.info(`User registered successfully: ${email}`);
      } catch (emailError) {
        logger.error(
          `Failed to send verification email to ${email}:`,
          emailError
        );
        // Delete the user and email verification record if email sending fails
        await User.deleteOne({ _id: user._id });
        await EmailVerification.deleteOne({ userId: user._id });
        return res.status(500).json({
          error: "Failed to send verification email. Please try again.",
        });
      }

      res.status(201).json({
        message: "User registered. Please verify your email with the OTP sent.",
        email: email,
      });
    } catch (err) {
      logger.error("Signup error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Step 2: Verify email with OTP
router.post(
  "/verify-email",
  otpLimiter,
  validateVerifyEmail,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      // Find the user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        logger.warn(
          `Email verification attempt for non-existent user: ${email}`
        );
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isEmailVerified)
        return res.status(400).json({ error: "Email already verified" });

      // Find the email verification record
      const emailVerification = await EmailVerification.findOne({
        userId: user._id,
        email: email.toLowerCase(),
      });

      if (!emailVerification) {
        logger.warn(`Invalid OTP attempt for: ${email}`);
        return res.status(401).json({ error: "Invalid or expired OTP" });
      }

      // Check if OTP matches
      if (emailVerification.otp !== otp) {
        logger.warn(`Incorrect OTP attempt for: ${email}`);
        return res.status(401).json({ error: "Invalid OTP" });
      }

      // OTP is valid, mark email as verified
      user.isEmailVerified = true;
      await user.save();

      // Delete the email verification record
      await EmailVerification.deleteOne({ _id: emailVerification._id });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });

      logger.info(`Email verified successfully: ${email}`);
      res.json({
        message: "Email verified successfully",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      logger.error("Email verification error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/login",
  loginLimiter,
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { login, password } = req.body;

      const query = login.includes("@")
        ? { email: login.toLowerCase() }
        : { username: login };
      const user = await User.findOne(query);
      if (!user) {
        logger.warn(`Login attempt with non-existent user: ${login}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        logger.warn(`Failed login attempt for user: ${user.username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if email is verified
      if (!user.isEmailVerified)
        return res.status(403).json({
          error: "Email not verified",
          requiresVerification: true,
          email: user.email,
        });

      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      });
      logger.info(`User logged in: ${user.username}`);
      res.json({
        message: "Logged in",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      logger.error("Login error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Resend OTP to user's email
router.post(
  "/resend-otp",
  otpLimiter,
  validateResendOtp,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        logger.warn(`Resend OTP attempt for non-existent user: ${email}`);
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isEmailVerified)
        return res.status(400).json({ error: "Email already verified" });

      // Generate new OTP (keep only latest - upsert)
      const otp = generateOtp();
      await EmailVerification.updateOne(
        { userId: user._id },
        {
          userId: user._id,
          email: email.toLowerCase(),
          otp: otp,
          createdAt: new Date(),
        },
        { upsert: true }
      );

      // Send OTP via email
      try {
        await sendOtpEmail(email, otp);
        logger.info(`OTP resent successfully to: ${email}`);
      } catch (emailError) {
        logger.error(
          `Failed to resend verification email to ${email}:`,
          emailError
        );
        return res.status(500).json({
          error: "Failed to send verification email. Please try again.",
        });
      }

      res.json({
        message: "OTP resent successfully. Check your email.",
        email: email,
      });
    } catch (err) {
      logger.error("Resend OTP error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "none" });
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await User.findById(userId).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    logger.error("Get me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
