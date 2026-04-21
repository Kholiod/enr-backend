const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    train_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    fromStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    toStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value > Date.now(),
        message: "Departure date must be in the future",
      },
    },
    arrivalDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.departureDate;
        },
        message: "Arrival date must be after departure date",
      },
    },
    price: { type: Number, required: true, min: [0, "Price must be positive"] },
  },
  { timestamps: true },
);

tripSchema.virtual("durationHours").get(function () {
  if (this.departureDate && this.arrivalDate) {
    const diffMs = this.arrivalDate - this.departureDate;
    return Math.round(diffMs / (1000 * 60 * 60));
  }
  return null;
});

tripSchema.index({ fromStation: 1, toStation: 1, departureDate: 1 });

module.exports = mongoose.model("Trip", tripSchema);
