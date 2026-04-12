import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

function isAdmin(req: NextApiRequest) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return false;
  try { jwt.verify(auth.slice(7), process.env.JWT_SECRET || "fallback_secret"); return true; }
  catch { return false; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorised" });
  await dbConnect();

  if (req.method === "GET") {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.json(bookings);
  }

  if (req.method === "DELETE") {
    await Booking.findByIdAndDelete(req.query.id);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
