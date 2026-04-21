const Booking = require("../models/Booking");

// ✅ Verify QR Code
// يستخدمه الـ Commissary لما يمر على الركاب ويمسح الكود
exports.verifyQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) {
      return res.status(400).json({ success: false, msg: "QR Code required" });
    }

    // ابحث عن الحجز باستخدام الـ QR Code
    const booking = await Booking.findOne({ "ticket.qrCode": qrCode });

    if (!booking) {
      return res.status(404).json({ success: false, msg: "Invalid QR Code" });
    }

    // تحقق إذا التذكرة مستخدمة بالفعل
    if (booking.used) {
      return res
        .status(400)
        .json({ success: false, msg: "Ticket already used" });
    }

    // ✅ علم التذكرة إنها مستخدمة
    booking.used = true;
    await booking.save();

    res.json({
      success: true,
      msg: "Ticket verified successfully",
      data: {
        bookingId: booking._id,
        user_id: booking.user_id,
        trip: booking.trip,
        seat: booking.seat,
        train: booking.train,
        status: booking.status,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: "Error verifying QR Code",
      error: err.message,
    });
  }
};

// ? 1 method for commissary
