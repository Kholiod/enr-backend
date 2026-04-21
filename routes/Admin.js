const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/Admin");
const { authMiddleware, authorizeRole } = require("../middleware/auth");

const adminOnly = [authMiddleware, authorizeRole(["Admin"])];

// ===== Create =====
router.post("/trains", ...adminOnly, AdminController.createTrains);
router.post("/train", ...adminOnly, AdminController.createTrain);
router.post("/trips", ...adminOnly, AdminController.createTrips);
router.post("/trip", ...adminOnly, AdminController.createTrip);
router.post("/seats", ...adminOnly, AdminController.createSeats);
router.post("/seat", ...adminOnly, AdminController.createSeat);
router.post("/stations", ...adminOnly, AdminController.createStations);
router.post("/station", ...adminOnly, AdminController.createStation);

// ======= Get ========
router.get(
  "/trains/:trainId/seats",
  ...adminOnly,
  AdminController.getSeatsByTrainId,
);
router.get("/trips/route", ...adminOnly, AdminController.getTripRoute);
router.get("/trips", ...adminOnly, AdminController.getAllTrips);
router.get("/users", ...adminOnly, AdminController.getAllUsers);
router.get("/trips/:id", ...adminOnly, AdminController.getTripById);
router.get("/trips/search", ...adminOnly, AdminController.getTripByStations);
router.get("/trains", ...adminOnly, AdminController.getAllTrains);
router.get("/train/:id", ...adminOnly, AdminController.getTrainById);
router.get("/stations", ...adminOnly, AdminController.getAllStations);
router.get("/station/:id", ...adminOnly, AdminController.getStationById);
router.get("/seats/byTrip", ...adminOnly, AdminController.getSeatsByTripId);

// ===== Update =====
router.put("/trips/:id", ...adminOnly, AdminController.updateTripById);
router.put("/trains/:id", ...adminOnly, AdminController.updateTrainById);
router.put("/stations/:id", ...adminOnly, AdminController.updateStationById);
router.put("/seats/:id", ...adminOnly, AdminController.updateSeatById);

// ===== Delete single =====
router.delete("/trips/:id", ...adminOnly, AdminController.deleteTripById);
router.delete("/trains/:id", ...adminOnly, AdminController.deleteTrainById);
router.delete("/stations/:id", ...adminOnly, AdminController.deleteStationById);
router.delete("/seats/:id", ...adminOnly, AdminController.deleteSeatById);

// ===== Dangerous endpoints (Admin only) =====
router.delete("/stations", ...adminOnly, AdminController.deleteAllStations);
router.delete("/trains", ...adminOnly, AdminController.deleteAllTrains);
router.delete("/trips", ...adminOnly, AdminController.deleteAllTrips);
router.delete("/seats", ...adminOnly, AdminController.deleteAllSeats);
router.delete("/database/freeup", ...adminOnly, AdminController.databaseFreeUp);

module.exports = router;
