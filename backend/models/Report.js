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
    testo: {
      type: String,
      required: true
    },
    state: {
      type: String,
      enum: ["New", "In progress", "Resolved"],
      default: "New" 
    } 
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reportSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

reportSchema.index({ idUser: 1 });
reportSchema.index({ idTrail: 1 });

export const Report = mongoose.model("Report", reportSchema);