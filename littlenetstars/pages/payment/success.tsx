import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { verifyPayment, fetchBooking, type BookingData } from "@/lib/api";

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id, booking_id, type, plan } = router.query;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isFreeSession, setIsFreeSession] = useState(false);
  const isSubscription = type === "subscription";

  useEffect(() => {
    // Subscription success — no further verification needed
    if (isSubscription) {
      setStatus("success");
      return;
    }

    // Free session — confirmed directly, no Stripe
    if (booking_id && typeof booking_id === "string") {
      fetchBooking(booking_id)
        .then((data) => {
          setBooking(data);
          setIsFreeSession(true);
          setStatus("success");
        })
        .catch(() => setStatus("error"));
      return;
    }

    // Paid session — verify via Stripe
    if (session_id && typeof session_id === "string") {
      verifyPayment(session_id)
        .then((data) => {
          if (data.paid) {
            setBooking(data.booking);
            setStatus("success");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    }
  }, [session_id, booking_id, isSubscription]);

  return (
    <>
      <Head>
        <title>Booking Confirmed – LittleNetStars</title>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full">
          {status === "loading" && (
            <div className="text-center text-slate-500 dark:text-slate-400">Confirming your booking...</div>
          )}

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center"
            >
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                We couldn&apos;t confirm your booking. If you were charged, please contact us.
              </p>
              <Link
                href="/booking"
                className="inline-block mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold"
              >
                Try Again
              </Link>
            </motion.div>
          )}

          {/* Subscription success */}
          {status === "success" && isSubscription && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-3xl">🌟</span>
              </motion.div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Subscription Confirmed!
              </h1>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full">
                {plan === "both" ? "Weekend Sessions" : "Saturday Sessions"} — Active
              </div>
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                Your subscription is now active. You&apos;re all set for every{" "}
                {plan === "both" ? "Saturday and Sunday" : "Saturday"} this month.
              </p>
              <p className="mt-2 text-slate-400 dark:text-slate-500 text-xs">
                A confirmation has been sent to your email. You can manage your subscription via the Stripe customer portal.
              </p>
              <Link
                href="/"
                className="block mt-6 text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-full transition-colors"
              >
                Back to Home
              </Link>
            </motion.div>
          )}

          {status === "success" && !isSubscription && booking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-3xl">✓</span>
                </motion.div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Booking Confirmed!
                </h1>
                {isFreeSession && (
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    🎉 Free Session
                  </div>
                )}
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  A confirmation has been sent to <strong>{booking.parent.email}</strong>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Location</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Date</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {new Date(booking.date).toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Time</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{booking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    {booking.children.length === 1 ? "Child" : "Children"}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {booking.children.map((c) => c.name).join(", ")}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-center text-slate-400 dark:text-slate-500">
                Free cancellation up to 48 hours before the session.
              </div>

              <Link
                href="/"
                className="block mt-6 text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-full transition-colors"
              >
                Back to Home
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
