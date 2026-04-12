import Head from "next/head";
import { useState } from "react";
import { motion } from "framer-motion";
import type { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";

interface Props {
  saturdayPrice: number;
  bothPrice: number;
  settings: Record<string, string>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    await dbConnect();
    const settingDocs = await Setting.find({}).lean() as { key: string; value: string }[];
    const s: Record<string, string> = {};
    settingDocs.forEach((d) => { s[d.key] = d.value; });
    return {
      props: {
        saturdayPrice: Number(s.plan_saturday_price || 10000),
        bothPrice: Number(s.plan_both_price || 16000),
        settings: s,
      },
    };
  } catch {
    return { props: { saturdayPrice: 10000, bothPrice: 16000, settings: {} } };
  }
};

type PlanId = "saturdays" | "both";

export default function Subscriptions({ saturdayPrice, bothPrice, settings }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fmt = (pence: number) => `£${(pence / 100).toFixed(0)}`;

  const plans = [
    {
      id: "saturdays" as const,
      title: settings.plan_saturday_name || "Saturday Sessions",
      price: fmt(saturdayPrice),
      badge: null,
      days: "Every Saturday",
      sessionsDesc: "~4 sessions per month",
      features: [
        "Every Saturday session included",
        "45-minute structured session",
        "Same coach each week",
        "London or Manchester",
        "Cancel anytime",
      ],
      cta: "Subscribe – Saturdays",
      accent: "purple",
    },
    {
      id: "both" as const,
      title: settings.plan_both_name || "Weekend Sessions",
      price: fmt(bothPrice),
      badge: "Best Value",
      days: "Every Saturday & Sunday",
      sessionsDesc: "Up to ~8 sessions per month",
      features: [
        "Every Saturday session included",
        "Every Sunday session included",
        "45-minute structured sessions",
        "Same coach each week",
        "London or Manchester",
        "Cancel anytime",
      ],
      cta: "Subscribe – Full Weekend",
      accent: "yellow",
    },
  ];

  function choosePlan(id: PlanId) {
    setSelectedPlan(id);
    setError("");
    setTimeout(() => {
      document.getElementById("checkout-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <>
      <Head>
        <title>Monthly Subscription Plans – LittleNetStars</title>
        <meta name="description" content="Subscribe to all Saturday or Weekend netball sessions at a discounted monthly rate." />
      </Head>

      <Navbar />

      <main>
        {/* Hero */}
        <section className="py-16 px-4 text-center bg-gradient-to-br from-purple-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              Monthly Plans
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {settings.subs_hero_title || "Weekend Subscription Plans"}
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              {settings.subs_hero_subtitle || "Lock in your child\u2019s weekend sessions for the month and save \u2014 no need to book individually each week."}
            </p>
          </motion.div>
        </section>

        {/* Plan Cards */}
        <section className="py-16 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                  plan.badge
                    ? "border-yellow-400 dark:border-yellow-500 shadow-xl"
                    : "border-slate-200 dark:border-slate-700 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{plan.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{plan.days}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{plan.sessionsDesc}</p>
                </div>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-lg">/month</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => choosePlan(plan.id)}
                  className={`w-full py-3 rounded-full font-bold text-sm transition-all hover:scale-105 ${
                    selectedPlan === plan.id
                      ? "bg-green-500 text-white"
                      : plan.badge
                      ? "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {selectedPlan === plan.id ? "Selected ✓" : plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Checkout form */}
        {selectedPlan && (
          <section className="py-12 px-4 bg-slate-50 dark:bg-slate-800" id="checkout-form">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Almost there!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                You selected{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {selectedPlanData?.title} — {selectedPlanData?.price}/month
                </span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your name</label>
                  <input
                    type="text" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-3 rounded-full transition-colors"
                >
                  {loading ? "Redirecting to payment…" : `Proceed to Payment — ${selectedPlanData?.price}/month`}
                </button>
                <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                  Secure payment via Stripe. Cancel anytime from your account.
                </p>
              </form>
            </motion.div>
          </section>
        )}

        {/* FAQ */}
        <section className="py-16 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {[
                { q: "When do the sessions run?", a: "Sessions run every Saturday (and Sunday for the Weekend plan) throughout the month. Each session is 45 minutes long." },
                { q: "How many sessions are included?", a: "It depends on the number of Saturdays/Sundays in the month — typically 4 each, so up to 8 sessions on the Weekend plan." },
                { q: "Can I cancel my subscription?", a: "Yes — you can cancel anytime through Stripe\u2019s customer portal. Your access continues until the end of the billing period." },
                { q: "What if I miss a session?", a: "Missed sessions are not rolled over, but you are welcome to attend any available slot in the same week subject to availability." },
                { q: "Are individual bookings still available?", a: "Yes — you can always book individual sessions from the Book Now page at the standard per-session rate." },
              ].map((item) => (
                <div key={item.q} className="border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.q}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
