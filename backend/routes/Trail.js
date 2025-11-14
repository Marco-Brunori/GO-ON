import express from "express";
import { Trail } from "../models/Trail.js";
const router = express.Router();

// -------- GET /trails?filters --------
router.get("/", async (req, res) => {
  try {
    const {
      id,
      region,
      valley,
      difficulty,
      minLength,
      maxLength,
      minDuration,
      maxDuration,
      tags
    } = req.query;

    const filter = {};

    if(id) {
      filter._id = id;
    }
    if(region) {
      filter.region = region;
    }
    if(valley) {
      filter.valley = valley;
    }
    if(difficulty) {
      filter.difficulty = difficulty;
    }
    if(minLength) {
      filter.lengthKm = { ...filter.lengthKm, $gte: Number(minLength) };
    }
    if(maxLength) {
      filter.lengthKm = { ...filter.lengthKm, $lte: Number(maxLength) };
    }

    const exprConditions = []; // serve creare un array per avere più espressioni
    if(minDuration) {
      exprConditions.push({
        $gte: [{ 
          $add: [{ 
            $multiply: ["$duration.hours", 60] 
          }, 
          "$duration.minutes"] 
        },
        Number(minDuration)
        ]
      });
    }
    if(maxDuration) {
      exprConditions.push({
        $lte: [{ 
          $add: 
          [{ 
            $multiply: ["$duration.hours", 60] 
          }, 
          "$duration.minutes"] 
        },
        Number(maxDuration)
        ]
      });
    }
    if(tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(",");
      filter.tags = { 
        $all: tagArray 
      };
    }
    if(exprConditions.length > 0) {
      filter.$expr = { $and: exprConditions };
    }
    const trails = await Trail.find(filter);
    res.json(trails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------- POST /trails --------
router.post("/", async (req, res) => {
  try {
    const trail = new Trail(req.body);
    await trail.save();
    res.status(201).json(trail);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// -------- GET /trails/:id --------
router.get("/:id", async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id);
    if(!trail) {
      return res.status(404).json({ error: "Trail not found" });
    }
    res.json(trail);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid ID" });
  }
});

// -------- PUT /trails/:id --------
router.put("/:id", async (req, res) => {
  try {
    const trail = await Trail.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if(!trail) {
      return res.status(404).json({ error: "Trail not found" });
    } 
    res.json(trail);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// -------- DELETE /trails/:id --------
router.delete("/:id", async (req, res) => {
  try {
    const trail = await Trail.findByIdAndDelete(req.params.id);
    if(!trail) {
      return res.status(404).json({ error: "Trail not found" });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid ID" });
  }
});

// -------- GET /trails/near?lat=&lon=&radius= --------
router.get("/near", async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;
    if(!lat || !lon || !radius) {
      return res.status(400).json({ error: "lat, lon and radius are required" });
    }
    const trails = await Trail.find({
      location: {
        $geoWithin: {
          $centerSphere: [[Number(lon), Number(lat)], Number(radius) / 6371] // raggio in km / raggio terrestre
        }
      }
    });
    res.json(trails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;