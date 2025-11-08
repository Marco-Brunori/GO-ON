import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI non impostato in .env");
  process.exit(1);
}
export async function connectToMongo() {
  try {
    await mongoose.connect(uri);
    console.log("Connesso a MongoDB");
  } catch (err) {
    console.error("Errore connessione MongoDB", err);
    process.exit(1);
  }
}