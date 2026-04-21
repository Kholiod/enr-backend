const User = require("../models/User");
const bcrypt = require("bcryptjs");
const client = require("twilio")(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH,
);
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

exports.signup = async (req, res) => {
  try {
    const {
      name,
      phone,
      country,
      role,
      email,
      password,
      nationalId,
      dateOfBirth,
      oauthProvider,
      oauthToken,
    } = req.body;

    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP for signup verification
    const signupOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    user = new User({
      name,
      email,
      phone,
      country,
      role,
      dateOfBirth,
      password: hashedPassword,
      nationalId,
      isVerified: false,
      signupOtp,
      signupOtpExpires: otpExpires,
      oauthProvider: oauthProvider || "local",
      oauthToken,
    });
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Verify your account",
        text: `Your signup OTP is ${signupOtp}. It will expire in 5 minutes.`,
      });

      // ✅ إذا الإيميل اتبعت بنجاح
      res.json({ success: true, msg: "Signup initiated. OTP sent to email." });
    } catch (mailErr) {
      // ⚠️ لو فيه مشكلة في الإيميل، رجّع الـ OTP للمستخدم
      res.json({
        success: true,
        msg: "Signup initiated. Email sending failed, use OTP manually.",
        otp: signupOtp,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error signing up", error: err.message });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, msg: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    if (user.isVerified)
      return res.json({ success: true, msg: "Email already verified" });

    if (user.signupOtp !== otp || Date.now() > user.signupOtpExpires) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.signupOtp = null;
    user.signupOtpExpires = null;
    await user.save();

    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      success: true,
      msg: "Email verified successfully",
      token: authToken,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error verifying email",
      error: err.message,
    });
  }
};
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    if (user.isVerified)
      return res.json({ success: true, msg: "Email already verified" });

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.signupOtp = newOtp;
    user.signupOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Resend Verification Code",
      text: `Your new OTP is ${newOtp}. It will expire in 5 minutes.`,
    });

    res.json({ success: true, msg: "New OTP sent to email" });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error resending OTP",
      error: err.message,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    if (!user.isVerified)
      return res
        .status(403)
        .json({ success: false, msg: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({ success: true, msg: "Login successful", token, data: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error logging in", error: err.message });
  }
};
exports.loginForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, msg: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    // Generate OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    user.tempOtp = resetOtp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${resetOtp}. It will expire in 5 minutes.`,
    });

    res.json({ success: true, msg: "OTP sent to email" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, msg: "Error sending OTP", error: err.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ success: false, msg: "Email, OTP, and new password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    if (user.tempOtp !== otp || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.tempOtp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error resetting password",
      error: err.message,
    });
  }
};
exports.getAccount = async (req, res) => {
  try {
    const { identifier } = req.params;
    const user = await User.findOne({
      $or: [{ _id: identifier }, { email: identifier }, { phone: identifier }],
    });
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error fetching account",
      error: err.message,
    });
  }
};
exports.updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Prevent password update here (must use resetPassword flow)
    if (updates.password) delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    res.json({ success: true, msg: "Account updated", data: user });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error updating account",
      error: err.message,
    });
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ success: false, msg: "User not found" });

    res.json({ success: true, msg: "Account deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error deleting account",
      error: err.message,
    });
  }
};

// 9 Methods crud opertions
//? extra notes : resetPassword, loginForgetPassword, resendOtp, verifyEmail
