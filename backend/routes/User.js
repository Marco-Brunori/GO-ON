import express from "express";
import { User } from "../models/User.js";
import { Trail } from "../models/Trail.js"; 

const router = express.Router();

// -------- POST /users -------- 
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }
    const user = new User(req.body);
    await user.save();
    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// -------- GET /users -------- 
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /users/:id --------
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- PUT /users/:id -------- 
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// -------- DELETE /users/:id -------- 
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- POST /users/favourites -------- 
router.post("/favourites", async (req, res) => {
  const { idUser, idTrail } = req.body;
  try {
    const user = await User.findById(idUser);
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const trailExists = await Trail.exists({ _id: idTrail });
    if(!trailExists) {
      return res.status(404).json({ message: "Trail not found" });
    }
    if(user.favourites.includes(idTrail)) {
      return res.status(409).json({ message: "Trail already in favourites" });
    }
    user.favourites.push(idTrail);
    await user.save();
    return res.status(200).json({ message: "Trail added to favourites" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- DELETE /users/:idUser/favourites/:idTrail --------
router.delete("/:idUser/favourites/:idTrail", async (req, res) => {
  const { idUser, idTrail } = req.params;
  try {
    const user = await User.findById(idUser);
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const index = user.favourites.indexOf(idTrail);
    if (index === -1) {
      return res.status(404).json({ message: "Favourite trail not found" });
    }
    user.favourites.splice(index, 1);
    await user.save();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /users/favourites/:idUser -------- 
router.get("/favourites/:idUser", async (req, res) => {
  try {
    const user = await User.findById(req.params.idUser).populate("favourites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.favourites);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;