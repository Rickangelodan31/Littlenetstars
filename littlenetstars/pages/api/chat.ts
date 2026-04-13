import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a friendly, warm assistant for LittleNetStars — a netball coaching academy in the UK for young athletes.

About LittleNetStars:
- We run netball training sessions for children and young people
- Saturday sessions are our core offering (also combined Saturday + weekday plans available)
- Sessions are 45 minutes long
- The first session is completely free — no card required
- Monthly subscription plans are available after the free trial
- Founded and led by head coach Affy Morris
- Based in the UK

Your role:
- Answer questions naturally and conversationally about netball training, sessions, booking, pricing, and the academy
- Be warm, encouraging, and friendly — many of our families are new to netball
- Keep answers concise (2–4 sentences)
- If a question is too specific or you genuinely cannot answer accurately (e.g. exact venue address, coach availability, medical questions, billing disputes), use the suggest_callback tool
- Only use suggest_callback when a human would genuinely add value`;

// Tool that the model calls when it wants to offer a human callback
const TOOLS: Anthropic.Tool[] = [
  {
    name: "suggest_callback",
    description: "Call this when the question requires a human agent to answer properly — e.g. specific location details, billing disputes, coach availability, or anything you cannot confidently answer.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: {
          type: "string",
          description: "Brief internal reason why a callback is being suggested",
        },
      },
      required: [],
    },
  },
];

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
      tools: TOOLS,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    // Extract plain text reply and check if model used the suggest_callback tool
    let reply = "";
    let offerCallback = false;

    for (const block of response.content) {
      if (block.type === "text") {
        reply += block.text;
      } else if (block.type === "tool_use" && block.name === "suggest_callback") {
        offerCallback = true;
      }
    }

    // If model only called the tool without text, give a friendly fallback
    if (!reply.trim()) {
      reply = "That's a great question! One of our coaches would be best placed to help with that.";
    }

    return res.json({ reply: reply.trim(), offerCallback });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ reply: "Sorry, I couldn't connect right now. Please try again.", offerCallback: true });
  }
}
