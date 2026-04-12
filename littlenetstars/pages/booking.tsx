import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  checkFreeEligible,
  createBooking,
  createCheckoutSession,
} from "@/lib/api";

type Child = {
  name: string;
  age: string;
};

const TIMES = ["10:00", "14:00"];

const LOCATIONS = ["London", "Manchester"];

type Step = 1 | 2 | 3 | 4;

export default function Booking() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [location, setLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [children, setChildren] = useState<Child[]>([{ name: "", age: "" }]);
  const [parent, setParent] = useState({ name: "", email: "", phone: "" });
  const [isFreeSession, setIsFreeSession] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addChild() {
    setChildren([...children, { name: "", age: "" }]);
  }

  function updateChild(index: number, field: keyof Child, value: string) {
    setChildren(
      children.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  function removeChild(index: number) {
    if (children.length === 1) return;
    setChildren(children.filter((_, i) => i !== index));
  }

  const selectedDateIsWeekend = (() => {
    if (!selectedDate) return false;
    const day = new Date(selectedDate).getUTCDay();
    return day === 0 || day === 6;
  })();
  const canProceedStep1 =
    location && selectedDate && selectedDateIsWeekend && selectedTime;
  const canProceedStep2 = children.every((c) => c.name && c.age);
  const canProceedStep3 = parent.name && parent.email && parent.phone;

  const stepLabels = ["Date & Time", "Child Details", "Parent Info", "Review"];

  async function handleContinue() {
    // When leaving step 3, check if this email qualifies for a free session
    if (step === 3 && parent.email) {
      const { eligible } = await checkFreeEligible(parent.email);
      setIsFreeSession(eligible);
    }
    setStep((step + 1) as Step);
  }

  return (
    <>
      <Head>
        <title>Book a Session – LittleNetStars</title>
        <meta
          name="description"
          content="Book a netball session for your child with LittleNetStars."
        />
      </Head>

      <Navbar />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Book a Session
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Saturdays & Sundays · 45 min sessions · London & Manchester
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
              <span>🎉</span> First session is FREE — no payment needed
            </div>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 gap-2">
            {stepLabels.map((label, i) => {
              const num = (i + 1) as Step;
              const active = num === step;
              const done = num < step;
              return (
                <div
                  key={label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      done
                        ? "bg-purple-600 text-white"
                        : active
                          ? "bg-purple-600 text-white ring-4 ring-purple-200 dark:ring-purple-900"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}
                  >
                    {done ? "✓" : num}
                  </div>
                  <span
                    className={`text-xs hidden sm:block ${active ? "text-purple-600 dark:text-purple-400 font-semibold" : "text-slate-400"}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 sm:p-8"
          >
            {/* STEP 1: Date & Time */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Select Date & Time
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Location
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                          location === loc
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-300"
                        }`}
                      >
                        📍 {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Date{" "}
                    <span className="text-slate-400 font-normal">
                      (Weekends only)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {selectedDate && !selectedDateIsWeekend && (
                    <p className="mt-2 text-xs text-red-500">
                      Please select a Saturday or Sunday.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Session Time
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                          selectedTime === t
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                            : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Child Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Child Details
                </h2>
                {children.map((child, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Child {i + 1}
                      </span>
                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(i)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Child's full name"
                      value={child.name}
                      onChange={(e) => updateChild(i, "name", e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      min="4"
                      max="18"
                      value={child.age}
                      onChange={(e) => updateChild(i, "age", e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                ))}
                <button
                  onClick={addChild}
                  className="w-full border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl py-3 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  + Add Another Child
                </button>
              </div>
            )}

            {/* STEP 3: Parent Info */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Parent / Guardian Details
                </h2>
                {[
                  {
                    label: "Full Name",
                    key: "name",
                    type: "text",
                    placeholder: "Your full name",
                  },
                  {
                    label: "Email Address",
                    key: "email",
                    type: "email",
                    placeholder: "you@example.com",
                  },
                  {
                    label: "Phone Number",
                    key: "phone",
                    type: "tel",
                    placeholder: "+44 7700 000000",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={parent[field.key as keyof typeof parent]}
                      onChange={(e) =>
                        setParent({ ...parent, [field.key]: e.target.value })
                      }
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Review Your Booking
                  </h2>
                  {isFreeSession ? (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
                      🎉 FREE SESSION
                    </span>
                  ) : (
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full">
                      £30 per child
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Session
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Location
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {location}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Date
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {new Date(selectedDate).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Time
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedTime}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Duration
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        45 minutes
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Children ({children.length})
                    </h3>
                    {children.map((c, i) => (
                      <div
                        key={i}
                        className="text-sm text-slate-700 dark:text-slate-300"
                      >
                        {c.name}, age {c.age}
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Parent
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Name
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {parent.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Email
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {parent.email}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Phone
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {parent.phone}
                      </span>
                    </div>
                  </div>

                  {isFreeSession ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-sm text-green-700 dark:text-green-300">
                      <strong>Your first session is FREE (£0 today).</strong> After 30 days, you&apos;ll be charged £30/month. Cancel anytime before your next billing date to avoid the charge.
                    </div>
                  ) : (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 text-sm text-purple-700 dark:text-purple-300">
                      Cancellation is free up to 48 hours before your session.
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  onClick={async () => {
                    setError("");
                    setLoading(true);
                    try {
                      const { bookingId } =
                        await createBooking({
                          location,
                          date: selectedDate,
                          time: selectedTime,
                          children,
                          parent,
                        });
                      const { url } = await createCheckoutSession(bookingId);
                      window.location.href = url;
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Something went wrong. Please try again.",
                      );
                      setLoading(false);
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full text-base transition-transform hover:scale-105 shadow-lg"
                >
                  {loading
                    ? "Processing..."
                    : isFreeSession
                      ? "Confirm Free Session (£0 Today)"
                      : "Proceed to Payment"}
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            {step !== 4 && (
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
                  className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2) ||
                    (step === 3 && !canProceedStep3)
                  }
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors"
                >
                  Continue →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}
