import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import GalleryImage from "@/lib/models/GalleryImage";

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
  if (req.method === "GET") return res.json(await GalleryImage.find().sort("order"));
  if (req.method === "POST") return res.status(201).json(await GalleryImage.create(req.body));
  res.status(405).end();
}
