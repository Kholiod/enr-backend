const express = require("express");
const router = express.Router();
const usersController = require("../controllers/User");
const { authMiddleware, authorizeRole } = require("../middleware/auth");

// ===== User Booking & Journey =====

router.get(
  "/tickets",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.getMyBooks,
);
router.delete(
  "/bookings/:id",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.deleteBookById,
);
router.get(
  "/stations",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.getAllStations,
);
router.get(
  "/stations/search",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.getStationByName,
);
router.get(
  "/trip/search",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.getTripByStations,
);
router.get(
  "/trips/search",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.getAllTripsByStationId,
);
router.get(
  "/trips/:tripId/seats",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.getSeatsByTrip,
);
router.post(
  "/seats/hold",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.holdSeat,
);
router.post(
  "/booking",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.createBooking,
);
router.get(
  "/trips/route",
  authMiddleware,
  authorizeRole(["User"]),
  usersController.getTripRoute,
);

module.exports = router;

//? 10 routes for 10 methods
