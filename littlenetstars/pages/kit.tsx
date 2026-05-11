import Head from "next/head";
import { motion } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import type { GetServerSideProps } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/mongodb";
import KitItem from "@/lib/models/KitItem";
import Setting from "@/lib/models/Setting";

interface KitItemData {
  _id: string;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  available: boolean;
  order: number;
}

interface Props {
  items: KitItemData[];
  readyTime: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    await dbConnect();
    const raw = await KitItem.find({ available: true }).sort({ order: 1, createdAt: 1 }).lean() as unknown as (KitItemData & { _id: unknown })[];
    const items: KitItemData[] = raw.map((i) => ({
      _id: String(i._id),
      name: i.name,
      description: i.description,
      price: i.price,
      photoUrl: i.photoUrl,
      available: i.available,
      order: i.order,
    }));
    const readySetting = await Setting.findOne({ key: "kit_ready_time" }).lean() as { value?: string } | null;
    const readyTime = readySetting?.value?.trim() || "approximately 2 weeks";
    return { props: { items, readyTime } };
  } catch {
    return { props: { items: [], readyTime: "approximately 2 weeks" } };
  }
};

// ── Size groups ──────────────────────────────────────────────────────────────

const SIZE_GROUPS = [
  { label: "Kids", sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"] },
  { label: "Adult", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
];

// ── Photo lightbox with pinch / scroll zoom + drag ───────────────────────────

function PhotoLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Reset pan when zoom returns to 1
  useEffect(() => { if (zoom <= 1) setPan({ x: 0, y: 0 }); }, [zoom]);

  function clampZoom(v: number) { return Math.min(5, Math.max(1, v)); }

  // Scroll to zoom
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => clampZoom(z - e.deltaY * 0.002));
  }

  // Double-click to toggle zoom
  function onDoubleClick() {
    setZoom((z) => (z > 1.1 ? 1 : 2.5));
  }

  // Mouse drag
  function onMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return;
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }
  function onMouseUp() { dragging.current = false; }

  // Touch pinch + drag
  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1 && zoom > 1) {
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }
  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 2 && lastDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = dist - lastDist.current;
      lastDist.current = dist;
      setZoom((z) => clampZoom(z + delta * 0.01));
    } else if (e.touches.length === 1 && zoom > 1) {
      const dx = e.touches[0].clientX - lastMouse.current.x;
      const dy = e.touches[0].clientY - lastMouse.current.y;
      lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  }
  function onTouchEnd() { lastDist.current = null; }

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Controls bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => clampZoom(z - 0.5))}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="Zoom out"
          >−</button>
          <span className="text-white/60 text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => clampZoom(z + 0.5))}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="Zoom in"
          >+</button>
          {zoom > 1 && (
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="text-xs text-white/50 hover:text-white/80 ml-1 transition-colors"
            >Reset</button>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center transition-colors"
          aria-label="Close"
        >×</button>
      </div>

      {/* Image */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor: zoom > 1 ? "grab" : "zoom-in" }}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: dragging.current ? "none" : "transform 0.15s ease",
            userSelect: "none",
          }}
        />
      </div>

      {/* Hint */}
      {zoom === 1 && (
        <p className="absolute bottom-5 left-0 right-0 text-center text-white/40 text-xs pointer-events-none">
          Scroll or pinch to zoom · Double-tap to zoom in · Click outside to close
        </p>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

interface OrderForm {
  size: string;
  quantity: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function Kit({ items, readyTime }: Props) {
  const [lightboxItem, setLightboxItem] = useState<KitItemData | null>(null);
  const [orderItem, setOrderItem] = useState<KitItemData | null>(null);
  const [form, setForm] = useState<OrderForm>({ size: "", quantity: 1, name: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const closeLightbox = useCallback(() => setLightboxItem(null), []);

  function openOrder(item: KitItemData) {
    setOrderItem(item);
    setForm({ size: "", quantity: 1, name: "", email: "", phone: "", notes: "" });
    setSuccess(false);
    setError("");
  }

  function closeOrder() {
    setOrderItem(null);
    setSuccess(false);
    setError("");
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!orderItem) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/kit/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: orderItem._id,
          itemName: orderItem.name,
          itemPhoto: orderItem.photoUrl,
          size: form.size,
          quantity: form.quantity,
          customer: { name: form.name, email: form.email, phone: form.phone },
          notes: form.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Order failed");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  const inputCls = "w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
  const labelCls = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <>
      <Head>
        <title>Kit – LittleNetStars</title>
        <meta name="description" content="LittleNetStars official kit and merchandise." />
      </Head>

      <Navbar />

      <main>
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
                Official Kit
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                LittleNetStars Kit
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
                {items.length > 0
                  ? "Get your official LittleNetStars kit and represent your team in style."
                  : "Our official kit is coming soon. Check back here for updates on how to order your LittleNetStars kit."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Kit grid */}
        {items.length > 0 && (
          <section className="py-20 px-4 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto">
              <p className="text-center text-sm text-slate-400 mb-8">Click any photo to zoom in</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Photo — click to open lightbox */}
                    <div
                      className="aspect-square bg-white dark:bg-slate-700 overflow-hidden relative group cursor-zoom-in"
                      onClick={() => item.photoUrl && setLightboxItem(item)}
                    >
                      {item.photoUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                              🔍 Zoom
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">👕</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.name}</h3>
                      {item.description && (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between gap-2">
                        <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                          £{(item.price / 100).toFixed(2)}
                        </span>
                        <button
                          onClick={() => openOrder(item)}
                          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Photo lightbox */}
      {lightboxItem && lightboxItem.photoUrl && (
        <PhotoLightbox src={lightboxItem.photoUrl} alt={lightboxItem.name} onClose={closeLightbox} />
      )}

      {/* Order Modal */}
      {orderItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900">Order Kit</h2>
                <p className="text-sm text-slate-500 mt-0.5">{orderItem.name}</p>
              </div>
              <button onClick={closeOrder} className="text-slate-400 hover:text-slate-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">×</button>
            </div>

            {success ? (
              <div className="px-6 py-10 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Order Received!</h3>
                <p className="text-slate-600 leading-relaxed">
                  Thanks for your order. A confirmation email is on its way to you.<br />
                  Your kit will be ready <strong>{readyTime}</strong>.
                </p>
                <button onClick={closeOrder} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-2.5 rounded-full text-sm transition-colors">
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* Ready time notice */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-purple-700 font-medium">
                    ⏰ Estimated ready time: <strong>{readyTime}</strong>
                  </p>
                  <p className="text-xs text-purple-500 mt-0.5">We&apos;ll email you when your order is ready to collect.</p>
                </div>

                {/* Size — Kids / Adult groups */}
                <div>
                  <label className={labelCls}>Size *</label>
                  <div className="space-y-3">
                    {SIZE_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{group.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.sizes.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, size: s }))}
                              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors ${
                                form.size === s
                                  ? "bg-purple-600 border-purple-600 text-white"
                                  : "border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Hidden required input to enforce selection */}
                  <input
                    tabIndex={-1}
                    required
                    value={form.size}
                    onChange={() => {}}
                    style={{ opacity: 0, height: 0, position: "absolute" }}
                    aria-hidden
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className={labelCls}>Quantity</label>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setForm((f) => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                      className="w-9 h-9 rounded-full border-2 border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-bold text-lg flex items-center justify-center transition-colors">
                      −
                    </button>
                    <span className="text-lg font-bold text-slate-900 w-6 text-center">{form.quantity}</span>
                    <button type="button"
                      onClick={() => setForm((f) => ({ ...f, quantity: Math.min(10, f.quantity + 1) }))}
                      className="w-9 h-9 rounded-full border-2 border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600 font-bold text-lg flex items-center justify-center transition-colors">
                      +
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className={labelCls}>Your Name *</label>
                  <input required type="text" placeholder="Full name" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
                </div>

                {/* Email */}
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input required type="email" placeholder="you@example.com" value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
                </div>

                {/* Phone */}
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" placeholder="Optional" value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
                </div>

                {/* Notes */}
                <div>
                  <label className={labelCls}>Notes (optional)</label>
                  <textarea rows={2} placeholder="Any special requests…" value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className={inputCls + " resize-none"} />
                </div>

                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    {submitting ? "Placing order…" : "Place Order"}
                  </button>
                  <button type="button" onClick={closeOrder}
                    className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
