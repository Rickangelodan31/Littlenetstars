import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  await dbConnect();
  const booking = await Booking.findById(req.query.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json(booking);
}
