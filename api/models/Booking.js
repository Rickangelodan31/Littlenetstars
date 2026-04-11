const mongoose = require("mongoose");

const childSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 3, max: 18 },
});

const bookingSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      enum: ["London", "Manchester"],
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    children: { type: [childSchema], required: true, validate: [(v) => v.length > 0, "At least one child required"] },
    parent: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "cancelled"],
      default: "pending_payment",
    },
    isFreeSession: { type: Boolean, default: false },
    stripeSessionId: { type: String },
    amountPaid: { type: Number }, // pence (GBP)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
