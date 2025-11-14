import express from "express";
import { Report } from "../models/Report.js";

const router = express.Router();

// -------- POST /reports --------
router.post("/", async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    return res.status(201).json(report);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// -------- GET /reports --------
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();
    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /reports/:id --------
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    return res.status(200).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- DELETE /reports/:id --------
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /reports/trail/:idTrail --------
router.get("/trail/:idTrail", async (req, res) => {
  try {
    const reports = await Report.find({ idTrail: req.params.idTrail });
    if (!reports.length) {
      return res.status(404).json({ message: "Trail not found or no reports available" });
    }
    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// -------- GET /reports/user/:idUser --------
router.get("/user/:idUser", async (req, res) => {
  try {
    const reports = await Report.find({ idUser: req.params.idUser });
    if (!reports.length) {
      return res.status(404).json({ message: "User not found or no reports available" });
    }
    return res.status(200).json(reports);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;