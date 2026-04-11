const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const Booking = require("../models/Booking");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/checkout — create Stripe Checkout Session
router.post("/checkout", async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: "bookingId is required" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status === "paid") return res.status(400).json({ error: "Booking already paid" });

    const pricePerChild = Number(process.env.SESSION_PRICE_PENCE) || 2000; // £20 default
    const totalAmount = pricePerChild * booking.children.length;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "LittleNetStars – Netball Session",
              description: `${booking.location} · ${new Date(booking.date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })} · ${booking.time} · ${booking.children.length} child${booking.children.length > 1 ? "ren" : ""}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: booking.parent.email,
      metadata: { bookingId: booking._id.toString() },
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking`,
    });

    // Save session ID so webhook can match it back
    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/webhook — Stripe sends events here
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: "paid",
        amountPaid: session.amount_total,
        stripeSessionId: session.id,
      });
      console.log(`Booking ${bookingId} marked as paid`);
    }
  }

  res.json({ received: true });
});

// GET /api/payments/verify?session_id= — frontend calls this on success page
router.get("/verify", async (req, res, next) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "session_id required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const booking = await Booking.findById(session.metadata?.bookingId);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json({
      paid: session.payment_status === "paid",
      booking,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
