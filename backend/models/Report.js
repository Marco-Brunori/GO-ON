import mongoose from "mongoose";

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    idUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const userExists = await mongoose.model("User").exists({ _id: value });
          return !!userExists;
        }
      },
    },
    idTrail: {
      type: Schema.Types.ObjectId,
      ref: "Trail",
      required: true,
      validate: {
        validator: async function (value) {
          const trailExists = await mongoose.model("Trail").exists({ _id: value });
          return !!trailExists;
        }
      }
    },
    titolo: {
      type: String,
      required: true
    },
    testo: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      enum: ["New", "In progress", "Resolved"],
      default: "New" 
    } 
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ idUser: 1 });

export const Report = mongoose.model("Report", reportSchema);