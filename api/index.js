require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const bookingsRouter = require("./routes/bookings");
const paymentsRouter = require("./routes/payments");
const adminRouter = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Stripe webhooks must receive raw body — mount before json parser
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3001",
];
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)) }));
app.use(express.json());

app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
