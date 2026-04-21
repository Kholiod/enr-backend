const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: { type: String, required: true, trim: true, minlength: 6 },

    phone: {
      type: String,
      required: true,
      unique: false,
      trim: true,
      match: [/^\+\d{10,15}$/, "Phone must be in format +1234567890"],
    },

    country: { type: String, trim: true },

    role: {
      type: String,
      enum: ["Admin", "Commissary", "User"],
      default: "User",
      required: true,
      trim: true,
    },

    nationalId: { type: String, trim: true },

    dateOfBirth: {
      type: String,
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"],
    },

    // ===== Verification & Security =====
    isVerified: { type: Boolean, default: false },

    // OTP for signup verification
    signupOtp: { type: String },
    signupOtpExpires: { type: Date },

    // OTP for password reset
    tempOtp: { type: String },
    otpExpires: { type: Date },

    // OAuth provider info
    oauthProvider: {
      type: String,
      enum: ["google", "facebook", "local"],
      default: "local",
    },
    oauthToken: { type: String }, // store last verified token if needed
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
