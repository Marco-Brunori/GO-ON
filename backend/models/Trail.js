import mongoose from "mongoose";

////////////////////////////////////
//////////// Versione 1 ////////////
////////////////////////////////////

/*
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
  tags: { 
    type: String, 
    enum: ["linear_route", "scenic", "geological_highlights", "fauna", "healthy_climate", "round_trip", 
           "cultural/historical_interest", "flora", "out_and_back", "refreshment_stops_available", 
           "family-friendly", "multi-stage_route", "summit_route", "exposed_sections", "insider_tip", 
           "ridge", "cableway_ascent/descent", "suitable_for_strollers", "secured_passages", "dog-friendly",
           "accessibility", "scrambling_required"] 
  },
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
});

export const Trail = mongoose.model("Trail", trailSchema);
*/

/* 
Attenzione: 
1. I file gpx e le varie foto verranno salvate sempre nella cartella /uploads/{id}/gpx e /uploads/{id}/photos. Quindi non serve avere un campo
   con la directory in cui vengono salvate le varie informazioni (compresi i nomi dei file).
2. MongoDB crea automaticamente un ObjectID, quindi non serve inserire un campo id stringa
*/

////////////////////////////////////
//////////// Versione 2 ////////////
////////////////////////////////////

const { Schema } = mongoose;

const validTags = [
  "linear_route", "scenic", "geological_highlights", "fauna", "healthy_climate",
  "round_trip", "cultural/historical_interest", "flora", "out_and_back",
  "refreshment_stops_available", "family-friendly", "multi-stage_route",
  "summit_route", "exposed_sections", "insider_tip", "ridge",
  "cableway_ascent/descent", "suitable_for_strollers", "secured_passages",
  "dog-friendly", "accessibility", "scrambling_required"
];

const coordinatesSchema = new Schema({
  DD: {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lon: { type: Number, required: true, min: -180, max: 180 }
  },
  DMS: {
    lat: { type: String }, 
    lon: { type: String } 
  },
  UTM: {
    zone: { type: String },
    easting: { type: Number, min: 0 },
    northing: { type: Number, min: 0 }
  }
}, { _id: false });

const durationSchema = new Schema({
  hours: { type: Number, min: 0, default: 0 },
  minutes: { type: Number, min: 0, max: 59, default: 0 }
}, { _id: false });

const trailSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  region: {
    type: String,
    required: true,
  },
  valley: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Difficult"],
    default: "Easy"
  },
  lengthKm: {
    type: Number,
    min: 0
  },
  duration: {
    type: durationSchema,
    default: () => ({ hours: 0, minutes: 0 })
  },
  roadbook: { 
    type: String,  
  },
  directions: { 
    type: String, 
  },
  parking: { 
    type: String,  
  },
  ascentM: { 
    type: Number,
    min: 0 
  },
  descentM: { 
    type: Number, 
    min: 0 
  },
  highestPointM: { 
    type: Number 
  },
  lowestPointM: { 
    type: Number 
  },
  tags: {
    type: [{ type: String, enum: validTags }],
    default: []
  },
  coordinates: {
    type: coordinatesSchema,
    required: true
  },
  // GeoJSON Point ricavato da coordinates.DD per query geospaziali
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lon, lat]
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 2 && (v[0] >= -180 && v[0] <= 180) && (v[1] >= -90 && v[1] <= 90);
        }
      }
    }
  },
  // riferimento all'admin che ha creato il trail
  idAdmin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async function (value) {
        const userExists = await mongoose.model("User").exists({ _id: value });
        return !!userExists;
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// INDICI
trailSchema.index({ _id: 1 });
trailSchema.index({ valley: 1 });
trailSchema.index({ difficulty: 1 });
trailSchema.index({ lengthKm: 1 });
trailSchema.index({ "duration.hours": 1, "duration.minutes": 1 });
trailSchema.index({ tags: 1 });
// INDEX: geospatial location
trailSchema.index({ location: "2dsphere" });

// Pre-save hook: popola location da coordinates.DD se presente
trailSchema.pre("save", async function (next) {
  // this è il documento
  try {

    // Vincolo di integrità referenziale per idAdmin
    const userExists = await mongoose.model("User").exists({ _id: this.idAdmin });
    if (!userExists) {
      return next(new Error("L'admin specificato non esiste"));
    }

    // popola location da coordinates.DD se presente
    if (this.coordinates && this.coordinates.DD && this.coordinates.DD.lat != null && this.coordinates.DD.lon != null) {
      const lat = Number(this.coordinates.DD.lat);
      const lon = Number(this.coordinates.DD.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return next(new Error("Invalid numeric coordinates in coordinates.DD"));
      }
      this.location = {
        type: "Point",
        coordinates: [lon, lat]
      };
    }

    // Normalizza tags (rimuove duplicati e spazi)
    if (Array.isArray(this.tags)) {
      this.tags = Array.from(new Set(this.tags.map(t => (typeof t === "string" ? t.trim() : t)).filter(Boolean)));
    }

    // Sanity checks: ascent/descent non negativi e coerenza semplice
    if (this.ascentM != null && this.ascentM < 0) this.ascentM = Math.abs(this.ascentM);
    if (this.descentM != null && this.descentM < 0) this.descentM = Math.abs(this.descentM);
    next();
  } catch (err) {
    next(err);
  }
});

export const Trail = mongoose.model("Trail", trailSchema);