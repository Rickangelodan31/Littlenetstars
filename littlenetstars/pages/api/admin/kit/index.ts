import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import KitItem from "@/lib/models/KitItem";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

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
    const items = await KitItem.find().sort({ order: 1, createdAt: 1 });
    return res.json(items);
  }

  if (req.method === "POST") {
    const item = await KitItem.create(req.body);
    return res.status(201).json(item);
  }

  res.status(405).end();
}
