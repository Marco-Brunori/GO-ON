import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectToMongo } from "./db.js";
import { Trail } from "./models/Trail.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

await connectToMongo();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "uploads/gpx");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = req.body._id || Date.now().toString();
    cb(null, `${id}${ext}`);
  }
});
const upload = multer({ storage });

////////////////////////////////////////////////////////////////////////////////////////
/////// Routes /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
  res.send('Server Funzionante')
})

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post('/api/trails', async (req, res) => {
  try {
    const newTrail = new Trail(req.body);
    await newTrail.save(); 
    res.status(201).json(newTrail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel salvataggio del trail" });
  }
});

app.post("/api/trails", upload.single("gpxFile"), async (req, res) => {
  try {
    const trailData = {
      ...req.body,
      gpxFilePath: req.file ? req.file.path : null
    };
    const newTrail = new Trail(trailData);
    await newTrail.save();
    res.status(201).json(newTrail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel salvataggio del trail" });
  }
});

app.get('/api/trails', async (req, res) => {
  try {
    const trails = await Trail.find();
    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei trail" });
  }
});

 

// 404 page
/*
  Attenzione: questa istruzione deve sempre essere alla fine del routing
*/
/* 
app.use((req, res) => {
  res.status(404).sendFile('./views/404.html', { root: __dirname })
})
*/
////////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT)


/*
b) Caricamento del file via API Express

Usa multer, il middleware standard per upload di file:

npm install multer


Esempio di route:

const express = require('express');
const multer = require('multer');
const path = require('path');
const Trail = require('./models/trail');

const router = express.Router();

// imposta la cartella dove salvare i file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/gpx'); // cartella locale
  },
  filename: (req, file, cb) => {
    // rinomina il file con l'id del sentiero + estensione originale
    const ext = path.extname(file.originalname);
    cb(null, `${req.body._id}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/trails
router.post('/trails', upload.single('gpxFile'), async (req, res) => {
  try {
    const newTrail = new Trail({
      ...req.body,
      gpxFilePath: req.file.path // salva solo il path
    });

    await newTrail.save();
    res.status(201).json(newTrail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


👉 In questo modo nel DB salvi solo il path:

{
  "_id": "trail-001",
  "title": "Sentiero delle Cime",
  "gpxFilePath": "uploads/gpx/trail-001.gpx"
}


E puoi servire il file staticamente da Express:

app.use('/uploads', express.static('uploads'));
*/
