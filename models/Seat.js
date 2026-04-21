const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    train_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    seat_number: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "booked"],
      default: "available",
    },
    trip_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    seatType: {
      type: String,
      enum: ["economy", "business", "first"],
      default: "economy",
    },
    expireAt: { type: Date, default: null },
  },
  { timestamps: true },
);
seatSchema.index({ train_id: 1, trip_id: 1, seat_number: 1 }, { unique: true });
// ❌ ما تعملش TTL على expireAt

module.exports = mongoose.model("Seat", seatSchema);
