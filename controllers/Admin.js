const Trip = require("../models/Trip");
const Station = require("../models/Station");
const Seat = require("../models/Seat");
const Train = require("../models/Train");
const User = require("../models/User");
const Booking = require("../models/Booking");

// ===== Create =====
exports.createStations = async (req, res) => {
  try {
    const stations = await Station.insertMany(req.body.stations);

    // ✅ احسب عدد المحطات اللي اتعملت
    const count = stations ? stations.length : 0;

    res.json({
      success: true,
      msg: "Stations created successfully",
      count, // ✅ يرجع العداد
      data: stations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating stations",
      error: err.message,
    });
  }
};
exports.createStation = async (req, res) => {
  try {
    const station = new Station(req.body);
    await station.save();

    // ✅ احسب العدد الإجمالي للمحطات بعد الإضافة
    const count = await Station.countDocuments();

    res.json({
      success: true,
      msg: "Station created successfully",
      count, // ✅ يرجع العداد
      data: station,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating station",
      error: err.message,
    });
  }
};
exports.createTrains = async (req, res) => {
  try {
    const trains = await Train.insertMany(req.body.trains);

    // ✅ احسب عدد القطارات اللي اتعملت
    const count = trains ? trains.length : 0;

    res.json({
      success: true,
      msg: "Trains created successfully",
      count, // ✅ يرجع العداد
      data: trains,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating trains",
      error: err.message,
    });
  }
};
exports.createTrain = async (req, res) => {
  try {
    const train = new Train(req.body);
    await train.save();

    // ✅ احسب عدد القطارات بعد الإضافة
    const count = await Train.countDocuments();

    res.json({
      success: true,
      msg: "Train created successfully",
      count, // ✅ يرجع العداد
      data: train,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating train",
      error: err.message,
    });
  }
};
exports.createTrips = async (req, res) => {
  try {
    const trips = await Trip.insertMany(req.body.trips);

    // ✅ احسب عدد الرحلات اللي اتعملت
    const count = trips ? trips.length : 0;

    res.json({
      success: true,
      msg: "Trips created successfully",
      count, // ✅ يرجع العداد
      data: trips,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating trips",
      error: err.message,
    });
  }
};
exports.createTrip = async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();

    // ✅ احسب العدد الإجمالي للرحلات بعد الإضافة
    const count = await Trip.countDocuments();

    res.json({
      success: true,
      msg: "Trip created successfully",
      count, // ✅ يرجع العداد
      data: trip,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating trip",
      error: err.message,
    });
  }
};
exports.createSeats = async (req, res) => {
  try {
    const seats = await Seat.insertMany(req.body.seats);

    // ✅ احسب عدد المقاعد اللي اتعملت
    const count = seats ? seats.length : 0;

    res.json({
      success: true,
      msg: "Seats created successfully",
      count, // ✅ يرجع العداد
      data: seats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating seats",
      error: err.message,
    });
  }
};
exports.createSeat = async (req, res) => {
  try {
    const seat = new Seat(req.body);
    await seat.save();

    // ✅ احسب العدد الإجمالي للمقاعد بعد الإضافة
    const count = await Seat.countDocuments();

    res.json({
      success: true,
      msg: "Seat created successfully",
      count, // ✅ يرجع العداد
      data: seat,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error creating seat",
      error: err.message,
    });
  }
};
// ===== Get =====
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate("train_id")
      .populate("fromStation")
      .populate("toStation");
    if (!trip)
      return res.status(404).json({ success: false, msg: "Trip not found" });
    res.json({ success: true, msg: "Trip fetched successfully", data: trip });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error fetching trip", error: err.message });
  }
};
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("train_id")
      .populate("fromStation")
      .populate("toStation");

    if (!trips || trips.length === 0) {
      return res.json({
        success: true,
        msg: "No trips found",
        data: [],
      });
    }

    res.json({
      success: true,
      msg: "All trips fetched successfully",
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
exports.getAllTrains = async (req, res) => {
  try {
    const trains = await Train.find();
    res.json({
      success: true,
      msg: "Trains fetched successfully",
      data: trains,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching trains",
      error: err.message,
    });
  }
};
exports.getTrainById = async (req, res) => {
  try {
    const train = await Train.findById(req.params.id);
    if (!train)
      return res.status(404).json({ success: false, msg: "Train not found" });
    res.json({ success: true, msg: "Train fetched successfully", data: train });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching train",
      error: err.message,
    });
  }
};
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.json({
      success: true,
      msg: "Stations fetched successfully",
      data: stations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching stations",
      error: err.message,
    });
  }
};
exports.getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station)
      return res.status(404).json({ success: false, msg: "Station not found" });
    res.json({
      success: true,
      msg: "Station fetched successfully",
      data: station,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching station",
      error: err.message,
    });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, msg: "Users fetched successfully", data: users });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching users",
      error: err.message,
    });
  }
};
exports.getSeatsByTrainId = async (req, res) => {
  try {
    const seats = await Seat.find({ train_id: req.params.trainId })
      .populate("trip_id")
      .populate("reservedBy", "-password"); // optional: show user info without password

    if (!seats || seats.length === 0) {
      return res
        .status(404)
        .json({ success: false, msg: "No seats found for this train" });
    }

    res.json({
      success: true,
      msg: "Seats fetched successfully",
      data: seats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching seats by train ID",
      error: err.message,
    });
  }
};
exports.getSeatsByTripId = async (req, res) => {
  try {
    const { tripId } = req.query;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        msg: "tripId is required",
      });
    }

    const seats = await Seat.find({ trip_id: tripId })
      .populate("train_id")
      .populate("trip_id")
      .populate("reservedBy");

    if (!seats || seats.length === 0) {
      return res.json({
        success: true,
        msg: "No seats found for this trip",
        data: [],
      });
    }

    res.json({
      success: true,
      msg: "Seats fetched successfully",
      data: seats,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching seats",
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
exports.getTripRoute = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    // Build query object
    const query = {};
    if (from) query.fromStation = from;
    if (to) query.toStation = to;
    if (date) {
      const departureDate = new Date(date);
      query.departureDate = { $gte: departureDate };
    }

    const trips = await Trip.find(query)
      .populate("train_id")
      .populate("fromStation")
      .populate("toStation");

    if (!trips || trips.length === 0) {
      return res.status(404).json({ success: false, msg: "No trips found" });
    }

    // Map trips into route details
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

    res.json({
      success: true,
      msg: "Trip routes fetched successfully",
      data: routes,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching trip routes",
      error: err.message,
    });
  }
};

