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

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function TermsAndConditions() {
  return (
    <>
      <Head>
        <title>Terms &amp; Conditions – LittleNetStars</title>
        <meta name="description" content="Terms and conditions for LittleNetStars netball coaching sessions." />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white dark:bg-slate-900 py-20 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">Legal</p>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Terms &amp; Conditions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated: {EFFECTIVE_DATE}
            </p>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Please read these Terms and Conditions carefully before booking or attending any LittleNetStars session or purchasing a subscription. By making a booking or subscription purchase you confirm that you have read, understood, and agreed to these terms on behalf of yourself and any child you are enrolling.
            </p>
          </div>

          {/* 1 */}
          <Section title="1. About Us">
            <P>LittleNetStars is a netball coaching service founded and operated by Affy Morris, offering structured sessions for children across London and Manchester.</P>
            <P>
              Website: <span className="font-medium">littlenetstars.co.uk</span>
              <br />
              Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 dark:text-purple-400 hover:underline">{CONTACT_EMAIL}</a>
            </P>
            <P>References to &ldquo;LittleNetStars&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo; in these terms refer to the LittleNetStars coaching service. References to &ldquo;you&rdquo; or &ldquo;your&rdquo; refer to the parent or guardian making a booking.</P>
          </Section>

          {/* 2 */}
          <Section title="2. Our Services">
            <P>We provide the following coaching services:</P>
            <Ul items={[
              "Individual paid sessions bookable through our website",
              "A complimentary first session for first-time attendees (one per family, subject to availability)",
              "Monthly subscription plans giving access to Saturday and/or weekend sessions",
            ]} />
            <P>All sessions are designed for children. Adults accompanying children are welcome to observe but may not participate in sessions unless specifically invited by a coach.</P>
            <P>Session times, locations, and prices are displayed on our website and may be updated from time to time. The details shown at the point of booking apply to that booking.</P>
          </Section>

          {/* 3 */}
          <Section title="3. Bookings">
            <P>Bookings are made through our online booking system. A booking is confirmed once you receive a confirmation email from us.</P>
            <P>When booking you must provide:</P>
            <Ul items={[
              "Your full name, email address, and phone number",
              "The name and age of each child attending",
            ]} />
            <P>You are responsible for ensuring that all information you provide is accurate and up to date. We cannot be held responsible for missed sessions or communications arising from incorrect contact details.</P>
            <P>We reserve the right to refuse or cancel a booking at our discretion, in which case any payment taken will be refunded in full.</P>
          </Section>

          {/* 4 */}
          <Section title="4. Payment">
            <P>Payments are processed securely through Stripe. We do not store your full card details on our systems.</P>
            <P>All prices shown on our website include VAT where applicable and are quoted in British Pounds Sterling (£).</P>
            <P>Payment is taken at the time of booking for individual sessions. Subscription payments are taken at the start of each billing cycle.</P>
            <P>By providing payment details you authorise us to charge the amount shown at the time of booking or subscription signup.</P>
          </Section>

          {/* 5 */}
          <Section title="5. Free First Session">
            <P>We offer one complimentary taster session per family for first-time attendees. This offer is subject to the following conditions:</P>
            <Ul items={[
              "One free session per email address and household",
              "Must be booked through our online booking system",
              "Subject to availability — we cannot guarantee a free session if sessions are fully booked",
              "The free session has no cash value and cannot be exchanged or transferred",
              "We reserve the right to withdraw the free session offer at any time",
            ]} />
          </Section>

          {/* 6 */}
          <Section title="6. Subscriptions">
            <P>Subscription plans provide access to recurring weekly sessions and are billed monthly via Stripe.</P>
            <P>By subscribing you authorise LittleNetStars to charge your payment method on a recurring monthly basis until you cancel.</P>
            <P>Subscriptions automatically renew each month unless cancelled by you before the renewal date. Cancelling mid-cycle does not entitle you to a partial refund for the current period — access continues until the end of the paid month.</P>
            <P>We reserve the right to change subscription prices with 30 days&rsquo; written notice to your registered email address. If you do not wish to continue at the new price you may cancel before the change takes effect.</P>
            <P>For more detail on cancelling subscriptions see our <Link href="/cancellation" className="text-purple-600 dark:text-purple-400 hover:underline">Cancellation Policy</Link>.</P>
          </Section>

          {/* 7 */}
          <Section title="7. Child Safeguarding &amp; Safety">
            <P>The safety and wellbeing of all children in our care is our highest priority. All LittleNetStars coaches hold current DBS (Disclosure and Barring Service) checks and have completed safeguarding training.</P>
            <P>As a parent or guardian you agree to:</P>
            <Ul items={[
              "Inform us of any medical conditions, injuries, allergies, or special requirements relevant to your child before they attend",
              "Ensure your child arrives appropriately dressed for physical activity and has water",
              "Ensure your child is collected promptly at the end of each session by an authorised adult",
              "Notify us in advance if someone other than the registered parent or guardian will collect your child",
            ]} />
            <P>We operate a strict anti-bullying and zero-tolerance policy regarding discrimination of any kind. Behaviour that endangers others or is contrary to our code of conduct may result in removal from a session without refund.</P>
          </Section>

          {/* 8 */}
          <Section title="8. Health &amp; Medical">
            <P>Participation in physical activity carries an inherent risk of injury. By booking you confirm that your child is in good health and fit to participate in netball coaching.</P>
            <P>You must inform us prior to your child attending of any:</P>
            <Ul items={[
              "Existing injuries or physical conditions that may affect participation",
              "Allergies, including those requiring emergency medication (e.g. EpiPen)",
              "Any other information we need to keep your child safe",
            ]} />
            <P>In the event of a minor injury during a session, first aid will be administered by a qualified first-aider. In the event of a serious injury we will call the emergency services and contact you immediately. By booking you authorise us to seek emergency medical assistance on your child&rsquo;s behalf if we are unable to contact you.</P>
            <P>LittleNetStars is not liable for injury, illness, loss, or damage arising from participation in sessions, save where such liability cannot be excluded by law.</P>
          </Section>

          {/* 9 */}
          <Section title="9. Photography &amp; Media">
            <P>From time to time we may take photographs or video footage during sessions for use on our website, social media channels, and promotional materials.</P>
            <P>By booking you grant us permission to photograph and film your child during sessions for these purposes, unless you notify us in writing at <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 dark:text-purple-400 hover:underline">{CONTACT_EMAIL}</a> that you do not consent. We will not publish photographs or footage that identify your child without consent.</P>
            <P>You must not photograph or film other children at our sessions without the explicit consent of their parent or guardian.</P>
          </Section>

          {/* 10 */}
          <Section title="10. Liability">
            <P>To the maximum extent permitted by law, LittleNetStars shall not be liable for:</P>
            <Ul items={[
              "Any loss, damage, injury, or illness sustained at or in connection with a session, unless caused by our proven negligence",
              "Loss or damage to personal property brought to sessions",
              "Any indirect, consequential, or special loss",
            ]} />
            <P>Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for any matter for which it would be unlawful to exclude liability.</P>
            <P>We strongly recommend that you obtain appropriate personal accident or sports insurance for your child.</P>
          </Section>

          {/* 11 */}
          <Section title="11. Cancellations &amp; Refunds">
            <P>Our full cancellation and refund terms are set out in our <Link href="/cancellation" className="text-purple-600 dark:text-purple-400 hover:underline">Cancellation Policy</Link>.</P>
          </Section>

          {/* 12 */}
          <Section title="12. Intellectual Property">
            <P>All content on our website, including text, images, logos, and course materials, is the property of LittleNetStars and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or use our content without our prior written permission.</P>
          </Section>

          {/* 13 */}
          <Section title="13. Privacy">
            <P>We collect and process personal data in accordance with our <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>, which forms part of these terms. By using our services you agree to our use of your data as described therein.</P>
          </Section>

          {/* 14 */}
          <Section title="14. Changes to These Terms">
            <P>We may update these terms from time to time. We will notify you of material changes by posting the updated terms on our website and, where appropriate, by email. Continued use of our services after changes are published constitutes acceptance of the revised terms.</P>
          </Section>

          {/* 15 */}
          <Section title="15. Governing Law">
            <P>These terms are governed by and construed in accordance with the law of England and Wales. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</P>
          </Section>

          {/* 16 */}
          <Section title="16. Contact Us">
            <P>If you have any questions about these Terms and Conditions, please contact us at:</P>
            <P>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 dark:text-purple-400 hover:underline font-medium">{CONTACT_EMAIL}</a>
            </P>
          </Section>

          {/* Related */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 text-sm">
            <Link href="/cancellation" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Cancellation Policy →</Link>
            <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Privacy Policy →</Link>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
