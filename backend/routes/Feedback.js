import express from "express";
import { Feedback } from "../models/Feedback.js";

const router = express.Router();

// -------- POST /feedbacks -------- 
router.post("/", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    return res.status(201).json(feedback);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// -------- GET /feedbacks?filter -------- 
router.get("/", async (req, res) => {
  try {
    const { valutazione } = req.query;
    const filter = {};
    if (valutazione) {
      filter.valutazione = valutazione;
    }
    const feedbacks = await Feedback.find(filter);
    return res.status(200).json(feedbacks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /feedbacks/:id --------
router.get("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    return res.status(200).json(feedback);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- PUT /feedbacks/:id --------
router.put("/:id", async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// -------- DELETE /feedbacks/:id --------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /feedbacks/trail/:idTrail --------
router.get("/trail/:idTrail", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ idTrail: req.params.idTrail });
    if (!feedbacks.length) {
      return res.status(404).json({ message: "Trail not found or no feedbacks available" });
    }
    return res.status(200).json(feedbacks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /feedbacks/user/:idUser --------
router.get("/user/:idUser", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ idUser: req.params.idUser });
    if (!feedbacks.length) {
      return res.status(404).json({ message: "User not found or no feedbacks available" });
    }
    return res.status(200).json(feedbacks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;