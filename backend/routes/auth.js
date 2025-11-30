const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const { requireAuth } = require("../middleware/authMiddleware");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = "1d";

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
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res
        .status(400)
        .json({ error: "username, email and password required" });
    if (!isAllowedEmail(email))
      return res
        .status(400)
        .json({ error: "Email must be a Gmail or Microsoft email" });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res
        .status(409)
        .json({ error: "User with provided email or username already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      passwordHash,
      isEmailVerified: false,
    });
    await user.save();

    // Generate OTP and store in EmailVerification collection
    const otp = generateOtp();
    const emailVerification = new EmailVerification({
      userId: user._id,
      email: email,
      otp: otp,
    });
    await emailVerification.save();

    // TODO: Send OTP via email (configure email service like nodemailer)
    // For now, log OTP (remove in production)
    console.log(`OTP for ${email}: ${otp}`);

    res.status(201).json({
      message: "User registered. Please verify your email with the OTP sent.",
      email: email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Step 2: Verify email with OTP
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isEmailVerified)
      return res.status(400).json({ error: "Email already verified" });

    // Find the email verification record
    const emailVerification = await EmailVerification.findOne({
      userId: user._id,
      email: email.toLowerCase(),
    });

    if (!emailVerification)
      return res.status(401).json({ error: "Invalid or expired OTP" });

    // Check if OTP matches
    if (emailVerification.otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // OTP is valid, mark email as verified
    user.isEmailVerified = true;
    await user.save();

    // Delete the email verification record
    await EmailVerification.deleteOne({ _id: emailVerification._id });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Email verified successfully",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body; // login = username or email
    if (!login || !password)
      return res.status(400).json({ error: "login and password required" });

    const query = login.includes("@")
      ? { email: login.toLowerCase() }
      : { username: login };
    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isEmailVerified)
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    res.json({
      message: "Logged in",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    const user = await User.findById(userId).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
