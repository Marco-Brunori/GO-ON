import mongoose from "mongoose";

const { Schema } = mongoose;

const feedbackSchema = new Schema(
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
      }
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
      default: ""
    },
    valutazione: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

feedbackSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

feedbackSchema.index({ idUser: 1 });
feedbackSchema.index({ valutazione: 1 });

export const Feedback = mongoose.model("Feedback", feedbackSchema);