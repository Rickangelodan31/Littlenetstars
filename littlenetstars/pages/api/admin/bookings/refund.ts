import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try { jwt.verify(token, process.env.JWT_SECRET!); }
  catch { return res.status(401).json({ error: "Invalid token" }); }

  const { bookingId } = req.body as { bookingId: string };
  if (!bookingId) return res.status(400).json({ error: "bookingId required" });

  await dbConnect();
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.status === "refunded") return res.status(400).json({ error: "Already refunded" });
  if (booking.isFreeSession || !booking.amountPaid || booking.amountPaid === 0) {
    return res.status(400).json({ error: "No charge to refund for this booking" });
  }
  if (booking.status !== "paid") {
    return res.status(400).json({ error: "Only paid bookings can be refunded" });
  }
  if (!booking.stripeSessionId) {
    return res.status(400).json({ error: "No Stripe session linked to this booking" });
  }

  // Retrieve the Stripe checkout session to get the payment intent
  const session = await stripe.checkout.sessions.retrieve(booking.stripeSessionId);
  if (!session.payment_intent) {
    return res.status(400).json({ error: "No payment intent found — this may be a subscription-based booking" });
  }

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id;

  // Issue full refund via Stripe
  const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });

  // Mark booking as refunded
  await Booking.findByIdAndUpdate(bookingId, {
    status: "refunded",
    refundedAt: new Date(),
    stripeRefundId: refund.id,
  });

  res.json({ success: true, refundId: refund.id });
}
