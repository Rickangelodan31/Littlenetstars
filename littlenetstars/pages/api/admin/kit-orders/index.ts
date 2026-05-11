import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import KitOrder from "@/lib/models/KitOrder";

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
    const orders = await KitOrder.find().sort({ createdAt: -1 }).lean();
    return res.json(orders);
  }

  res.status(405).end();
}
