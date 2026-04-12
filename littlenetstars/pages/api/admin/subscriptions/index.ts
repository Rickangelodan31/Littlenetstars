import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Subscription from "@/lib/models/Subscription";

function getToken(req: NextApiRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  await dbConnect();
  const subs = await Subscription.find({}).sort({ createdAt: -1 }).lean();
  res.json(JSON.parse(JSON.stringify(subs)));
}
