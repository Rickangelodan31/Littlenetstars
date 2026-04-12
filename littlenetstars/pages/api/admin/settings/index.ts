import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";

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
    const settings = await Setting.find();
    const obj: Record<string, string> = {};
    settings.forEach((s) => { obj[s.key] = s.value; });
    return res.json(obj);
  }

  if (req.method === "PUT") {
    const updates = req.body as Record<string, string>;
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
      )
    );
    return res.json({ ok: true });
  }

  res.status(405).end();
}
