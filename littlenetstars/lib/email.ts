import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailParams {
  to: string;
  parentName: string;
  location: string;
  date: string;
  time: string;
  children: { name: string; age: number }[];
  isFreeSession: boolean;
  amountPaid?: number;
}

export async function sendBookingConfirmation(params: BookingEmailParams) {
  const { to, parentName, location, date, time, children, isFreeSession, amountPaid } = params;

  const childList = children.map((c) => `${c.name} (age ${c.age})`).join(", ");
  const priceText = isFreeSession
    ? "🎉 FREE – your first session is on us!"
    : `£${((amountPaid ?? 0) / 100).toFixed(2)} paid`;

  const { error } = await resend.emails.send({
    from: "LittleNetStars <bookings@littlenetstars.co.uk>",
    to,
    subject: "Booking Confirmed – LittleNetStars",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
        <div style="background:#7c3aed;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">LittleNet<span style="color:#facc15;">Stars</span></h1>
          <p style="color:#ede9fe;margin:8px 0 0;">Booking Confirmed ✓</p>
        </div>

        <div style="background:#fff;padding:32px 24px;border:1px solid #e2e8f0;border-top:none;">
          <p style="font-size:16px;">Hi <strong>${parentName}</strong>,</p>
          <p>Your session is booked! Here are the details:</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;width:40%;">Location</td>
              <td style="padding:10px 0;font-weight:600;">${location}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;">Date</td>
              <td style="padding:10px 0;font-weight:600;">${date}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;">Time</td>
              <td style="padding:10px 0;font-weight:600;">${time}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:10px 0;color:#64748b;">Child${children.length > 1 ? "ren" : ""}</td>
              <td style="padding:10px 0;font-weight:600;">${childList}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748b;">Price</td>
              <td style="padding:10px 0;font-weight:600;">${priceText}</td>
            </tr>
          </table>

          <p style="font-size:13px;color:#94a3b8;margin-top:24px;">
            Free cancellation up to 48 hours before the session.<br/>
            Reply to this email if you need to make any changes.
          </p>
        </div>

        <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} LittleNetStars · Building Confidence Through Netball</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Email send error:", error);
  }
}
