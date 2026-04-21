const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema(
  {
    number: { type: Number, unique: true, required: true }, // unique train number
    name: { type: String, required: true, trim: true }, // not unique
    route: { type: String, required: true, trim: true }, // not unique
    seats: {
      type: Number,
      required: true,
      min: [1, "Train must have at least 1 seat"],
    },
  },
  { timestamps: true },
);

// Optional: index for faster lookups
trainSchema.index({ name: 1 });
trainSchema.index({ route: 1 });

module.exports = mongoose.model("Train", trainSchema);
