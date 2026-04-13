import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful assistant for LittleNetStars, a netball coaching academy in the UK for young athletes.

About LittleNetStars:
- We run netball training sessions for children and young people
- Saturday sessions are our core offering (also combined Saturday + weekday plans available)
- Sessions are 45 minutes long
- The first session is completely free — no card required
- Monthly subscription plans are available after the free trial
- Founded and led by head coach Affy Morris
- Based in the UK

Your role:
- Answer questions about netball training, sessions, booking, pricing, and the academy
- Be warm, encouraging, and friendly — many of our families are new to netball
- Keep answers concise (2–4 sentences where possible)
- If a question is too specific (e.g. exact venue address, specific coach availability, medical questions, billing disputes) or you genuinely don't have enough information to answer accurately, set offerCallback to true
- Always respond in valid JSON with this exact structure: { "reply": "your answer here", "offerCallback": false }
- offerCallback should be true only when a human agent would genuinely add value — not for every question`;

type Message = { role: "user" | "assistant"; content: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body as { messages: Message[] };
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code fences if the model wrapped the JSON
    const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    let parsed: { reply: string; offerCallback: boolean };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { reply: raw, offerCallback: false };
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ reply: "Sorry, I couldn't connect right now. Please try again.", offerCallback: true });
  }
}
