import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Booking from "@/lib/models/Booking";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "email is required" });

  try {
    await dbConnect();
    const existing = await Booking.findOne({
      "parent.email": String(email).toLowerCase().trim(),
      isFreeSession: true,
    });
    res.json({ eligible: !existing });
  } catch (err) {
    console.error("check-free failed:", err);
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
