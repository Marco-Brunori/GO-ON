import mongoose from "mongoose";

const trailSchema = new mongoose.Schema({
  _id: String,
  title: String,
  description: String,
  region: String,
  valley: String,
  difficulty: { type: String, enum: ["Easy", "Medium", "Difficult"] },
  lengthKm: Number,
  duration: {
    hours: { type: Number, min: 0 },
    minutes: { type: Number, min: 0, max: 59 }
  },
  roadbook: String,
  directions: String,
  parking: String,
  ascentM: Number,
  descentM: Number,
  highestPointM: Number,
  lowestPointM: Number,
  tags: [String],
  coordinates: {
    DD: {
      lat: Number,
      lon: Number
    },
    DMS: {
      lat: String,
      lon: String
    },
    UTM: {
      zone: String,
      easting: Number,
      northing: Number
    } 
  },
  gpxFilePath: String
});

export const Trail = mongoose.model("Trail", trailSchema);