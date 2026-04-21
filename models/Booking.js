const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
      required: true,
    },
    ticket: {
      seatNumber: String,
      issuedAt: { type: Date, default: Date.now },
      qrCode: String,
    },
    phone: String,
    booking_date: { type: Date, default: Date.now },
    ticket_number: String,
    used: { type: Boolean, default: false },
    boarded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookingSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
