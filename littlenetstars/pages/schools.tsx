import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Schools() {
  return (
    <>
      <Head>
        <title>Schools & Nurseries – LittleNetStars</title>
        <meta
          name="description"
          content="Little Netters offers engaging football sessions for schools and nurseries for children aged 2–11. Sessions adapted to your setting's requirements."
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
                Schools & Nurseries
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Schools &amp; Nurseries
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Providing you have a suitable space, Little Netters can offer sessions in schools and nurseries.
              </p>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                All of our session plans can be adapted to suit your school&apos;s or nursery&apos;s requirements and needs. Our experienced coaches ensure sessions are delivered in a way that is engaging, motivating, educational, and fun for all children.
              </p>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                We aim to help children stay active, build confidence, develop coordination, and enjoy learning through football-based activities.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-10"
              >
                <Link
                  href="/contact"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-full text-lg shadow-lg transition-transform hover:scale-105"
                >
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Details */}
        <section className="py-20 px-4 bg-white dark:bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12"
            >
              Session Information
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                { icon: "👶", title: "Age Group", desc: "2–11 years old" },
                { icon: "⏱️", title: "Session Time", desc: "1 hour" },
                { icon: "📋", title: "Tailored Plans", desc: "Adapted to your setting's needs" },
                { icon: "🏫", title: "Flexible Delivery", desc: "Schools and nurseries welcome" },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 flex items-start gap-4 shadow-sm"
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
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
            <h2 className="text-3xl font-bold text-white">Interested in Little Netters for your school?</h2>
            <p className="mt-4 text-purple-200">
              Get in touch and we&apos;ll tailor a programme to suit your setting.
            </p>
            <Link
              href="/contact"
              className="inline-block mt-8 bg-white hover:bg-yellow-50 text-purple-700 font-bold px-8 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
            >
              Contact Us
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
