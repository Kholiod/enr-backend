const { v4: uuidv4 } = require("uuid");
const Station = require("../models/Station");
const Trip = require("../models/Trip");
const Seat = require("../models/Seat");
const Booking = require("../models/Booking");
const QRCode = require("qrcode");

// ===== User Journey =====
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    return res.json({ success: true, msg: "Stations fetched", data: stations });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error fetching stations",
      error: err.message,
    });
  }
};
exports.getStationByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name)
      return res
        .status(400)
        .json({ success: false, msg: "Station name required" });

    const stations = await Station.find({ name: new RegExp(name, "i") });
    return res.json({ success: true, msg: "Stations fetched", data: stations });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error fetching station",
      error: err.message,
    });
  }
};
exports.getTripByStations = async (req, res) => {
  try {
    const { fromStation, toStation, date } = req.query;
    if (!fromStation || !toStation) {
      return res
        .status(400)
        .json({ success: false, msg: "Missing station parameters" });
    }

    const query = { fromStation, toStation };
    if (date) query.departureDate = { $gte: new Date(date) };

    const trips = await Trip.find(query).populate(
      "train_id fromStation toStation",
    );
    return res.json({ success: true, msg: "Trips fetched", data: trips });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error fetching trips",
      error: err.message,
    });
  }
};
exports.getAllTripsByStationId = async (req, res) => {
  try {
    const { stationId } = req.query;

    if (!stationId) {
      return res.status(400).json({
        success: false,
        msg: "stationId is required",
      });
    }

    const trips = await Trip.find({
      $or: [{ fromStation: stationId }, { toStation: stationId }],
    })
      .populate("train_id")
      .populate("fromStation")
      .populate("toStation");

    if (!trips || trips.length === 0) {
      return res.json({
        success: true,
        msg: "No trips found for this station",
        data: [],
      });
    }

    res.json({
      success: true,
      msg: "Trips fetched successfully",
      data: trips,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching trips",
      error: err.message,
    });
  }
};
exports.getSeatsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const seats = await Seat.find({ trip_id: tripId }).populate(
      "reservedBy",
      "-password",
    );
    return res.json({ success: true, msg: "Seats fetched", data: seats });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error fetching seats",
      error: err.message,
    });
  }
};
exports.getTripRoute = async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const query = {};
    if (from) query.fromStation = from;
    if (to) query.toStation = to;
    if (date) query.departureDate = { $gte: new Date(date) };

    const trips = await Trip.find(query).populate(
      "train_id fromStation toStation",
    );
    if (!trips || trips.length === 0)
      return res.status(404).json({ success: false, msg: "No trips found" });

    const routes = trips.map((trip) => ({
      train: trip.train_id.name,
      route: trip.train_id.route,
      fromStation: trip.fromStation.name,
      toStation: trip.toStation.name,
      departureDate: trip.departureDate,
      arrivalDate: trip.arrivalDate,
      durationHours: trip.durationHours,
      price: trip.price,
    }));

    return res.json({
      success: true,
      msg: "Trip routes fetched successfully",
      data: routes,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error fetching trip routes",
      error: err.message,
    });
  }
};
exports.holdSeat = async (req, res) => {
  const { trainId, seatNumber, tripId } = req.body;
  try {
    if (!req.user || !req.user.id) {
      return res.status(403).json({ success: false, msg: "Unauthorized" });
    }

    const HOLD_TIME = 5 * 60 * 1000;

    // Clean expired holds
    await Seat.updateMany(
      {
        train_id: trainId,
        seat_number: seatNumber,
        trip_id: tripId,
        status: "reserved",
        expireAt: { $lt: Date.now() },
      },
      { $set: { status: "available", reservedBy: null, expireAt: null } },
    );

    // Atomic reserve
    const seat = await Seat.findOneAndUpdate(
      {
        train_id: trainId,
        seat_number: seatNumber,
        trip_id: tripId,
        status: "available",
      },
      {
        $set: {
          status: "reserved",
          reservedBy: req.user.id,
          expireAt: new Date(Date.now() + HOLD_TIME),
        },
      },
      { new: true },
    );

    if (!seat)
      return res
        .status(400)
        .json({ success: false, msg: "Seat already reserved or booked" });

    const booking = new Booking({
      user_id: req.user.id,
      trip: tripId,
      seat: seat._id,
      train: trainId,
      status: "pending",
      ticket: { seatNumber, issuedAt: new Date() },
    });
    await booking.save();

    return res.json({
      success: true,
      msg: "Seat held",
      data: {
        seatId: seat._id,
        bookingId: booking._id,
        expiresAt: seat.expireAt,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, msg: "Error holding seat", error: err.message });
  }
};
exports.createBooking = async (req, res) => {
  const { tripId, seatId, trainId, phone, paymentStatus } = req.body;
  try {
    const seat = await Seat.findById(seatId);
    if (!seat)
      return res.status(404).json({ success: false, msg: "Seat not found" });

    // لو الكرسي محجوز لكن الوقت انتهى → رجعه متاح
    if (
      seat.status === "reserved" &&
      seat.expireAt &&
      seat.expireAt < Date.now()
    ) {
      seat.status = "available";
      seat.reservedBy = null;
      seat.expireAt = null;
      await seat.save();
    }

    // لازم الدفع الأول
    if (paymentStatus !== "paid") {
      return res
        .status(400)
        .json({ success: false, msg: "Payment required before booking" });
    }

    // لو الكرسي متاح → احجز مباشرة بعد الدفع
    if (seat.status === "available") {
      seat.status = "booked";
      seat.reservedBy = req.user.id;
      seat.expireAt = null;
      await seat.save();
    }
    // لو الكرسي محجوز من نفس المستخدم ولسه الوقت ما انتهاش → احجزه بعد الدفع
    else if (
      seat.status === "reserved" &&
      seat.reservedBy.toString() === req.user.id &&
      seat.expireAt > Date.now()
    ) {
      seat.status = "booked";
      seat.expireAt = null;
      await seat.save();
    }
    // لو الكرسي محجوز من مستخدم آخر ولسه الوقت شغال → ارفض
    else if (
      seat.status === "reserved" &&
      seat.reservedBy.toString() !== req.user.id
    ) {
      return res
        .status(400)
        .json({ success: false, msg: "Seat reserved by another user" });
    }
    // لو الكرسي محجوز بالفعل → ارفض
    else if (seat.status === "booked") {
      return res
        .status(400)
        .json({ success: false, msg: "Seat already booked" });
    }

    // إنشاء التذكرة
    const ticketNumber = uuidv4();
    const qrCodeData = await QRCode.toDataURL(ticketNumber);

    const booking = new Booking({
      user_id: req.user.id,
      trip: tripId,
      seat: seatId,
      train: trainId,
      phone,
      status: "paid", // لازم يكون مدفوع
      booking_date: Date.now(),
      ticket_number: ticketNumber,
      ticket: {
        seatNumber: seat.seat_number,
        issuedAt: new Date(),
        qrCode: qrCodeData,
      },
      used: false,
      boarded: false,
    });

    await booking.save();

    // ✅ احسب عدد الحجوزات المدفوعة للمستخدم بعد الإنشاء
    const count = await Booking.countDocuments({
      user_id: req.user.id,
      status: "paid",
    });

    return res.json({
      success: true,
      msg: "Booking created",
      count, // ✅ يرجع العداد
      data: booking,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error creating booking",
      error: err.message,
    });
  }
};
exports.getMyBooks = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user_id: req.user.id, // ✅ يعتمد على التوكن فقط
      status: "paid",
    })
      .populate("trip seat train")
      .lean();

    const count = bookings ? bookings.length : 0; // ✅ العداد

    if (count === 0) {
      return res.json({
        success: true,
        msg: "No bookings found for this user",
        count, // ✅ يرجع العداد
        data: [],
      });
    }

    res.json({
      success: true,
      msg: "Bookings fetched",
      count, // ✅ يرجع العداد
      data: bookings,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error fetching bookings",
      error: err.message,
    });
  }
};
exports.deleteBookById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user_id: req.user.id, // ✅ يعتمد على التوكن فقط
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        msg: "Booking not found or not owned by you",
      });
    }

    await booking.remove();

    res.json({
      success: true,
      msg: "Booking deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: "Error deleting booking",
      error: err.message,
    });
  }
};

//? 10 methods for UserOperations
