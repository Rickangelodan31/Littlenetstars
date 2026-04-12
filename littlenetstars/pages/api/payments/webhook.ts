import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";
import Subscription from "@/lib/models/Subscription";
import { sendBookingConfirmation } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const config = { api: { bodyParser: false } };

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"] as string;
  const rawBody = await getRawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return res.status(400).send(`Webhook Error: ${msg}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await dbConnect();

    if (session.mode === "payment") {
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        const booking = await Booking.findByIdAndUpdate(bookingId, {
          status: "paid",
          amountPaid: session.amount_total,
          stripeSessionId: session.id,
        }, { new: true });

        if (booking) {
          sendBookingConfirmation({
            to: booking.parent.email,
            parentName: booking.parent.name,
            location: booking.location,
            date: new Date(booking.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
            time: booking.time,
            children: booking.children,
            isFreeSession: false,
            amountPaid: session.amount_total ?? 0,
          }).catch(console.error);
        }
      }
    }

    if (session.mode === "subscription") {
      const type = session.metadata?.type;

      if (type === "free_session_subscription") {
        // Free first session — card collected via subscription trial; mark booking paid
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
          const booking = await Booking.findByIdAndUpdate(bookingId, {
            status: "paid",
            amountPaid: 0,
            stripeSessionId: session.id,
          }, { new: true });

          if (booking) {
            sendBookingConfirmation({
              to: booking.parent.email,
              parentName: booking.parent.name,
              location: booking.location,
              date: new Date(booking.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
              time: booking.time,
              children: booking.children,
              isFreeSession: true,
              amountPaid: 0,
            }).catch(console.error);
          }
        }
      } else {
        // Monthly plan subscription (£100 Saturdays / £160 Weekend)
        const plan = session.metadata?.plan as "saturdays" | "both" | undefined;
        const customerName = session.metadata?.customerName || "";
        const email = session.customer_email || "";
        if (plan && email) {
          await Subscription.findOneAndUpdate(
            { email },
            {
              email,
              name: customerName,
              plan,
              stripeCustomerId: typeof session.customer === "string" ? session.customer : "",
              stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : "",
              status: "active",
            },
            { upsert: true, new: true }
          );
        }
      }
    }
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    await dbConnect();
    const statusMap: Record<string, string> = {
      active: "active",
      canceled: "cancelled",
      past_due: "past_due",
    };
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: sub.id },
      {
        status: statusMap[sub.status] || "active",
        currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
      }
    );
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await dbConnect();
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: sub.id },
      { status: "cancelled" }
    );
  }

  res.json({ received: true });
}
