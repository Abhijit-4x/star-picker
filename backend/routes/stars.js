const express = require("express");
const router = express.Router();
const Star = require("../models/Star");
const multer = require("multer");
const {
  uploadStarsFromFile,
  getRandomStar,
} = require("../controllers/starController");
const { requireAuth } = require("../middleware/authMiddleware");
const { validationErrorSingle } = require("../utils/errorResponses");

// Get all stars
router.get("/stars", async (req, res) => {
  // res.json({"message":"This is the stars route. Use /api/stars to get all stars."});
  const stars = await Star.find();
  res.json(stars);
});

// Get a random star
router.get("/random-star", requireAuth, getRandomStar);

// Search stars by name and/or tier
router.get("/stars/search", async (req, res) => {
  const searchKey = req.query.key || "";
  const tierParam = req.query.tier || "";

  // Validation: at least one parameter must be provided
  if (
    (!searchKey || searchKey.trim() === "") &&
    (!tierParam || tierParam.trim() === "")
  ) {
    return res
      .status(400)
      .json({ error: "Please provide a search key or tier filter" });
  }

  try {
    const query = {};

    // Add name filter if provided
    if (searchKey && searchKey.trim() !== "") {
      query.starName = { $regex: searchKey, $options: "i" }; // "i" = case-insensitive
    }

    // Add tier filter if provided
    if (tierParam && tierParam.trim() !== "") {
      const tierValues = tierParam
        .split(",")
        .map((t) => parseInt(t.trim()))
        .filter((t) => !isNaN(t) && t >= 1 && t <= 5);
      if (tierValues.length > 0) {
        query.tier = { $in: tierValues };
      }
    }

    const results = await Star.find(query);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new star (protected)
router.post("/star", requireAuth, async (req, res) => {
  const { tier, starName } = req.body;
  if (!tier || !starName) {
    return res
      .status(400)
      .json(validationErrorSingle("Tier and Name are required."));
  }
  const newStar = new Star({ tier, starName });
  try {
    const savedStar = await newStar.save();
    res.status(201).json({ message: "Star added.", star: savedStar });
  } catch (err) {
    if (err.code === 11000 && err.keyValue && err.keyValue.starName) {
      console.error("Duplicate star name error:", err);
      return res.status(409).json({
        message: `Star with name '${err.keyValue.starName}' already exists.`,
      });
    } else {
      console.error("Error adding star:", err);
      res.status(500).json({ error: "Failed to add star." });
    }
  }
});

// Update a star by ID (protected)
router.put("/stars/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { tier, starName } = req.body;

  if (!tier || !starName) {
    return res
      .status(400)
      .json(validationErrorSingle("Tier and Name are required."));
  }

  try {
    const updatedStar = await Star.findByIdAndUpdate(
      id,
      { tier, starName },
      { new: true, runValidators: true }
    );

    if (!updatedStar) {
      return res.status(404).json({ error: "Star not found." });
    }

    res.json({ message: "Star updated successfully.", star: updatedStar });
  } catch (err) {
    if (err.code === 11000 && err.keyValue && err.keyValue.starName) {
      console.error("Duplicate star name error:", err);
      return res.status(409).json({
        message: `Star with name '${err.keyValue.starName}' already exists.`,
      });
    } else {
      console.error("Error updating star:", err);
      res.status(500).json({ error: "Failed to update star." });
    }
  }
});

// Delete a star by ID (protected)
router.delete("/stars/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStar = await Star.findByIdAndDelete(id);

    if (!deletedStar) {
      return res.status(404).json({ error: "Star not found." });
    }

    res.json({ message: "Star deleted successfully.", star: deletedStar });
  } catch (err) {
    console.error("Error deleting star:", err);
    res.status(500).json({ error: "Failed to delete star." });
  }
});

// Upload stars in bulk from array (protected)
router.post("/bulk-upload-stars", requireAuth, async (req, res) => {
  const starArray = req.body;
  if (!Array.isArray(starArray)) {
    return res
      .status(400)
      .json({ error: "Request body must be an array of stars." });
  }
  if (starArray.length === 0) {
    return res
      .status(200)
      .json({ message: "No stars provided for upload.", results: [] });
  }
  const results = []; // To store the detailed outcome of each star's creation

  for (const starData of starArray) {
    const { tier, starName } = starData; // Destructure individual star data
    let status = "failed";
    let errorMessage = "";
    let savedStarInfo = null;

    if (!starName || typeof starName !== "string" || starName.trim() === "") {
      errorMessage =
        "Star Name is missing or invalid (must be a non-empty string).";
    } else if (typeof tier !== "number" || isNaN(tier)) {
      // Check if it's not a number or NaN
      errorMessage = "Tier is missing or not a valid number.";
    } else if (tier < 1 || tier > 5) {
      errorMessage = "Tier must be a number between 1 and 5.";
    } else {
      const newStar = new Star({ tier, starName });
      try {
        const savedStar = await newStar.save(); // Save to MongoDB
        status = "success";
        savedStarInfo = {
          _id: savedStar._id,
          starName: savedStar.starName,
          tier: savedStar.tier,
        };
      } catch (err) {
        if (err.code === 11000 && err.keyValue && err.keyValue.starName) {
          errorMessage = `Star with name '${err.keyValue.starName}' already exists.`;
        } else {
          errorMessage = `Failed to save star: ${
            err.message || "Unknown error"
          }`;
          console.error(`Error saving star '${starName || "unknown"}':`, err); // Log the detailed error
        }
      }
    }
    results.push({
      inputData: {
        starName: starData.starName || "N/A",
        tier: starData.tier || "N/A",
      }, // Show what was attempted
      status: status,
      ...(savedStarInfo && { data: savedStarInfo }), // Conditionally include saved data if successful
      ...(errorMessage && { error: errorMessage }), // Conditionally include error message if failed
    });
  }
  const allSuccess = results.every((r) => r.status === "success");
  const anySuccess = results.some((r) => r.status === "success");

  let overallStatusCode = 200; // Default: OK
  let overallMessage = "Bulk star upload processed.";

  if (allSuccess && starArray.length > 0) {
    // All successfully added (and there were stars)
    overallStatusCode = 201; // Created
    overallMessage = "All stars uploaded successfully.";
  } else if (anySuccess && !allSuccess) {
    // Mixed results (some succeeded, some failed)
    overallStatusCode = 207; // Multi-Status (WebDAV status, commonly used for mixed outcomes)
    overallMessage = "Some stars uploaded successfully, some failed.";
  } else if (!anySuccess && starArray.length > 0) {
    // All failed
    overallStatusCode = 400; // Bad Request (or 422 Unprocessable Entity if data was valid but couldn't be saved for other reasons)
    overallMessage =
      "All stars failed to upload or request contained invalid data.";
  } else {
    // This case handles an empty input array
    overallStatusCode = 200;
    overallMessage = "No stars were valid or found to upload.";
  }
  res.status(overallStatusCode).json({
    message: overallMessage,
    results: results,
  });
});

// Configure multer to accept a single text file
const upload = multer({ dest: "uploads/" }); // will save uploaded files temporarily
router.post(
  "/upload-stars",
  requireAuth,
  upload.single("file"),
  uploadStarsFromFile
);

module.exports = router;
