import express from 'express';
import mongoose from 'mongoose';
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectToMongo } from "./db.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import trailRouter from "./routes/Trail.js";
import reportRouter from "./routes/Report.js";
import feedbacksRouter from "./routes/Feedback.js";
import usersRouter from "./routes/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

await connectToMongo();

/* DA FARE:
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
*/

//////////////////////
/////// Routes ///////
//////////////////////
app.get('/', (req, res) => {
  res.send('Server Funzionante')
})

app.use("/trails", trailRouter);
app.use("/reports", reportRouter);
app.use("/feedbacks", feedbacksRouter);
app.use("/users", usersRouter);

//////////////////////

app.listen(PORT);