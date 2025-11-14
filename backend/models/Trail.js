import mongoose from "mongoose";

/* 
Attenzione: 
1. I file gpx e le varie foto verranno salvate sempre nella cartella /uploads/{id}/gpx e /uploads/{id}/photos. Quindi non serve avere un campo
   con la directory in cui vengono salvate le varie informazioni (compresi i nomi dei file).
2. MongoDB crea automaticamente un ObjectID, quindi non serve inserire un campo id stringa
*/

const { Schema } = mongoose;

const validTags = [
  "linear_route", "scenic", "geological_highlights", "fauna", "healthy_climate",
  "round_trip", "cultural_historical_interest", "flora", "out_and_back",
  "refreshment_stops_available", "family_friendly", "multi_stage_route",
  "summit_route", "exposed_sections", "insider_tip", "ridge",
  "cableway_ascent_descent", "suitable_for_strollers", "secured_passages",
  "dog_friendly", "accessibility", "scrambling_required"
];

const coordinatesSchema = new Schema({
  DD: {
    lat: { 
      type: Number,
      required: true, 
      min: -90, 
      max: 90 
    },
    lon: { 
      type: Number, 
      required: true, 
      min: -180, 
      max: 180 
    }
  },
  DMS: {
    lat: { 
      type: String 
    }, 
    lon: { 
      type: String 
    } 
  },
  UTM: {
    zone: { 
      type: String 
    },
    easting: { 
      type: Number, 
      min: 0 
    },
    northing: { 
      type: Number, 
      min: 0 
    }
  }
}, { _id: false });

const durationSchema = new Schema({
  hours: { 
    type: Number, 
    min: 0, 
    default: 0 
  },
  minutes: { 
    type: Number, 
    min: 0, 
    max: 59, 
    default: 0 
  }
}, { _id: false });

const trailSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  region: {
    type: String,
    default: ""
  },
  valley: {
    type: String,
    default: ""
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Difficult"],
    default: "Easy"
  },
  lengthKm: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: durationSchema,
    default: () => ({     // bisogna mettere il default, perchè altrimenti non crea proprio l'oggetto e lo mette undefined
      hours: 0,
      minutes: 0 
    })
  },
  roadbook: { 
    type: String,  
    default: ""
  },
  directions: { 
    type: String,
    default: "" 
  },
  parking: { 
    type: String,
    default: ""  
  },
  ascentM: { 
    type: Number,
    default: 0,
    min: 0 
  },
  descentM: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  highestPointM: { 
    type: Number,
    default: 0,
    min: 0
  },
  lowestPointM: { 
    type: Number,
    default: 0,
    min: 0 
  },
  tags: {
    type: [{ 
        type: String, 
        enum: validTags 
      }],
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
      type: [Number],         // [lon, lat]
      index: "2dsphere",      // altrimenti non funzionano le query 
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

trailSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// INDICI
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
    if(this.ascentM != null && this.ascentM < 0) {
      this.ascentM = Math.abs(this.ascentM);
    }
    if(this.descentM != null && this.descentM < 0) {
      this.descentM = Math.abs(this.descentM);
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const Trail = mongoose.model("Trail", trailSchema);