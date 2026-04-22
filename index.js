// ❌ امسح dotenv في production (Fly بياخد secrets)
// require("dotenv").config({ path: __dirname + "/.env" });

console.log("🔥 NEW VERSION 🔥");

const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const usersRoutes = require("./routes/Users");
const emailRoutes = require("./routes/Email");
const adminRoutes = require("./routes/Admin");
const commissaryRoutes = require("./routes/Commissary");
const authRoutes = require("./routes/Auth");
const app = express();

// ================= Middleware =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api/v1/auth", authRoutes);

const API_PREFIX = "/api/v1";

// ================= Routes =================
app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/email`, emailRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/commissary`, commissaryRoutes);

// test route
app.get("/api/v1", (req, res) => {
  res.send("API is working 🚀");
});

// ================= ENV CHECK =================
if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not defined ❌");
} else {
  console.log("JWT_SECRET loaded ✅");
}

console.log("ENV MONGO:", process.env.MONGO_URI);

// ================= Mongo =================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing");
  process.exit(1);
}

console.log("MongoDB URI loaded ✅");

// ================= Start Server =================
mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected successfully ✅");

    const PORT = process.env.PORT || 3000;

    // 🔥 أهم تعديل هنا
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// ================= Error Handler =================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    msg: err.message || "Internal Server Error",
  });
});

module.exports = app;