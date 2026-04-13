import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import dbConnect from "@/lib/mongodb";
import CallbackRequest from "@/lib/models/CallbackRequest";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, phone, question } = req.body as { name: string; phone: string; question: string };
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  await dbConnect();
  await CallbackRequest.create({ name: name.trim(), phone: phone.trim(), question: question || "" });

  // Notify the founder by email
  const adminEmail = process.env.ADMIN_EMAIL || "admin@littlenetstars.co.uk";
  if (resend) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "LittleNetStars <onboarding@resend.dev>",
      to: adminEmail,
      subject: `📞 Callback Request from ${name.trim()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <div style="background:#7c3aed;padding:24px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;">New Callback Request</h2>
            <p style="color:#ede9fe;margin:4px 0 0;">Someone asked a question via the website chat</p>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;width:35%;">Name</td>
                <td style="padding:10px 0;font-weight:600;">${name.trim()}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;">Phone</td>
                <td style="padding:10px 0;font-weight:600;">${phone.trim()}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;">Their question</td>
                <td style="padding:10px 0;">${question || "Not provided"}</td>
              </tr>
            </table>
            <div style="margin-top:20px;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
              <p style="margin:0;color:#15803d;font-size:14px;">Please call <strong>${name.trim()}</strong> back on <strong>${phone.trim()}</strong> as soon as possible.</p>
            </div>
          </div>
        </div>
      `,
    }).catch((err) => console.error("Callback notification email failed:", err));
  }

  return res.json({ ok: true });
}
