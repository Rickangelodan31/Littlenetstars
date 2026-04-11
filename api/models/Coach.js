const mongoose = require("mongoose");

const coachSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true }, // e.g. "Founder & Head Coach"
    bio: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coach", coachSchema);
