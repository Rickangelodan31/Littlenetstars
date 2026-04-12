import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Coach from "@/lib/models/Coach";

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
  if (req.method === "PUT") {
    const coach = await Coach.findByIdAndUpdate(req.query.id, req.body, { new: true });
    if (!coach) return res.status(404).json({ error: "Not found" });
    return res.json(coach);
  }
  if (req.method === "DELETE") {
    await Coach.findByIdAndDelete(req.query.id);
    return res.json({ ok: true });
  }
  res.status(405).end();
}
