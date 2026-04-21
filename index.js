require("dotenv").config({ path: __dirname + "/.env" });

const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const usersRoutes = require("./routes/Users");
const emailRoutes = require("./routes/Email");
const adminRoutes = require("./routes/Admin");
const commissaryRoutes = require("./routes/Commissary");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/email`, emailRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/commissary`, commissaryRoutes);
app.get("/api/v1", (req, res) => {
  res.send("API is working 🚀");
});

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not defined");
} else {
  console.log("JWT_SECRET loaded");
}

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/trainbooking";

console.log("MongoDB URI:", MONGO_URI);

mongoose
  .connect(MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}${API_PREFIX}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    msg: err.message || "Internal Server Error",
  });
});

module.exports = app;