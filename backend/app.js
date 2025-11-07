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
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

await connectToMongo();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, "uploads");
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

app.post('/trails', upload.single('gpxFile'), async (req, res) => {
  try {
    const newTrail = new Trail({
      ...req.body,
      gpxFilePath: req.file.path
    });
    await newTrail.save();
    res.status(201).json(newTrail);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/trails', async (req, res) => {
  try {
    const trails = await Trail.find();
    res.json(trails);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei trail" });
  }
});

app.use((req, res) => {
  res.status(404).sendFile('./views/404.html', { root: __dirname })
})
////////////////////////////////////////////////////////////////////////////////////////

app.listen(PORT);