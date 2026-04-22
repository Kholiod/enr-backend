const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ===== Register =====
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // 🔍 Debug (اختياري)
    console.log("BODY:", req.body);

    // ✅ check لو الإيميل موجود
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists",
      });
    }

    // 🔐 تشفير الباسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👤 إنشاء المستخدم
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "User",
    });

    await user.save();

    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    console.log("ERROR:", err.message);

    res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
});

module.exports = router;