const express = require('express');
const router = express.Router();
const Star = require('../models/Star');
const multer = require("multer");
const { uploadStarsFromFile, getRandomStar } = require("../controllers/starController");

// Get all stars
router.get('/stars', async (req, res) => {
  // res.json({"message":"This is the stars route. Use /api/stars to get all stars."});
  const stars = await Star.find();
  res.json(stars);
});

// Get a random star
router.get('/random-star', getRandomStar );

// Search stars by name (case-insensitive)
router.get("/stars/search", async (req, res) => {

  const searchKey = req.query.key || "";
  if (!searchKey || searchKey.trim() === "") {
    return res.status(400).json({ error: "Search key cannot be empty" });
  }

  try {
    const results = await Star.find({
      starName: { $regex: searchKey, $options: "i" }, // "i" = case-insensitive
    });
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new star
router.post('/star', async (req, res) => {
  const {tier, starName} = req.body;
  if( !tier || !starName) {
    return res.status(400).json({error: "Tier and Name are required."});
  }
  const newStar = new Star({tier, starName});
  try{
    const savedStar = await newStar.save();
    res.status(201).json({message:"Star added.", star: savedStar});
  } catch (err) {
    if (err.code === 11000 && err.keyValue && err.keyValue.starName) {
        console.error("Duplicate star name error:", err);
        return res.status(409).json({ message: `Star with name '${err.keyValue.starName}' already exists.` });
    } else {
        console.error("Error adding star:", err);
        res.status(500).json({ error: "Failed to add star." });
    }
  }
})

// Configure multer to accept a single text file
const upload = multer({ dest: "uploads/" }); // will save uploaded files temporarily
router.post("/upload-stars", upload.single("file"), uploadStarsFromFile);

module.exports = router;
