const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// GET /api/bookings/check-free?email= — check if email is eligible for a free session
// Must be defined BEFORE /:id to avoid "check-free" being treated as an id
router.get("/check-free", async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "email is required" });

    const existing = await Booking.findOne({
      "parent.email": email.toLowerCase().trim(),
      isFreeSession: true,
    });

    res.json({ eligible: !existing });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings — create a new booking (free or paid)
router.post("/", async (req, res, next) => {
  try {
    const { location, date, time, children, parent } = req.body;

    if (!location || !date || !time || !children?.length || !parent?.email) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    // Validate date is a weekend
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getUTCDay(); // 0=Sun, 6=Sat
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      return res.status(400).json({ error: "Sessions are only available on weekends" });
    }

    // Check if this email has already used their free session
    const existingFreeSession = await Booking.findOne({
      "parent.email": parent.email.toLowerCase().trim(),
      isFreeSession: true,
    });
    const isFreeSession = !existingFreeSession;

    const booking = await Booking.create({
      location,
      date: bookingDate,
      time,
      children,
      parent,
      isFreeSession,
      // Free sessions are confirmed immediately — paid sessions await Stripe
      status: isFreeSession ? "paid" : "pending_payment",
      amountPaid: isFreeSession ? 0 : undefined,
    });

    res.status(201).json({ bookingId: booking._id, isFreeSession });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:id — fetch a single booking
router.get("/:id", async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
