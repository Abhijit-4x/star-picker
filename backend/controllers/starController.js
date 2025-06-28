const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const Star = require("../models/Star");
const StarCache = require("../models/StarCache");

// function to upload stars from a CSV file
const uploadStarsFromFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "..", req.file.path);
  const results = [];

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on("data", (data) => {
      const { tier, starName } = data;
      if (starName && tier) {
        results.push({ starName, tier: parseInt(tier) });
      }
    })
    .on("end", async () => {
      try {
        let successFullUploads = [];
        let failedUploads = []; // Initialize arrays to track successful and failed uploads
        // await Star.insertMany(results);
        for (const starData of results) {
          const newStar = new Star(starData);
          try {
            await newStar.save();
            successFullUploads.push(newStar);
          } catch (err) {
            if (err.code === 11000 && err.keyValue && err.keyValue.starName) {
              console.error("Document with the same name exists : ", newStar.starName);
              failedUploads.push({
                starName: starData.starName,
                error: `Star with name '${err.keyValue.starName}' already exists.`
              });
            }
          }
        }
        fs.unlinkSync(filePath); // cleanup
        res.json({
          successfulUploads: successFullUploads,
          failedUploads: failedUploads
         });
      } catch (err) {
        res.status(500).json({ error: "Failed to insert stars", details: err });
      }
    })
    .on("error", (err) => {
      res.status(500).json({ error: "Failed to read file", details: err });
    });
};

// function to get a random star
const getRandomStar = async (req, res) => {
  const totalStarsCount = await Star.countDocuments();
  const MAX_CACHE_SIZE = Math.floor(totalStarsCount * 0.8); // Define how many recent star IDs to cache

  let starCache = await StarCache.findOneAndUpdate(
    { _id: 'recentStarsCache' },
    { $setOnInsert: { recentStarIds: [] } }, // Initialize if inserting
    { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found, return new doc
  );

  let recentStarIds = starCache.recentStarIds || [];
  let randomStar = null;
  const availableStarsCount = await Star.countDocuments({
    _id: { $nin: recentStarIds }  
  });

  const randomNum = Math.floor(Math.random() * availableStarsCount);

  randomStar = await Star.findOne({
      _id: { $nin: recentStarIds } // Filters out recent stars
  }).skip(randomNum); // Skips 'random' number of documents from the filtered set
  
  recentStarIds.push(randomStar._id); // Add the new star ID to the cache
  if (recentStarIds.length > MAX_CACHE_SIZE) {
    recentStarIds.shift(); // Remove the oldest ID if cache exceeds size
  }

  starCache.recentStarIds = recentStarIds;
  starCache.updatedAt = new Date();
  await starCache.save();

  res.json(randomStar);
}

module.exports = { uploadStarsFromFile, getRandomStar };
