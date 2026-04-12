import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();
  const { location, date, time, children, parent } = req.body;

  if (!location || !date || !time || !children?.length || !parent?.email) {
    return res.status(400).json({ error: "Missing required booking fields" });
  }

  const bookingDate = new Date(date);
  const dayOfWeek = bookingDate.getUTCDay();
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    return res.status(400).json({ error: "Sessions are only available on weekends" });
  }

  const existingFree = await Booking.findOne({
    "parent.email": parent.email.toLowerCase().trim(),
    isFreeSession: true,
  });
  const isFreeSession = !existingFree;

  const booking = await Booking.create({
    location, date: bookingDate, time, children, parent,
    isFreeSession,
    status: isFreeSession ? "paid" : "pending_payment",
    amountPaid: isFreeSession ? 0 : undefined,
  });

  res.status(201).json({ bookingId: booking._id, isFreeSession });
}
