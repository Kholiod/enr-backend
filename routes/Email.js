const express = require("express");
const router = express.Router();
const EmailController = require("../controllers/Email");
const { authMiddleware, checkOwner } = require("../middleware/auth");

router.post("/verify-email", EmailController.verifyEmail);
router.post("/signup", EmailController.signup);
router.post("/login", EmailController.login);
router.post("/resendOtp", EmailController.resendOtp);
router.post("/login-forget-password", EmailController.loginForgetPassword);
router.post("/reset-password", EmailController.resetPassword);
router.get("/accounts/:identifier", authMiddleware, EmailController.getAccount);
router.put(
  "/accounts/:id",
  authMiddleware,
  checkOwner("id"),
  EmailController.updateAccount,
);
router.delete(
  "/accounts/:id",
  authMiddleware,
  checkOwner("id"),
  EmailController.deleteAccount,
);

module.exports = router;

// 9 routes for 9 methods
