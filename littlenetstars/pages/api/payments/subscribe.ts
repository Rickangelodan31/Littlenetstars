import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.littlenetstars.co.uk";

const PLAN_DEFAULTS = {
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
  if (!(plan in PLAN_DEFAULTS)) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  // Read pricing from Settings DB (falls back to defaults)
  let saturdayPrice: number = PLAN_DEFAULTS.saturdays.amount;
  let bothPrice: number = PLAN_DEFAULTS.both.amount;
  try {
    await dbConnect();
    const satSetting = await Setting.findOne({ key: "plan_saturday_price" });
    const bothSetting = await Setting.findOne({ key: "plan_both_price" });
    if (satSetting?.value) saturdayPrice = Number(satSetting.value);
    if (bothSetting?.value) bothPrice = Number(bothSetting.value);
  } catch { /* use defaults */ }

  const amount: number = plan === "saturdays" ? saturdayPrice : bothPrice;
  const config: { name: string; description: string } = PLAN_DEFAULTS[plan];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: amount,
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
