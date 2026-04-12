import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.littlenetstars.co.uk";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "bookingId is required" });

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.status === "paid") return res.status(400).json({ error: "Booking already paid" });

  const pricePerChild = Number(process.env.SESSION_PRICE_PENCE) || 3000;
  const totalAmount = pricePerChild * booking.children.length;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "gbp",
        product_data: {
          name: "LittleNetStars – Netball Session",
          description: `${booking.location} · ${new Date(booking.date).toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long",
          })} · ${booking.time} · ${booking.children.length} child${booking.children.length > 1 ? "ren" : ""}`,
        },
        unit_amount: totalAmount,
      },
      quantity: 1,
    }],
    customer_email: booking.parent.email,
    metadata: { bookingId: booking._id.toString() },
    mode: "payment",
    success_url: `${SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/booking`,
  });

  booking.stripeSessionId = session.id;
  await booking.save();

  res.json({ url: session.url });
}
