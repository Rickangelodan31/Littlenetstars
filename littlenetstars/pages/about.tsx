import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <>
      <Head>
        <title>About Afrika Morris – LittleNetStars</title>
        <meta
          name="description"
          content="Former Jamaican international and UK Netball Superleague player, Afrika Morris now coaches the next generation of netball stars."
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
                Coach & Founder
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Afrika Morris
              </h1>
              <p className="mt-4 text-lg text-purple-600 dark:text-purple-400 font-semibold">
                Former Jamaican International · UK Netball Superleague
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl bg-gradient-to-br from-purple-100 to-yellow-100 dark:from-purple-900/40 dark:to-yellow-900/30 flex items-center justify-center shadow-xl">
                <span className="text-8xl">🏐</span>
              </div>
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
              className="prose prose-slate dark:prose-invert max-w-none"
            >
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Afrika Morris is a former Jamaican netball player who has competed at both national youth and professional levels in Jamaica and the United Kingdom.
              </p>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                She represented Jamaica at Under-21 level, demonstrating her talent on the international stage before continuing her development in England.
              </p>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Afrika went on to play in the UK&apos;s Netball Superleague, gaining valuable experience in a high-performance environment.
              </p>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                With a background that spans both the Caribbean and UK netball systems, Afrika brings a unique blend of skill, discipline, and game intelligence.
              </p>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                She is now dedicated to coaching and mentoring young players, helping them build confidence, develop strong fundamentals, and reach their full potential in netball.
              </p>
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
                { icon: "🇯🇲", title: "Jamaica U21", desc: "Represented Jamaica at international youth level" },
                { icon: "🏆", title: "Superleague", desc: "Competed in the UK Netball Superleague" },
                { icon: "🌍", title: "Caribbean & UK", desc: "Experience across two elite netball systems" },
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

        {/* CTA */}
        <section className="py-20 px-4 bg-purple-600">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-white">
              Book a session with Afrika
            </h2>
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
