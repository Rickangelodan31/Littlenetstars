import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PaymentCancel() {
  return (
    <>
      <Head>
        <title>Payment Cancelled – LittleNetStars</title>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center"
        >
          <div className="text-5xl mb-4">↩️</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Cancelled</h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            No payment was taken. Your booking has not been confirmed.
          </p>
          <Link
            href="/booking"
            className="inline-block mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold transition-colors"
          >
            Try Again
          </Link>
        </motion.div>
      </main>

      <Footer />
    </>
  );
}
