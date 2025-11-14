import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  role: {
    type: String,
    enum: ["admin", "base"],
    default: "base"
  },
  favourites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trail" // riferimento al modello Trail
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const User = mongoose.model("User", userSchema);