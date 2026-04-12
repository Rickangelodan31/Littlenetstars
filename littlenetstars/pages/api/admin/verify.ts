import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorised" });
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET || "fallback_secret");
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
