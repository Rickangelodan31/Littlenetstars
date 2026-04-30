import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const EFFECTIVE_DATE = "1 May 2025";
const CONTACT_EMAIL = "hello@littlenetstars.co.uk";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
        {title}
      </h2>
      <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 flex items-center gap-4 ${highlight ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700" : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"}`}>
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-base font-bold mt-0.5 ${highlight ? "text-purple-700 dark:text-purple-300" : "text-slate-900 dark:text-white"}`}>{value}</p>
      </div>
    </div>
  );
}

export default function CancellationPolicy() {
  return (
    <>
      <Head>
        <title>Cancellation Policy – LittleNetStars</title>
        <meta name="description" content="LittleNetStars cancellation and refund policy for sessions and subscriptions." />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white dark:bg-slate-900 py-20 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">Legal</p>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Cancellation Policy</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated: {EFFECTIVE_DATE}
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We understand that plans change. This policy explains your options when you need to cancel a session or subscription, and what happens when we need to cancel on our side.
            </p>
          </div>

          {/* At a glance */}
          <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoBox label="Cancel with full refund" value="48+ hours before" highlight />
            <InfoBox label="Cancel within 48 hours" value="No refund" />
            <InfoBox label="Subscription cancellation" value="End of billing period" />
          </div>

          {/* 1 */}
          <Section title="1. Cancelling a Session — by You">
            <P>You may cancel a booked session at any time before it takes place. The refund you receive depends on how much notice you give:</P>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Notice given</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Refund</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">More than 48 hours before the session</td>
                    <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">Full refund</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Less than 48 hours before the session</td>
                    <td className="px-4 py-3 font-semibold text-red-500 dark:text-red-400">No refund</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">No-show (no cancellation made)</td>
                    <td className="px-4 py-3 font-semibold text-red-500 dark:text-red-400">No refund</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <P>To cancel a session, please contact us as soon as possible at <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 dark:text-purple-400 hover:underline">{CONTACT_EMAIL}</a> with your booking details. Cancellation requests must be received by email — phone or verbal cancellations are not accepted.</P>
          </Section>

          {/* 2 */}
          <Section title="2. Refund Processing">
            <P>Approved refunds are returned to the original payment method (card) used at the time of booking.</P>
            <P>Refunds are processed within <strong>5–10 business days</strong>. The time for funds to appear in your account depends on your bank or card issuer and may take up to 10 working days after we have processed the refund.</P>
            <P>Stripe (our payment processor) fees are non-recoverable by us, but we absorb these costs — you will receive the full session price you paid.</P>
            <P>Refunds will not be issued as cash or credit note.</P>
          </Section>

          {/* 3 */}
          <Section title="3. No-Shows">
            <P>If you do not attend a booked session and do not contact us beforehand, this is treated as a no-show. No refund or credit will be issued for no-shows, regardless of the reason.</P>
            <P>If an unexpected emergency prevents attendance, please email us as soon as possible. We will consider requests for goodwill exceptions on a case-by-case basis, but we are not obligated to offer one.</P>
          </Section>

          {/* 4 */}
          <Section title="4. Lateness">
            <P>Sessions start promptly. If your child arrives more than 15 minutes late to a session, for safety and group fairness reasons we reserve the right to decline entry for that session. No refund will be issued in such cases.</P>
          </Section>

          {/* 5 */}
          <Section title="5. Cancellations by LittleNetStars">
            <P>Occasionally we may need to cancel a session due to circumstances beyond our control. Reasons may include:</P>
            <Ul items={[
              "Severe weather conditions making the venue unsafe",
              "Coach illness or unavailability with no suitable cover",
              "Venue issues or access problems",
              "Insufficient bookings for a session to run",
              "Events of force majeure (e.g. public health emergencies)",
            ]} />
            <P>If we cancel a session, we will notify you as soon as possible by email to the address provided at booking.</P>
            <P>Where we cancel a session:</P>
            <Ul items={[
              "You will receive a full refund of the session price, processed within 5–10 business days",
              <>Or — if you prefer — we will offer you a <strong>complimentary place</strong> at the next available equivalent session, subject to availability</>,
            ]} />
            <P>LittleNetStars is not responsible for any other costs you incur as a result of a cancelled session, such as travel or childcare costs.</P>
          </Section>

          {/* 6 */}
          <Section title="6. Subscription Cancellations">
            <P>You can cancel your monthly subscription at any time.</P>
            <Ul items={[
              "Cancellations take effect at the end of your current billing period — you retain access to sessions until then",
              "We do not offer partial refunds for unused days within a billing period",
              "To cancel, email us at " + CONTACT_EMAIL + " with the subject line \"Cancel Subscription\" and your name and email address",
              "We aim to confirm all cancellation requests within 2 business days",
            ]} />
            <P>If you cancel and then wish to re-subscribe, you are welcome to do so at the then-current price. Promotional or introductory rates that applied to your original subscription may not be available on re-subscription.</P>
          </Section>

          {/* 7 */}
          <Section title="7. Subscription — Missed Sessions">
            <P>If you are subscribed but miss sessions in a given month, we are unable to roll unused sessions over to the following month or issue partial refunds. Subscriptions cover access to sessions, not a guaranteed number of attended sessions.</P>
          </Section>

          {/* 8 */}
          <Section title="8. Free First Session">
            <P>The complimentary first session has no monetary value and is not refundable, exchangeable, or transferable. If you cannot attend a booked free session, please let us know at least 24 hours in advance so we can offer the slot to another family on our waiting list.</P>
          </Section>

          {/* 9 */}
          <Section title="9. Exceptional Circumstances">
            <P>We understand that serious or unexpected events (bereavement, hospitalisation, and similar) can make it impossible to give the required notice. If this happens, please get in touch with us — we will always try to be fair and compassionate. Requests of this nature are assessed individually and at our sole discretion.</P>
          </Section>

          {/* 10 */}
          <Section title="10. How to Contact Us">
            <P>All cancellation requests must be submitted in writing:</P>
            <P>
              <strong>Email: </strong>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 dark:text-purple-400 hover:underline">{CONTACT_EMAIL}</a>
            </P>
            <P>Please include your full name, your child&rsquo;s name, the session date and time, and your reason for cancelling. We aim to respond to all requests within 1–2 business days.</P>
          </Section>

          {/* Related */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Terms &amp; Conditions →</Link>
            <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Privacy Policy →</Link>
            <Link href="/booking" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Book a Session →</Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
