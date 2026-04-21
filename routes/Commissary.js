const express = require("express");
const router = express.Router();
const CommissaryController = require("../controllers/comssary");
const { authMiddleware, authorizeRole } = require("../middleware/auth");

// Protect commissary routes → لازم يكون الدور Commissary
const commissaryOnly = [authMiddleware, authorizeRole(["Commissary"])];

// ===== Ticket Verification =====
router.post(
  "/tickets/verify",
  ...commissaryOnly,
  CommissaryController.verifyQRCode,
);

module.exports = router;
//? 1 route for commissary method
