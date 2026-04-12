import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import CallbackRequest from "@/lib/models/CallbackRequest";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, phone, question } = req.body as { name: string; phone: string; question: string };
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  await dbConnect();
  await CallbackRequest.create({ name: name.trim(), phone: phone.trim(), question: question || "" });

  return res.json({ ok: true });
}