// ===== Update =====
exports.updateTripById = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!trip)
      return res.status(404).json({ success: false, msg: "Trip not found" });
    res.json({ success: true, msg: "Trip updated successfully", data: trip });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error updating trip", error: err.message });
  }
};

exports.updateTrainById = async (req, res) => {
  try {
    const train = await Train.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!train)
      return res.status(404).json({ success: false, msg: "Train not found" });
    res.json({ success: true, msg: "Train updated successfully", data: train });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error updating train",
      error: err.message,
    });
  }
};

exports.updateStationById = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!station)
      return res.status(404).json({ success: false, msg: "Station not found" });
    res.json({
      success: true,
      msg: "Station updated successfully",
      data: station,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error updating station",
      error: err.message,
    });
  }
};

exports.updateSeatById = async (req, res) => {
  try {
    const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!seat)
      return res.status(404).json({ success: false, msg: "Seat not found" });
    res.json({ success: true, msg: "Seat updated successfully", data: seat });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error updating seat", error: err.message });
  }
};

exports.deleteTripById = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip)
      return res.status(404).json({ success: false, msg: "Trip not found" });
    res.json({ success: true, msg: "Trip deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error deleting trip", error: err.message });
  }
};

exports.deleteTrainById = async (req, res) => {
  try {
    const train = await Train.findByIdAndDelete(req.params.id);
    if (!train)
      return res.status(404).json({ success: false, msg: "Train not found" });
    res.json({ success: true, msg: "Train deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting train",
      error: err.message,
    });
  }
};

exports.deleteStationById = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station)
      return res.status(404).json({ success: false, msg: "Station not found" });
    res.json({ success: true, msg: "Station deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting station",
      error: err.message,
    });
  }
};

exports.deleteSeatById = async (req, res) => {
  try {
    const seat = await Seat.findByIdAndDelete(req.params.id);
    if (!seat)
      return res.status(404).json({ success: false, msg: "Seat not found" });
    res.json({ success: true, msg: "Seat deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error deleting seat", error: err.message });
  }
};

// ===== Dangerous endpoints (Admin only) =====
exports.deleteAllStations = async (req, res) => {
  try {
    await Station.deleteMany({});
    res.json({
      success: true,
      msg: "All stations deleted successfully (Admin only)",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting stations",
      error: err.message,
    });
  }
};

exports.deleteAllTrains = async (req, res) => {
  try {
    await Train.deleteMany({});
    res.json({
      success: true,
      msg: "All trains deleted successfully (Admin only)",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting trains",
      error: err.message,
    });
  }
};

exports.deleteAllTrips = async (req, res) => {
  try {
    await Trip.deleteMany({});
    res.json({
      success: true,
      msg: "All trips deleted successfully (Admin only)",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting trips",
      error: err.message,
    });
  }
};

exports.deleteAllSeats = async (req, res) => {
  try {
    await Seat.deleteMany({});
    res.json({
      success: true,
      msg: "All seats deleted successfully (Admin only)",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting seats",
      error: err.message,
    });
  }
};

exports.databaseFreeUp = async (req, res) => {
  try {
    await Promise.all([
      Station.deleteMany({}),
      User.deleteMany({}),
      Train.deleteMany({}),
      Trip.deleteMany({}),
      Seat.deleteMany({}),
      Booking.deleteMany({}),
      User.deleteMany({ role: { $ne: "Admin" } }), // ⚠️ احذف كل المستخدمين ما عدا الـ Admin
    ]);
    res.json({
      success: true,
      msg: "Database free-up complete: all collections wiped (Admin only)",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error during database free-up",
      error: err.message,
    });
  }
};
