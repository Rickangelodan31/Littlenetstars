import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import dbConnect from "@/lib/mongodb";
import KitOrder from "@/lib/models/KitOrder";
import Setting from "@/lib/models/Setting";

export const config = { api: { bodyParser: { sizeLimit: "1mb" } } };

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function getReadyTime(): Promise<string> {
  try {
    const s = await Setting.findOne({ key: "kit_ready_time" });
    return s?.value?.trim() || "approximately 2 weeks";
  } catch {
    return "approximately 2 weeks";
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { itemId, itemName, itemPhoto, size, quantity, customer, notes } = req.body as {
    itemId: string;
    itemName: string;
    itemPhoto?: string;
    size?: string;
    quantity?: number;
    customer: { name: string; email: string; phone?: string };
    notes?: string;
  };

  if (!itemId || !itemName || !customer?.name?.trim() || !customer?.email?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  await dbConnect();

  const readyTime = await getReadyTime();
  const qty = Math.max(1, Number(quantity) || 1);

  const order = await KitOrder.create({
    itemId,
    itemName,
    itemPhoto: itemPhoto || "",
    size: size || "",
    quantity: qty,
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone?.trim() || "",
    },
    notes: notes?.trim() || "",
    status: "pending",
  });

  const from = process.env.EMAIL_FROM || "LittleNetStars <onboarding@resend.dev>";
  const adminEmail = process.env.ADMIN_EMAIL || "admin@littlenetstars.co.uk";
  const sizeDisplay = size ? ` · Size: ${size}` : "";
  const qtyDisplay = qty > 1 ? ` × ${qty}` : "";

  if (resend) {
    // Confirmation to customer
    await resend.emails.send({
      from,
      to: customer.email.trim().toLowerCase(),
      subject: `Order confirmed – ${itemName} · LittleNetStars`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <div style="background:#7c3aed;padding:24px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;">Order Confirmed!</h2>
            <p style="color:#ede9fe;margin:6px 0 0;">Thanks for your order, ${customer.name.trim().split(" ")[0]}.</p>
          </div>
          <div style="background:#fff;padding:28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <h3 style="margin:0 0 16px;color:#7c3aed;">What you ordered</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;width:40%;">Item</td>
                <td style="padding:10px 0;font-weight:600;">${itemName}${sizeDisplay}${qtyDisplay}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;">Name</td>
                <td style="padding:10px 0;">${customer.name.trim()}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#64748b;">Email</td>
                <td style="padding:10px 0;">${customer.email.trim()}</td>
              </tr>
            </table>
            <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-weight:700;color:#6d28d9;font-size:15px;">⏰ Estimated Ready Time</p>
              <p style="margin:0;font-size:18px;font-weight:800;color:#7c3aed;">${readyTime}</p>
              <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;">We'll be in touch when your order is ready to collect.</p>
            </div>
            <p style="color:#64748b;font-size:14px;line-height:1.6;">
              If you have any questions about your order, please reply to this email or get in touch via the website.<br>
              Thank you for supporting LittleNetStars!
            </p>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px;">
            LittleNetStars · Empowering children through netball
          </p>
        </div>
      `,
    }).catch((err) => console.error("Kit order customer email failed:", err));

    // Notification to admin
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `👕 New Kit Order: ${itemName} from ${customer.name.trim()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
          <div style="background:#7c3aed;padding:24px;border-radius:12px 12px 0 0;">
            <h2 style="color:#fff;margin:0;">New Kit Order</h2>
            <p style="color:#ede9fe;margin:4px 0 0;">A customer has placed a kit order on the website</p>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;width:35%;">Item</td>
                <td style="padding:10px 0;font-weight:700;">${itemName}${sizeDisplay}${qtyDisplay}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;">Customer</td>
                <td style="padding:10px 0;font-weight:600;">${customer.name.trim()}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0;color:#64748b;">Email</td>
                <td style="padding:10px 0;"><a href="mailto:${customer.email.trim()}" style="color:#7c3aed;">${customer.email.trim()}</a></td>
              </tr>
              ${customer.phone ? `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Phone</td><td style="padding:10px 0;">${customer.phone.trim()}</td></tr>` : ""}
              ${notes ? `<tr><td style="padding:10px 0;color:#64748b;">Notes</td><td style="padding:10px 0;">${notes}</td></tr>` : ""}
            </table>
            <div style="margin-top:20px;padding:12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
              <p style="margin:0;color:#15803d;font-size:14px;">Order ID: <strong>${order._id}</strong></p>
            </div>
          </div>
        </div>
      `,
    }).catch((err) => console.error("Kit order admin email failed:", err));
  }

  return res.status(201).json({ orderId: order._id });
}
