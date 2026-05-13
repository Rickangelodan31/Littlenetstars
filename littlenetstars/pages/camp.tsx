import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Camp() {
  return (
    <>
      <Head>
        <title>Little Netstars Camps – LittleNetStars</title>
        <meta
          name="description"
          content="Little Netstars Camps for children aged 4–11. Fun 1-hour netball sessions during the Easter holidays with flexible 1-day or 2-day options."
        />
      </Head>

      <Navbar />

      <main>
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                Easter Holidays
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Little Netstars Camps
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Little Netstars Camps for children aged 4–11 years old.
              </p>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                We are excited to announce a two-day netball camp filled with fun skills, drills, activities, and games. We will also be joined by special guest coaches from the Superleague teams.
              </p>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Our experienced coaches create exciting activities that help
                children improve netball skills, teamwork, confidence,
                coordination, and fitness — all while having fun in a safe and
                supportive environment.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-10"
              >
                <Link
                  href="/booking"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg transition-transform hover:scale-105"
                >
                  Book a Camp
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Camp dates & pricing */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12"
            >
              Upcoming Camps
            </motion.h2>

            {/* Easter camp card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 shadow-sm mb-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <div className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
                    Easter Camp
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Thu 1st April – Fri 2nd April 2027
                  </h3>
                  <p className="mt-1 text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>⏰</span> 9:00am – 4:00pm
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Full Camp (2 days)
                  </p>
                  <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                    £95.00
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Single Day
                  </p>
                  <p className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                    £60.00
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/booking"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                  Book a Camp
                </Link>
              </div>
            </motion.div>

            {/* Camp notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 mb-10"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Camp Notes</h3>
              <ul className="space-y-3">
                {[
                  { icon: "🥪", label: "Food and Drink", text: "Please ensure your child brings plenty of water, snacks, and a packed lunch." },
                  { icon: "👟", label: "Footwear", text: "Children should wear a pair of sturdy trainers." },
                  { icon: "💍", label: "Jewelry", text: "All jewelry must be removed prior to attending. For children who cannot remove their earrings, tape may be used to cover them." },
                ].map((note) => (
                  <li key={note.label} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <span className="text-xl mt-0.5">{note.icon}</span>
                    <span><span className="font-semibold">{note.label}:</span> {note.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Info tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: "⚽",
                  title: "Ages 4–11",
                  desc: "Suitable for all ages and abilities",
                },
                {
                  icon: "⏱️",
                  title: "Full Day",
                  desc: "9:00am – 4:00pm each day",
                },
                {
                  icon: "📅",
                  title: "Flexible Options",
                  desc: "Choose 1 day or both days",
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-center shadow-sm"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="py-20 px-4 bg-purple-600">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-white">
              Ready to join the fun?
            </h2>
            <p className="mt-4 text-purple-200">
              Secure your child&apos;s place at a Little Netstars Camp today.
            </p>
            <Link
              href="/booking"
              className="inline-block mt-8 bg-white hover:bg-yellow-50 text-purple-700 font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Book a Camp
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
