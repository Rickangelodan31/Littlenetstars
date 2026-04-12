import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.littlenetstars.co.uk";

const PLANS = {
  saturdays: {
    amount: 10000,
    name: "LittleNetStars – Saturday Sessions",
    description: "All Saturday netball sessions for the month (approx. 4 sessions)",
  },
  both: {
    amount: 16000,
    name: "LittleNetStars – Weekend Sessions",
    description: "All Saturday & Sunday netball sessions for the month (up to 8 sessions)",
  },
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { plan, email, name } = req.body as {
    plan: "saturdays" | "both";
    email: string;
    name: string;
  };

  if (!plan || !email || !name) {
    return res.status(400).json({ error: "plan, email and name are required" });
  }
  if (!(plan in PLANS)) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  const config = PLANS[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: config.amount,
          recurring: { interval: "month" },
          product_data: { name: config.name, description: config.description },
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    metadata: { plan, customerName: name },
    success_url: `${SITE_URL}/payment/success?type=subscription&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/subscriptions`,
  });

  res.json({ url: session.url });
}
