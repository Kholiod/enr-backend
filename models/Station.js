const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Station", stationSchema);
