import Head from "next/head";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Gallery() {
  return (
    <>
      <Head>
        <title>Gallery – LittleNetStars</title>
        <meta name="description" content="Photos and videos from LittleNetStars sessions." />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-white dark:bg-slate-900 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Gallery</h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Photos and videos from our sessions coming soon.</p>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-yellow-100 dark:from-purple-900/30 dark:to-yellow-900/20 flex items-center justify-center"
                >
                  <span className="text-4xl opacity-40">🏐</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
