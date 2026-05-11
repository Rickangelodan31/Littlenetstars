import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import type { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetballAnimation from "@/components/NetballAnimation";
import dbConnect from "@/lib/mongodb";
import Setting from "@/lib/models/Setting";

interface Props {
  settings: Record<string, string>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    await dbConnect();
    const docs = (await Setting.find({}).lean()) as {
      key: string;
      value: string;
    }[];
    const settings: Record<string, string> = {};
    docs.forEach((d) => {
      settings[d.key] = d.value;
    });
    return { props: { settings } };
  } catch {
    return { props: { settings: {} } };
  }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

export default function Home({ settings }: Props) {
  const s = settings;

  const heroTitle = s.hero_title || "LittleNetStars";
  const heroTagline = s.hero_subtitle || "Building Confidence Through Netball";
  const heroDesc =
    s.hero_description ||
    "Fun, structured netball training for young players in London & Manchester.";
  const coachesTeaserText =
    s.coaches_teaser ||
    "Led by Affy Morris — former Jamaican international and UK Netball Superleague player. Now dedicated to coaching the next generation of stars.";
  const ctaDesc =
    s.cta_text ||
    "Your child's first session is on us — no card needed. After that, it's just £30 per session.";
  const duration = s.duration || "45 Minutes";
  const locationsStr = s.locations || "London, Manchester";
  const satPricePence = Number(s.plan_saturday_price || 4000);
  const bothPricePence = Number(s.plan_both_price || 8000);

  // Section visibility (default true unless explicitly set to "false")
  const showProgrammes  = s.home_programmes_show  !== "false";
  const showHowItWorks  = s.home_howitworks_show  !== "false";
  const showSessionInfo = s.home_session_show     !== "false";
  const showCoaches     = s.home_coaches_show     !== "false";
  const showPlans       = s.home_plans_show       !== "false";
  const showCta         = s.home_cta_show         !== "false";

  // Programmes slideshow text
  const programmesTitle    = s.home_programmes_title    || "More Ways to Play";
  const programmesSubtitle = s.home_programmes_subtitle || "Beyond weekend sessions — camps, schools & nurseries";

  // How It Works text
  const howItWorksTitle    = s.home_howitworks_title    || "How It Works";
  const howItWorksSubtitle = s.home_howitworks_subtitle || "Three easy steps to get your child on court";
  const steps = [
    { step: "01", icon: s.home_step1_icon || "📅", title: s.home_step1_title || "Choose a Date",      desc: s.home_step1_desc || "Pick from available Saturday or Sunday sessions in your city." },
    { step: "02", icon: s.home_step2_icon || "👧", title: s.home_step2_title || "Add Your Child",      desc: s.home_step2_desc || "Enter your child's details. You can add multiple children at once." },
    { step: "03", icon: s.home_step3_icon || "✅", title: s.home_step3_title || "Secure Your Session", desc: s.home_step3_desc || "Pay securely via card, Apple Pay, or Google Pay and you're done." },
  ];

  // Monthly Plans text
  const plansTitle    = s.home_plans_title    || "Subscribe & Save";
  const plansSubtitle = s.home_plans_subtitle || "Secure all weekend sessions for the month at a discounted rate";

  // CTA Banner text
  const ctaTitle  = s.home_cta_title  || "Ready to start their netball journey?";
  const ctaButton = s.home_cta_button || "Book Free Session";
  const ctaNote   = s.home_cta_note   || "One free session per email address. Free cancellation up to 48 hours before your session.";

  // Coach photo on home page
  const homeCoachPhoto = s.home_coach_photo || "/Affy.jpg";

  const programmeSlides = [
    {
      tag: s.home_camp_tag || "Easter Holidays",
      title: s.home_camp_title || "Little Netters Camps",
      description: s.home_camp_description || "Exciting two-day netball camps for children aged 2–11. Fun skills, drills, activities, and games — joined by special guest coaches from Superleague teams.",
      details: [
        { icon: "📅", label: "Dates",             value: s.home_camp_dates   || "Thu 1st – Fri 2nd April 2027" },
        { icon: "⏰", label: "Time",              value: s.home_camp_time    || "9:00am – 4:00pm" },
        { icon: "💰", label: "Full Camp (2 days)", value: s.home_camp_full   || "£95.00" },
        { icon: "🎟️", label: "Single Day",        value: s.home_camp_single || "£60.00" },
      ],
      cta: { href: "/camp", label: s.home_camp_cta || "View Camp Details" },
      bg: "from-purple-600 to-purple-800",
      badgeBg: "bg-yellow-400 text-slate-900",
    },
    {
      tag: s.home_schools_tag || "Schools & Nurseries",
      title: s.home_schools_title || "We Come to You",
      description: s.home_schools_description || "Little Netters delivers tailored netball sessions in your school or nursery. Our coaches adapt every session to suit your setting — engaging, motivating, and fun for all.",
      details: [
        { icon: "👶", label: "Age Group",      value: s.home_schools_ages     || "2–11 years old" },
        { icon: "⏱️", label: "Session Length",  value: s.home_schools_length  || "1 hour" },
        { icon: "📋", label: "Session Plans",  value: s.home_schools_plans    || "Tailored to your needs" },
        { icon: "🏫", label: "Delivery",       value: s.home_schools_delivery || "Schools & nurseries" },
      ],
      cta: { href: "/schools", label: s.home_schools_cta || "Find Out More" },
      bg: "from-yellow-400 to-yellow-500",
      badgeBg: "bg-purple-600 text-white",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setActiveSlide((i) => (i + 1) % programmeSlides.length),
      10000,
    );
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>{heroTitle} – Building Confidence Through Netball</title>
        <meta name="description" content={heroDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            className="relative z-10 max-w-4xl mx-auto"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="mb-8">
              <NetballAnimation />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight"
            >
              {heroTitle.includes("NetStars") ? (
                <>
                  LittleNet
                  <span className="text-purple-600 dark:text-purple-400">
                    Stars
                  </span>
                </>
              ) : (
                heroTitle
              )}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-3 text-lg sm:text-xl font-semibold text-yellow-600 dark:text-yellow-400 tracking-wide"
            >
              {heroTagline}
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto"
            >
              {heroDesc}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-3 inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-2 rounded-full"
            >
              🎉 First session is FREE
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-6 flex flex-col sm:flex-row gap-4 justify-center flex-wrap"
            >
              <Link
                href="/booking"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-base font-bold shadow-lg transition-transform hover:scale-105"
              >
                Book Free Session
              </Link>
              <Link
                href="/subscriptions"
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-3 rounded-full text-base font-bold shadow-lg transition-transform hover:scale-105"
              >
                Monthly Plans
              </Link>
              <Link
                href="/about"
                className="border-2 border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 px-8 py-3 rounded-full text-base font-bold transition-colors"
              >
                Meet the Coaches
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* PROGRAMMES SLIDESHOW */}
        {showProgrammes && (
          <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                  Our Programmes
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  {programmesTitle}
                </h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400">
                  {programmesSubtitle}
                </p>
              </motion.div>

              <div className="relative overflow-hidden rounded-3xl shadow-xl">
                {programmeSlides.map((slide, i) => (
                  <motion.div
                    key={slide.tag}
                    initial={false}
                    animate={{ opacity: i === activeSlide ? 1 : 0, x: i === activeSlide ? 0 : i < activeSlide ? -40 : 40 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={`bg-gradient-to-br ${slide.bg} p-10 sm:p-14 ${i === activeSlide ? "block" : "hidden"}`}
                  >
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest ${slide.badgeBg}`}>
                      {slide.tag}
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{slide.title}</h3>
                    <p className="mt-4 text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed">{slide.description}</p>
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {slide.details.map((d) => (
                        <div key={d.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                          <div className="text-2xl mb-1">{d.icon}</div>
                          <div className="text-white font-bold text-sm">{d.value}</div>
                          <div className="text-white/60 text-xs mt-0.5">{d.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <Link href={slide.cta.href} className="inline-block bg-white hover:bg-slate-50 text-slate-900 font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105 text-sm">
                        {slide.cta.label} →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={() => setActiveSlide((i) => (i - 1 + programmeSlides.length) % programmeSlides.length)}
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-slate-600 transition-colors" aria-label="Previous">
                  <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {programmeSlides.map((_, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeSlide ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-600"}`}
                    aria-label={`Slide ${i + 1}`} />
                ))}
                <button onClick={() => setActiveSlide((i) => (i + 1) % programmeSlides.length)}
                  className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-slate-600 transition-colors" aria-label="Next">
                  <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        {showHowItWorks && (
          <section className="py-20 px-4 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                  {howItWorksTitle}
                </h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400">
                  {howItWorksSubtitle}
                </p>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((item) => (
                  <motion.div key={item.step} variants={fadeUp}
                    className="relative bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Step {item.step}
                    </div>
                    <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* SESSION DETAILS */}
        {showSessionInfo && (
          <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-purple-800">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-white">Session Details</h2>
              </motion.div>
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Days", value: "Sat & Sun", icon: "🗓️" },
                  { label: "Duration", value: duration, icon: "⏱️" },
                  { label: "Locations", value: locationsStr, icon: "📍" },
                ].map((item) => (
                  <motion.div key={item.label} variants={fadeUp} className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-2xl font-bold text-white">{item.value}</div>
                    <div className="text-purple-200 text-sm mt-1">{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ABOUT TEASER */}
        {showCoaches && (
          <section className="py-20 px-4 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <div className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                  Coaches &amp; Founder
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Meet the Coaches &amp; Founder</h2>
                <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">{coachesTeaserText}</p>
                <Link href="/about" className="inline-block mt-6 text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                  Meet the coaches →
                </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={homeCoachPhoto} alt="Affy Morris – Founder & Head Coach" className="w-full max-w-sm rounded-3xl shadow-xl object-cover" />
              </motion.div>
            </div>
          </section>
        )}

        {/* SUBSCRIPTION PLANS TEASER */}
        {showPlans && (
          <section className="py-20 px-4 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                  Monthly Plans
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{plansTitle}</h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400">{plansSubtitle}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center">
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">£{(satPricePence / 100).toFixed(0)}</div>
                  <div className="text-purple-600 dark:text-purple-400 font-semibold text-sm mt-1">per month</div>
                  <div className="mt-3 text-slate-600 dark:text-slate-300 text-sm font-medium">All Saturdays</div>
                  <div className="text-slate-400 dark:text-slate-500 text-xs mt-1">~4 sessions / month</div>
                </div>
                <div className="border-2 border-yellow-400 rounded-2xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-0.5 rounded-full">Best Value</div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">£{(bothPricePence / 100).toFixed(0)}</div>
                  <div className="text-yellow-600 dark:text-yellow-400 font-semibold text-sm mt-1">per month</div>
                  <div className="mt-3 text-slate-600 dark:text-slate-300 text-sm font-medium">Saturdays &amp; Sundays</div>
                  <div className="text-slate-400 dark:text-slate-500 text-xs mt-1">Up to ~8 sessions / month</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }} className="text-center mt-8">
                <Link href="/subscriptions" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                  View Monthly Plans
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA BANNER */}
        {showCta && (
          <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{ctaTitle}</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">{ctaDesc}</p>
              <Link href="/booking" className="inline-block mt-8 bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-transform hover:scale-105">
                {ctaButton}
              </Link>
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{ctaNote}</p>
            </motion.div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
