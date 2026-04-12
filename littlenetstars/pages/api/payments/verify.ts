import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: "session_id required" });

  const session = await stripe.checkout.sessions.retrieve(String(session_id));
  await dbConnect();
  const booking = await Booking.findById(session.metadata?.bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  res.json({ paid: session.payment_status === "paid", booking });
}
