import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import type { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/mongodb";
import CoachModel from "@/lib/models/Coach";
import Setting from "@/lib/models/Setting";

interface CoachData {
  _id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  order: number;
}

interface Props {
  coaches: CoachData[];
  settings: Record<string, string>;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    await dbConnect();
    const [coachDocs, settingDocs] = await Promise.all([
      CoachModel.find({ active: true }).sort({ order: 1 }).lean(),
      Setting.find({}).lean(),
    ]);
    const settings: Record<string, string> = {};
    (settingDocs as { key: string; value: string }[]).forEach((s) => { settings[s.key] = s.value; });
    return { props: { coaches: JSON.parse(JSON.stringify(coachDocs)), settings } };
  } catch {
    return { props: { coaches: [], settings: {} } };
  }
};

const DEFAULT_BIO = [
  "Affy is a former Jamaican netball player who has competed at both national youth and professional levels in Jamaica and the United Kingdom.",
  "She represented Jamaica at Under-21 level, demonstrating her talent on the international stage before continuing her development in England.",
  "Affy went on to play in the UK\u2019s Netball Superleague, gaining valuable experience in a high-performance environment.",
  "With a background that spans both the Caribbean and UK netball systems, Affy brings a unique blend of skill, discipline, and game intelligence.",
  "She is now dedicated to coaching and mentoring young players, helping them build confidence, develop strong fundamentals, and reach their full potential in netball.",
];

export default function About({ coaches, settings }: Props) {
  // Use first coach from DB or fall back to hardcoded Affy Morris
  const founder = coaches[0];
  const additionalCoaches = coaches.slice(1);

  const founderName = founder?.name || settings.about_hero_title || "Affy Morris";
  const founderTitle = founder?.title || settings.about_hero_subtitle || "Former Jamaican International · UK Netball Superleague";
  const founderPhoto = founder?.photoUrl || "";

  const bioParagraphs = (() => {
    if (founder?.bio) return [founder.bio];
    return DEFAULT_BIO.map((defaultText, i) => settings[`about_bio_${i + 1}`] || defaultText);
  })();

  const cta = settings.about_cta || "Book a session with " + founderName.split(" ")[0];

  return (
    <>
      <Head>
        <title>Meet the Coaches – LittleNetStars</title>
        <meta
          name="description"
          content={`${founderName} — Founder of LittleNetStars. ${founderTitle}.`}
        />
      </Head>

      <Navbar />

      <main>
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                Founder & Head Coach
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {founderName}
              </h1>
              <p className="mt-4 text-lg text-purple-600 dark:text-purple-400 font-semibold">
                {founderTitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              {founderPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={founderPhoto}
                  alt={founderName}
                  className="w-64 h-64 md:w-72 md:h-72 rounded-3xl object-cover shadow-xl"
                />
              ) : (
                <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl bg-gradient-to-br from-purple-200 to-yellow-200 dark:from-purple-900/60 dark:to-yellow-900/40 flex flex-col items-center justify-center shadow-xl gap-2">
                  <span className="text-6xl font-extrabold text-purple-600 dark:text-purple-300">
                    {founderName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-xs text-purple-500 dark:text-purple-400 font-medium">Photo coming soon</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Bio */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {bioParagraphs.map((para, i) => (
                <p key={i} className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{para}</p>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12"
            >
              Career Highlights
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: "🇯🇲", title: settings.highlight_1_title || "Jamaica U21", desc: settings.highlight_1_desc || "Represented Jamaica at international youth level" },
                { icon: "🏆", title: settings.highlight_2_title || "Superleague",   desc: settings.highlight_2_desc || "Competed in the UK Netball Superleague" },
                { icon: "🌍", title: settings.highlight_3_title || "Founder",       desc: settings.highlight_3_desc || "Created LittleNetStars to coach the next generation" },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center shadow-sm"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional coaches grid */}
        {additionalCoaches.length > 0 && (
          <section className="py-20 px-4 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12"
              >
                Our Coaching Team
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {additionalCoaches.map((coach) => (
                  <motion.div
                    key={coach._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-center"
                  >
                    {coach.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coach.photoUrl} alt={coach.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-yellow-200 dark:from-purple-900/60 dark:to-yellow-900/40 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-purple-600">
                        {coach.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-bold text-slate-900 dark:text-white">{coach.name}</h3>
                    {coach.title && <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{coach.title}</p>}
                    {coach.bio && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{coach.bio}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Growing team / coming soon (only shown if fewer than 3 coaches) */}
        {coaches.length < 3 && (
          <section className="py-16 px-4 bg-white dark:bg-slate-900">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                  Growing Team
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">More coaches joining soon</h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400">
                  LittleNetStars is expanding. New coaches will be announced here shortly.
                </p>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 px-4 bg-purple-600">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-white">{cta}</h2>
            <p className="mt-4 text-purple-200">
              Give your child the chance to train with a former international player.
            </p>
            <Link
              href="/booking"
              className="inline-block mt-8 bg-white hover:bg-yellow-50 text-purple-700 font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Book Now
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
