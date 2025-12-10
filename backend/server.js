const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json());

const authRoutes = require("./routes/auth");
const starRoutes = require("./routes/stars");
const auditRoutes = require("./routes/audit");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.use("/api", authRoutes);
    app.use("/api", starRoutes); // Use /api prefix for all routes
    app.use("/api", auditRoutes); // Use /api prefix for audit routes

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
