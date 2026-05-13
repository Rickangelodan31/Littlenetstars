import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop as RICrop, type PixelCrop } from "react-image-crop";
import {
  verifyAdmin, fetchAllBookings, deleteBooking, refundBooking,
  fetchSettings, saveSettings,
  fetchGallery, addGalleryByUrl, updateGalleryImage, deleteGalleryImage,
  fetchCoaches, addCoach, updateCoach, deleteCoach,
  fetchSubscriptions,
  fetchKitItems, addKitItem, updateKitItem, deleteKitItem,
  fetchKitOrders, updateKitOrder, deleteKitOrder,
  type GalleryImage, type Coach, type BookingRecord, type SubscriptionRecord, type KitItem, type KitOrderRecord,
} from "@/lib/adminApi";

type Tab = "bookings" | "sessions" | "content" | "gallery" | "coaches" | "subscriptions" | "kit";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "bookings",      label: "Bookings",      icon: "📋" },
  { id: "sessions",      label: "Sessions",       icon: "📅" },
  { id: "content",       label: "Content",        icon: "✏️" },
  { id: "gallery",       label: "Gallery",        icon: "🖼️" },
  { id: "coaches",       label: "Coaches",        icon: "👤" },
  { id: "kit",           label: "Kit",            icon: "👕" },
  { id: "subscriptions", label: "Subscriptions",  icon: "⭐" },
];

// ── Pure helpers ─────────────────────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => resolve(ev.target?.result as string);
    reader.readAsDataURL(file);
  });
}

function toEmbedUrl(url: string): string | null {
  let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com/video/")) return url;
  return null;
}

/** Compress image via canvas — keeps base64 manageable for MongoDB. */
function fileToDataUri(file: File, maxPx = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) { height = Math.round((height * maxPx) / width); width = maxPx; }
          else                 { width  = Math.round((width  * maxPx) / height); height = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

// ── Crop/Adjust state type ───────────────────────────────────────────────────

interface CropState {
  src: string;
  originalSrc: string;
  caption: string;
  /** Where to send the result. "gallery-new" saves a new gallery item.
   *  "gallery-replace:<id>" replaces an existing gallery item.
   *  "coach-new" updates coachForm.photoUrl.
   *  "coach-quick:<id>" does a quick photo update on an existing coach.
   *  "founder" saves to settings.about_hero_photo. */
  target:
    | "gallery-new"
    | `gallery-replace:${string}`
    | "coach-new"
    | `coach-quick:${string}`
    | "founder"
    | "home-coach"
    | "kit-new"
    | `kit-quick:${string}`;
}

// ── Apply crop + adjustments to canvas ──────────────────────────────────────

function applyCropCanvas(
  imgEl: HTMLImageElement,
  crop: PixelCrop,
  brightness: number,
  contrast: number,
  maxPx = 1400,
): string {
  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;
  const srcX = crop.x * scaleX;
  const srcY = crop.y * scaleY;
  let srcW = crop.width * scaleX;
  let srcH = crop.height * scaleY;
  let outW = srcW, outH = srcH;
  if (outW > maxPx || outH > maxPx) {
    if (outW >= outH) { outH = Math.round((outH * maxPx) / outW); outW = maxPx; }
    else               { outW = Math.round((outW * maxPx) / outH); outH = maxPx; }
  }
  const canvas = document.createElement("canvas");
  canvas.width = outW; canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  ctx.drawImage(imgEl, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
  return canvas.toDataURL("image/jpeg", 0.85);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("bookings");
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bookings
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  // Settings
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Gallery
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imgUrl, setImgUrl] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [galleryMsg, setGalleryMsg] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Video URL add
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCaption, setVideoCaption] = useState("");

  // Crop / Adjust modal
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [ricCrop, setRicCrop] = useState<RICrop | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>();
  const cropImgRef = useRef<HTMLImageElement>(null);
  const [cropBrightness, setCropBrightness] = useState(100);
  const [cropContrast, setCropContrast] = useState(100);
  const [cropSaving, setCropSaving] = useState(false);

  // Coaches
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachForm, setCoachForm] = useState({ name: "", title: "", bio: "", photoUrl: "", order: 0 });
  const [editingCoach, setEditingCoach] = useState<string | null>(null);
  const [coachMsg, setCoachMsg] = useState("");
  const coachPhotoRef = useRef<HTMLInputElement>(null);
  const [quickPhotoCoachId, setQuickPhotoCoachId] = useState<string | null>(null);
  const quickPhotoRef = useRef<HTMLInputElement>(null);

  // Founder photo (Content tab)
  const founderPhotoRef = useRef<HTMLInputElement>(null);

  // Home coach photo (Content tab)
  const homeCoachPhotoRef = useRef<HTMLInputElement>(null);

  // Gallery replace mode
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);

  // Kit
  const [kitItems, setKitItems] = useState<KitItem[]>([]);
  const [kitForm, setKitForm] = useState({ name: "", description: "", price: 0, photoUrl: "", available: true, order: 0 });
  const [editingKit, setEditingKit] = useState<string | null>(null);
  const [kitMsg, setKitMsg] = useState("");
  const kitPhotoRef = useRef<HTMLInputElement>(null);

  // Kit Orders
  const [kitOrders, setKitOrders] = useState<KitOrderRecord[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (!t) { router.replace("/admin/login"); return; }
    verifyAdmin(t).then((ok) => {
      if (!ok) { router.replace("/admin/login"); return; }
      setToken(t);
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    if (!token) return;
    fetchAllBookings(token).then(setBookings).catch(console.error);
    fetchSettings(token).then(setSettings).catch(console.error);
    fetchGallery(token).then(setImages).catch(console.error);
    fetchCoaches(token).then(setCoaches).catch(console.error);
    fetchSubscriptions(token).then(setSubscriptions).catch(console.error);
    fetchKitItems(token).then(setKitItems).catch(console.error);
    fetchKitOrders(token).then(setKitOrders).catch(console.error);
  }, [token]);

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  // ── Open crop modal helper ───────────────────────────────────────────────

  function openCropModalWithSrc(src: string, target: CropState["target"], caption = "") {
    setCropState({ src, originalSrc: src, caption, target });
    setRicCrop(undefined);
    setCompletedCrop(undefined);
    setCropBrightness(100);
    setCropContrast(100);
  }

  async function openCropModal(file: File, target: CropState["target"], caption = "") {
    const src = await readFileAsDataUrl(file);
    openCropModalWithSrc(src, target, caption);
  }

  // ── Crop apply ───────────────────────────────────────────────────────────

  const handleCropApply = useCallback(async () => {
    if (!cropState || !token || !completedCrop || !cropImgRef.current) return;
    if (completedCrop.width === 0 || completedCrop.height === 0) return;
    setCropSaving(true);
    try {
      const maxPx = cropState.target.startsWith("coach") || cropState.target === "founder" || cropState.target === "home-coach" || cropState.target.startsWith("kit") ? 1200 : 1400;
      const dataUri = applyCropCanvas(
        cropImgRef.current, completedCrop,
        cropBrightness, cropContrast, maxPx,
      );

      if (cropState.target === "gallery-new") {
        const img = await addGalleryByUrl(token, dataUri, cropState.caption, images.length);
        setImages((p) => [...p, img]);
        if (galleryFileRef.current) galleryFileRef.current.value = "";
        setGalleryMsg("Image uploaded.");
      } else if (cropState.target.startsWith("gallery-replace:")) {
        const id = cropState.target.replace("gallery-replace:", "");
        const updated = await updateGalleryImage(token, id, { imageUrl: dataUri });
        setImages((p) => p.map((i) => i._id === id ? updated : i));
        setReplacingImageId(null);
        setGalleryMsg("Image replaced.");
      } else if (cropState.target === "coach-new") {
        setCoachForm((f) => ({ ...f, photoUrl: dataUri }));
        if (coachPhotoRef.current) coachPhotoRef.current.value = "";
      } else if (cropState.target.startsWith("coach-quick:")) {
        const id = cropState.target.replace("coach-quick:", "");
        const updated = await updateCoach(token, id, { photoUrl: dataUri });
        setCoaches((p) => p.map((c) => c._id === id ? updated : c));
        setQuickPhotoCoachId(null);
        if (quickPhotoRef.current) quickPhotoRef.current.value = "";
        setCoachMsg("Photo updated.");
      } else if (cropState.target === "founder") {
        setSetting("about_hero_photo", dataUri);
        if (founderPhotoRef.current) founderPhotoRef.current.value = "";
        await saveSettings(token, { about_hero_photo: dataUri });
      } else if (cropState.target === "home-coach") {
        setSetting("home_coach_photo", dataUri);
        if (homeCoachPhotoRef.current) homeCoachPhotoRef.current.value = "";
        await saveSettings(token, { home_coach_photo: dataUri });
      } else if (cropState.target === "kit-new") {
        setKitForm((f) => ({ ...f, photoUrl: dataUri }));
        if (kitPhotoRef.current) kitPhotoRef.current.value = "";
      } else if (cropState.target.startsWith("kit-quick:")) {
        const id = cropState.target.replace("kit-quick:", "");
        const updated = await updateKitItem(token, id, { photoUrl: dataUri });
        setKitItems((p) => p.map((k) => k._id === id ? updated : k));
        setKitMsg("Photo updated.");
      }

      setCropState(null);
    } catch {
      setGalleryMsg("Upload failed — please try again.");
    }
    setCropSaving(false);
  }, [cropState, token, completedCrop, cropBrightness, cropContrast, images.length]);

  // ── Settings ─────────────────────────────────────────────────────────────

  async function handleSaveSettings() {
    if (!token) return;
    setSettingsSaving(true);
    try {
      await saveSettings(token, settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } finally {
      setSettingsSaving(false);
    }
  }

  function setSetting(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  // ── Gallery ──────────────────────────────────────────────────────────────

  async function handleAddByUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const img = await addGalleryByUrl(token, imgUrl, imgCaption, images.length);
      setImages((p) => [...p, img]);
      setImgUrl(""); setImgCaption("");
      setGalleryMsg("Image added.");
    } catch { setGalleryMsg("Failed to add image."); }
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const embedUrl = toEmbedUrl(videoUrl.trim());
    if (!embedUrl) {
      setGalleryMsg("Please enter a valid YouTube or Vimeo URL.");
      return;
    }
    try {
      const img = await addGalleryByUrl(token, embedUrl, videoCaption, images.length, "video");
      setImages((p) => [...p, img]);
      setVideoUrl(""); setVideoCaption("");
      setGalleryMsg("Video added.");
    } catch { setGalleryMsg("Failed to add video."); }
  }

  async function handleDeleteImage(id: string) {
    if (!token || !confirm("Delete this item?")) return;
    await deleteGalleryImage(token, id);
    setImages((p) => p.filter((i) => i._id !== id));
  }

  async function handleUpdateCaption(id: string, caption: string) {
    if (!token) return;
    const updated = await updateGalleryImage(token, id, { caption });
    setImages((p) => p.map((i) => i._id === id ? updated : i));
  }

  // ── Coaches ──────────────────────────────────────────────────────────────

  async function handleSaveCoach(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingCoach) {
        const updated = await updateCoach(token, editingCoach, coachForm);
        setCoaches((p) => p.map((c) => c._id === editingCoach ? updated : c));
        setEditingCoach(null);
        setCoachMsg("Coach updated.");
      } else {
        const created = await addCoach(token, coachForm);
        setCoaches((p) => [...p, created]);
        setCoachMsg("Coach added.");
      }
      setCoachForm({ name: "", title: "", bio: "", photoUrl: "", order: 0 });
    } catch { setCoachMsg("Failed to save coach."); }
  }

  async function handleDeleteCoach(id: string) {
    if (!token || !confirm("Delete this coach?")) return;
    await deleteCoach(token, id);
    setCoaches((p) => p.filter((c) => c._id !== id));
  }

  function startEditCoach(coach: Coach) {
    setEditingCoach(coach._id);
    setCoachForm({ name: coach.name, title: coach.title, bio: coach.bio, photoUrl: coach.photoUrl, order: coach.order });
  }

  // ── Kit handlers ─────────────────────────────────────────────────

  async function handleSaveKit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingKit) {
        const updated = await updateKitItem(token, editingKit, kitForm);
        setKitItems((p) => p.map((k) => k._id === editingKit ? updated : k));
        setEditingKit(null);
        setKitMsg("Item updated.");
      } else {
        const created = await addKitItem(token, kitForm);
        setKitItems((p) => [...p, created]);
        setKitMsg("Item added.");
      }
      setKitForm({ name: "", description: "", price: 0, photoUrl: "", available: true, order: 0 });
    } catch { setKitMsg("Failed to save item."); }
  }

  async function handleDeleteKit(id: string) {
    if (!token || !confirm("Delete this kit item?")) return;
    await deleteKitItem(token, id);
    setKitItems((p) => p.filter((k) => k._id !== id));
  }

  function startEditKit(item: KitItem) {
    setEditingKit(item._id);
    setKitForm({ name: item.name, description: item.description, price: item.price, photoUrl: item.photoUrl, available: item.available, order: item.order });
  }

  if (!ready) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Loading…</p>
    </div>
  );

  const paid = bookings.filter((b) => b.status === "paid" && !b.isFreeSession);
  const free = bookings.filter((b) => b.isFreeSession);
  const revenue = paid.reduce((sum, b) => sum + (b.amountPaid ?? 0), 0);
  const activeSubs = subscriptions.filter((s) => s.status === "active").length;

  // ── Input helpers ────────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
  const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const sectionCls = "bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm space-y-4";

  return (
    <>
      <Head><title>Admin – LittleNetStars</title></Head>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">

        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
              LittleNet<span className="text-yellow-500">Stars</span>
              <span className="text-slate-400 font-normal text-sm ml-2">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">View site →</a>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500 transition-colors">Sign out</button>
          </div>
        </header>

        {/* Stats bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex gap-6 overflow-x-auto">
          {[
            { label: "Total Bookings", value: bookings.length },
            { label: "Paid Sessions",  value: paid.length },
            { label: "Free Sessions",  value: free.length },
            { label: "Revenue",        value: `£${(revenue / 100).toFixed(2)}` },
            { label: "Active Subs",    value: activeSubs },
          ].map((s) => (
            <div key={s.label} className="shrink-0">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex relative">
          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed top-0 left-0 z-40 h-full w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 pt-20 flex flex-col
            transition-transform duration-200 ease-in-out
            md:relative md:top-auto md:left-auto md:z-auto md:w-48 md:translate-x-0 md:pt-6 md:flex
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={`w-full text-left px-5 py-3.5 text-sm font-medium flex items-center gap-3 transition-colors ${
                  tab === t.id
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-r-2 border-purple-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}>
                <span className="text-base">{t.icon}</span>{t.label}
              </button>
            ))}
          </aside>

          {/* Main */}
          <main className="flex-1 p-4 md:p-6 max-w-4xl min-w-0 w-full">

            {/* ── BOOKINGS ── */}
            {tab === "bookings" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Bookings</h2>
                {bookings.length === 0 && <p className="text-slate-400 text-sm">No bookings yet.</p>}
                {bookings.map((b) => {
                  const isPaid     = b.status === "paid" && !b.isFreeSession && (b.amountPaid ?? 0) > 0;
                  const isRefunded = b.status === "refunded";
                  const isFree     = b.isFreeSession;
                  const amtDisplay = `£${((b.amountPaid ?? 0) / 100).toFixed(2)}`;
                  return (
                    <div key={b._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900 dark:text-white">{b.parent.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              isFree      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : isPaid    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : isRefunded? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}>
                              {isFree ? "Free Session" : isPaid ? "Paid" : isRefunded ? "Refunded" : "Pending"}
                            </span>
                          </div>
                          {isPaid && (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-extrabold text-green-600 dark:text-green-400">{amtDisplay}</span>
                              <span className="text-xs text-slate-400">charged · booked {new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </div>
                          )}
                          {isRefunded && (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-extrabold text-orange-500 line-through">{amtDisplay}</span>
                              <span className="text-xs text-slate-400">refunded</span>
                            </div>
                          )}
                          {isFree && (
                            <div className="text-sm font-semibold text-green-600 dark:text-green-400">£0.00 — complimentary first session</div>
                          )}
                          <p className="text-sm text-slate-500 dark:text-slate-400">{b.parent.email} · {b.parent.phone}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            📍 {b.location} &nbsp;·&nbsp;
                            📅 {new Date(b.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} &nbsp;·&nbsp;
                            ⏰ {b.time}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            👧 {b.children.map((c) => `${c.name} (age ${c.age})`).join(", ")}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0 items-end">
                          {isPaid && (
                            <button
                              onClick={async () => {
                                if (!token || !confirm(`Issue a full refund of ${amtDisplay} to ${b.parent.name}?`)) return;
                                try {
                                  await refundBooking(token, b._id);
                                  setBookings((p) => p.map((x) => x._id === b._id ? { ...x, status: "refunded" } : x));
                                } catch (err) {
                                  alert(err instanceof Error ? err.message : "Refund failed");
                                }
                              }}
                              className="text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Refund {amtDisplay}
                            </button>
                          )}
                          <button onClick={async () => {
                            if (!token || !confirm("Delete this booking record?")) return;
                            await deleteBooking(token, b._id);
                            setBookings((p) => p.filter((x) => x._id !== b._id));
                          }} className="text-xs text-red-400 hover:text-red-600 font-medium">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── SESSIONS ── */}
            {tab === "sessions" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Session Settings</h2>
                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Per-Session Booking</h3>
                  <div>
                    <label className={labelCls}>Session Price (£ per child)</label>
                    <input type="number" value={Math.round(Number(settings.price ?? 3000) / 100)}
                      onChange={(e) => setSetting("price", String(Number(e.target.value) * 100))}
                      className={inputCls} style={{ maxWidth: 160 }}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Session Times (comma separated)</label>
                    <input type="text" value={settings.times ?? "10:00, 14:00"}
                      onChange={(e) => setSetting("times", e.target.value)}
                      className={inputCls} placeholder="10:00, 14:00"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Locations (comma separated)</label>
                    <input type="text" value={settings.locations ?? "London, Manchester"}
                      onChange={(e) => setSetting("locations", e.target.value)}
                      className={inputCls} placeholder="London, Manchester"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Session Duration</label>
                    <input type="text" value={settings.duration ?? "1 Hour"}
                      onChange={(e) => setSetting("duration", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Monthly Subscription Prices</h3>
                  <div>
                    <label className={labelCls}>Friday Plan Price (£/month)</label>
                    <input type="number" value={Math.round(Number(settings.plan_saturday_price ?? 10000) / 100)}
                      onChange={(e) => setSetting("plan_saturday_price", String(Number(e.target.value) * 100))}
                      className={inputCls} style={{ maxWidth: 160 }}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Weekend Plan Price (£/month)</label>
                    <input type="number" value={Math.round(Number(settings.plan_both_price ?? 16000) / 100)}
                      onChange={(e) => setSetting("plan_both_price", String(Number(e.target.value) * 100))}
                      className={inputCls} style={{ maxWidth: 160 }}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Friday Plan Name</label>
                    <input type="text" value={settings.plan_saturday_name ?? "Friday Sessions"}
                      onChange={(e) => setSetting("plan_saturday_name", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Weekend Plan Name</label>
                    <input type="text" value={settings.plan_both_name ?? "Weekend Sessions"}
                      onChange={(e) => setSetting("plan_both_name", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <button onClick={handleSaveSettings} disabled={settingsSaving}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                  {settingsSaved ? "Saved ✓" : settingsSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {/* ── CONTENT ── */}
            {tab === "content" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Website Content</h2>
                <p className="text-xs text-slate-400">Edit the text that appears on your website. Click Save to apply changes.</p>

                {/* Home Page Hero */}
                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Home Page — Hero</h3>
                  {[
                    { key: "hero_title",       label: "Main Title",      placeholder: "LittleNetStars",                    rows: 1 },
                    { key: "hero_subtitle",    label: "Tagline",         placeholder: "Building Confidence Through Netball", rows: 1 },
                    { key: "hero_description", label: "Hero Description", placeholder: "Fun, structured netball training…",  rows: 2 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"} />
                    </div>
                  ))}
                </div>

                {/* Home Page — Programmes Slideshow */}
                <div className={sectionCls}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Home Page — Programmes Slideshow</h3>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={settings.home_programmes_show !== "false"}
                        onChange={(e) => setSetting("home_programmes_show", e.target.checked ? "true" : "false")}
                        className="accent-purple-600 w-4 h-4" />
                      Show section
                    </label>
                  </div>
                  {[
                    { key: "home_programmes_title",    label: "Section Title",    placeholder: "More Ways to Play",                              rows: 1 },
                    { key: "home_programmes_subtitle", label: "Section Subtitle", placeholder: "Beyond weekend sessions — camps, schools & nurseries", rows: 1 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"} />
                    </div>
                  ))}
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Camp Slide</p>
                  {[
                    { key: "home_camp_tag",         label: "Badge Text",        placeholder: "Easter Holidays",                rows: 1 },
                    { key: "home_camp_title",        label: "Slide Title",       placeholder: "Little Netstars Camps",           rows: 1 },
                    { key: "home_camp_description",  label: "Description",       placeholder: "Exciting two-day netball camps…", rows: 3 },
                    { key: "home_camp_dates",        label: "Dates",             placeholder: "Thu 1st – Fri 2nd April 2027",   rows: 1 },
                    { key: "home_camp_time",         label: "Time",              placeholder: "9:00am – 4:00pm",                rows: 1 },
                    { key: "home_camp_full",         label: "Full Camp Price",   placeholder: "£95.00",                         rows: 1 },
                    { key: "home_camp_single",       label: "Single Day Price",  placeholder: "£60.00",                         rows: 1 },
                    { key: "home_camp_cta",          label: "Button Text",       placeholder: "View Camp Details",              rows: 1 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"} />
                    </div>
                  ))}
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Schools & Nurseries Slide</p>
                  {[
                    { key: "home_schools_tag",         label: "Badge Text",      placeholder: "Schools & Nurseries",                         rows: 1 },
                    { key: "home_schools_title",        label: "Slide Title",    placeholder: "We Come to You",                              rows: 1 },
                    { key: "home_schools_description",  label: "Description",   placeholder: "Little Netstars delivers tailored sessions…",    rows: 3 },
                    { key: "home_schools_ages",         label: "Age Group",      placeholder: "3–7 years old",                               rows: 1 },
                    { key: "home_schools_length",       label: "Session Length", placeholder: "1 hour",                                      rows: 1 },
                    { key: "home_schools_plans",        label: "Session Plans",  placeholder: "Tailored to your needs",                       rows: 1 },
                    { key: "home_schools_delivery",     label: "Delivery",       placeholder: "Schools & nurseries",                          rows: 1 },
                    { key: "home_schools_cta",          label: "Button Text",    placeholder: "Find Out More",                                rows: 1 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"} />
                    </div>
                  ))}
                </div>

                {/* Home Page — How It Works */}
                <div className={sectionCls}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Home Page — How It Works</h3>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={settings.home_howitworks_show !== "false"}
                        onChange={(e) => setSetting("home_howitworks_show", e.target.checked ? "true" : "false")}
                        className="accent-purple-600 w-4 h-4" />
                      Show section
                    </label>
                  </div>
                  {[
                    { key: "home_howitworks_title",    label: "Section Title",    placeholder: "How It Works",                            rows: 1 },
                    { key: "home_howitworks_subtitle", label: "Section Subtitle", placeholder: "Three easy steps to get your child on court", rows: 1 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"} />
                    </div>
                  ))}
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Step {n}</p>
                      {[
                        { key: `home_step${n}_icon`,  label: "Icon (emoji)", placeholder: n === 1 ? "📅" : n === 2 ? "👧" : "✅", rows: 1 },
                        { key: `home_step${n}_title`, label: "Title",        placeholder: n === 1 ? "Choose a Date" : n === 2 ? "Add Your Child" : "Secure Your Session", rows: 1 },
                        { key: `home_step${n}_desc`,  label: "Description",  placeholder: n === 1 ? "Pick from available sessions…" : n === 2 ? "Enter your child's details…" : "Pay securely via card…", rows: 2 },
                      ].map(({ key, label, placeholder, rows }) => (
                        <div key={key}>
                          <label className={labelCls}>{label}</label>
                          <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                            onChange={(e) => setSetting(key, e.target.value)}
                            className={inputCls + " resize-none"} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Home Page — Session Details */}
                <div className={sectionCls}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Home Page — Session Details Bar</h3>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={settings.home_session_show !== "false"}
                        onChange={(e) => setSetting("home_session_show", e.target.checked ? "true" : "false")}
                        className="accent-purple-600 w-4 h-4" />
                      Show section
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Edit Days, Duration &amp; Locations in the Sessions tab.</p>
                </div>

                {/* Home Page — Meet the Coaches */}
                <div className={sectionCls}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Home Page — Meet the Coaches</h3>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={settings.home_coaches_show !== "false"}
                        onChange={(e) => setSetting("home_coaches_show", e.target.checked ? "true" : "false")}
                        className="accent-purple-600 w-4 h-4" />
                      Show section
                    </label>
                  </div>
                  <div>
                    <label className={labelCls}>Coaches Section Text</label>
                    <textarea rows={3} value={settings.coaches_teaser ?? ""} placeholder="Led by Affy Morris…"
                      onChange={(e) => setSetting("coaches_teaser", e.target.value)}
                      className={inputCls + " resize-none"} />
                  </div>
                  <div>
                    <label className={labelCls}>Coach Photo (Home Page)</label>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        title="Click to crop & adjust this photo"
                        onClick={() => openCropModalWithSrc(settings.home_coach_photo || "/Affy.jpg", "home-coach")}
                        className="shrink-0 relative group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={settings.home_coach_photo || "/Affy.jpg"}
                          alt="Home coach"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-transparent group-hover:border-purple-500 transition-all"
                        />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                          ✂️ Crop
                        </span>
                      </button>
                      <div className="flex-1 space-y-2">
                        <input ref={homeCoachPhotoRef} type="file" accept="image/*"
                          onChange={async (e) => { const file = e.target.files?.[0]; if (file) await openCropModal(file, "home-coach"); }}
                          className="text-sm text-slate-500 dark:text-slate-400 w-full" />
                        <p className="text-xs text-slate-400">
                          Click the photo to crop &amp; adjust it, or upload a new one.
                          {settings.home_coach_photo ? " Using your custom photo." : " Currently showing the default Affy photo — click it to crop."}
                        </p>
                        {settings.home_coach_photo && (
                          <button onClick={() => setSetting("home_coach_photo", "")} className="text-xs text-red-500 hover:text-red-700">
                            Remove custom — revert to default
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Page — Monthly Plans */}
                <div className={sectionCls}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Home Page — Monthly Plans</h3>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={settings.home_plans_show !== "false"}
                        onChange={(e) => setSetting("home_plans_show", e.target.checked ? "true" : "false")}
                        className="accent-purple-600 w-4 h-4" />
                      Show section
                    </label>
                  </div>
                  {[
                    { key: "home_plans_title",    label: "Section Title",    placeholder: "Subscribe & Save",                                        rows: 1 },
                    { key: "home_plans_subtitle", label: "Section Subtitle", placeholder: "Secure all weekend sessions for the month at a discounted rate", rows: 1 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"} />
                    </div>
                  ))}
                  <p className="text-xs text-slate-400">Edit plan prices in the Sessions tab.</p>
                </div>

                {/* Home Page — CTA Banner */}
                <div className={sectionCls}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Home Page — CTA Banner</h3>
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={settings.home_cta_show !== "false"}
                        onChange={(e) => setSetting("home_cta_show", e.target.checked ? "true" : "false")}
                        className="accent-purple-600 w-4 h-4" />
                      Show section
                    </label>
                  </div>
                  {[
                    { key: "home_cta_title",  label: "Heading",      placeholder: "Ready to start their netball journey?",                              rows: 1 },
                    { key: "cta_text",        label: "Description",  placeholder: "Your child's first session is on us — no card needed…",              rows: 2 },
                    { key: "home_cta_button", label: "Button Text",  placeholder: "Book Free Session",                                                   rows: 1 },
                    { key: "home_cta_note",   label: "Small Print",  placeholder: "One free session per email address. Free cancellation up to 48 hours…", rows: 2 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"} />
                    </div>
                  ))}
                </div>

                {/* About Page */}
                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">About Page</h3>
                  <p className="text-xs text-slate-400">If a coach is saved in the Coaches tab, that overrides the fields below.</p>

                  {/* Founder Photo */}
                  <div>
                    <label className={labelCls}>Founder Photo (Affy)</label>
                    <div className="flex items-center gap-4">
                      {settings.about_hero_photo && (
                        <button
                          type="button"
                          title="Click to edit photo"
                          onClick={() => openCropModalWithSrc(settings.about_hero_photo, "founder")}
                          className="shrink-0 relative group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.about_hero_photo}
                            alt="Founder"
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-transparent group-hover:border-purple-500 transition-all"
                          />
                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                            Edit
                          </span>
                        </button>
                      )}
                      <div className="flex-1 space-y-2">
                        <input
                          ref={founderPhotoRef}
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) await openCropModal(file, "founder");
                          }}
                          className="text-sm text-slate-500 dark:text-slate-400 w-full"
                        />
                        <p className="text-xs text-slate-400">
                          Selecting a photo opens the crop &amp; adjust editor before saving.
                          {settings.about_hero_photo ? " Current photo shown above." : " No photo uploaded yet."}
                        </p>
                        {settings.about_hero_photo && (
                          <button
                            onClick={() => setSetting("about_hero_photo", "")}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {[
                    { key: "about_hero_title",    label: "Founder Name",        placeholder: "Affy Morris", rows: 1 },
                    { key: "about_hero_subtitle",  label: "Founder Subtitle",    placeholder: "Former Jamaican International · UK Netball Superleague", rows: 1 },
                    { key: "about_bio_1",          label: "Bio Paragraph 1",     placeholder: "Affy is a former Jamaican netball player…", rows: 3 },
                    { key: "about_bio_2",          label: "Bio Paragraph 2",     placeholder: "She represented Jamaica at Under-21 level…", rows: 3 },
                    { key: "about_bio_3",          label: "Bio Paragraph 3",     placeholder: "Affy went on to play in the UK's Netball Superleague…", rows: 3 },
                    { key: "about_bio_4",          label: "Bio Paragraph 4",     placeholder: "With a background that spans…", rows: 3 },
                    { key: "about_bio_5",          label: "Bio Paragraph 5",     placeholder: "She is now dedicated to coaching…", rows: 3 },
                    { key: "about_cta",            label: "About CTA Text",      placeholder: "Book a session with Affy", rows: 1 },
                    { key: "highlight_1_title",    label: "Highlight 1 Title",   placeholder: "Jamaica U21", rows: 1 },
                    { key: "highlight_1_desc",     label: "Highlight 1 Text",    placeholder: "Represented Jamaica at international youth level", rows: 2 },
                    { key: "highlight_2_title",    label: "Highlight 2 Title",   placeholder: "Superleague", rows: 1 },
                    { key: "highlight_2_desc",     label: "Highlight 2 Text",    placeholder: "Competed in the UK Netball Superleague", rows: 2 },
                    { key: "highlight_3_title",    label: "Highlight 3 Title",   placeholder: "Founder", rows: 1 },
                    { key: "highlight_3_desc",     label: "Highlight 3 Text",    placeholder: "Created LittleNetStars to coach the next generation", rows: 2 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"}
                      />
                    </div>
                  ))}
                </div>

                {/* Gallery & Subscriptions pages */}
                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Gallery Page</h3>
                  {[
                    { key: "gallery_title",    label: "Page Title", placeholder: "Gallery", rows: 1 },
                    { key: "gallery_subtitle", label: "Subtitle",   placeholder: "Moments from the court", rows: 1 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"}
                      />
                    </div>
                  ))}
                </div>

                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Subscriptions Page</h3>
                  {[
                    { key: "subs_hero_title",    label: "Page Hero Title",    placeholder: "Weekend Subscription Plans", rows: 1 },
                    { key: "subs_hero_subtitle", label: "Page Hero Subtitle", placeholder: "Lock in your child's weekend sessions…", rows: 2 },
                  ].map(({ key, label, placeholder, rows }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <textarea rows={rows} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSetting(key, e.target.value)}
                        className={inputCls + " resize-none"}
                      />
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveSettings} disabled={settingsSaving}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                  {settingsSaved ? "Saved ✓" : settingsSaving ? "Saving…" : "Save All Changes"}
                </button>
              </div>
            )}

            {/* ── GALLERY ── */}
            {tab === "gallery" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gallery</h2>
                {galleryMsg && <p className="text-sm text-green-600 dark:text-green-400">{galleryMsg}</p>}

                {/* Hidden file input — triggered by the styled button below */}
                <input
                  ref={galleryFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // reset immediately so the same file can be picked again
                    e.target.value = "";
                    await openCropModal(file, "gallery-new");
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Upload photo — big styled button */}
                  <div className={sectionCls + " flex flex-col items-center justify-center text-center"}>
                    <div className="text-3xl mb-2">📷</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Upload Photo</h3>
                    <p className="text-xs text-slate-400 mb-4">Choose a photo from your device — the crop &amp; adjust editor opens next.</p>
                    <button
                      type="button"
                      onClick={() => galleryFileRef.current?.click()}
                      className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Choose Photo
                    </button>
                  </div>

                  {/* Add by URL */}
                  <div className={sectionCls}>
                    <div className="text-3xl mb-2">🔗</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Add by URL</h3>
                    <p className="text-xs text-slate-400 mb-3">Paste any public image link.</p>
                    <form onSubmit={handleAddByUrl} className="space-y-2">
                      <input type="url" required placeholder="https://..." value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)} className={inputCls} />
                      <input type="text" placeholder="Caption (optional)" value={imgCaption}
                        onChange={(e) => setImgCaption(e.target.value)} className={inputCls} />
                      <button type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        Add Image
                      </button>
                    </form>
                  </div>

                  {/* Add video */}
                  <div className={sectionCls}>
                    <div className="text-3xl mb-2">🎬</div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Add Video</h3>
                    <p className="text-xs text-slate-400 mb-3">Paste a YouTube or Vimeo link.</p>
                    <form onSubmit={handleAddVideo} className="space-y-2">
                      <input type="url" required placeholder="https://youtube.com/watch?v=..." value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)} className={inputCls} />
                      <input type="text" placeholder="Caption (optional)" value={videoCaption}
                        onChange={(e) => setVideoCaption(e.target.value)} className={inputCls} />
                      <button type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                        Add Video
                      </button>
                    </form>
                  </div>
                </div>

                {/* Media grid */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    Uploaded Media ({images.length})
                  </h3>
                  {images.length === 0 ? (
                    <p className="text-slate-400 text-sm">No items yet. Upload a photo or add a video above.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {images.map((img) => (
                        <div key={img._id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                          {/* Media preview */}
                          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 relative">
                            {img.mediaType === "video" ? (
                              <>
                                <iframe
                                  src={img.imageUrl}
                                  className="w-full h-full"
                                  allow="autoplay; encrypted-media"
                                  allowFullScreen
                                />
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full font-bold pointer-events-none">
                                  VIDEO
                                </div>
                              </>
                            ) : (
                              <button
                                type="button"
                                title="Click to edit photo"
                                onClick={() => openCropModalWithSrc(img.imageUrl, `gallery-replace:${img._id}` as CropState["target"])}
                                className="w-full h-full relative group"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                  ✂️ Edit
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Controls */}
                          <div className="p-2 space-y-2">
                            {/* Caption */}
                            <input
                              defaultValue={img.caption}
                              placeholder="Add caption…"
                              onBlur={(e) => { if (e.target.value !== img.caption) handleUpdateCaption(img._id, e.target.value); }}
                              className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-400"
                            />

                            {/* Crop & Adjust (images only) */}
                            {img.mediaType !== "video" && (
                              <label className="flex items-center justify-center gap-1.5 w-full text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium py-1.5 rounded-lg transition-colors cursor-pointer">
                                ✂️ Crop &amp; Adjust
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) await openCropModal(file, `gallery-replace:${img._id}` as CropState["target"]);
                                  }}
                                />
                              </label>
                            )}

                            {/* Replace (original file-only fallback kept hidden for video) */}
                            {img.mediaType !== "video" && replacingImageId === img._id ? (
                              <div className="space-y-1">
                                <input ref={replaceFileRef} type="file" accept="image/*"
                                  className="text-xs text-slate-500 w-full" />
                                <div className="flex gap-1">
                                  <button
                                    onClick={async () => {
                                      if (!token || !replaceFileRef.current?.files?.[0]) return;
                                      try {
                                        const dataUri = await fileToDataUri(replaceFileRef.current.files[0]);
                                        const updated = await updateGalleryImage(token, img._id, { imageUrl: dataUri });
                                        setImages((p) => p.map((i) => i._id === img._id ? updated : i));
                                        setReplacingImageId(null);
                                        if (replaceFileRef.current) replaceFileRef.current.value = "";
                                        setGalleryMsg("Image replaced.");
                                      } catch { setGalleryMsg("Replace failed."); }
                                    }}
                                    className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 text-white py-1 rounded-md font-semibold"
                                  >Save</button>
                                  <button onClick={() => setReplacingImageId(null)}
                                    className="text-xs px-2 py-1 text-slate-400 hover:text-slate-600 rounded-md">Cancel</button>
                                </div>
                              </div>
                            ) : null}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteImage(img._id)}
                              className="w-full text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold py-1.5 rounded-lg transition-colors"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── COACHES ── */}
            {tab === "coaches" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coaches</h2>

                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4 text-sm text-purple-800 dark:text-purple-200">
                  <strong>How this works:</strong> Coaches you add here appear on the <strong>About page</strong>. The coach with the lowest order number is shown as the founder/hero with their full photo and bio. Add <strong>Affy Morris</strong> here to show her photo on the site — use order <strong>0</strong> to make her the primary coach.
                </div>

                {coachMsg && <p className="text-sm text-green-600 dark:text-green-400">{coachMsg}</p>}

                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{editingCoach ? "Edit Coach" : "Add New Coach"}</h3>
                  <form onSubmit={handleSaveCoach} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Full Name *</label>
                        <input required placeholder="e.g. Affy Morris" value={coachForm.name}
                          onChange={(e) => setCoachForm((f) => ({ ...f, name: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Title</label>
                        <input placeholder="e.g. Head Coach" value={coachForm.title}
                          onChange={(e) => setCoachForm((f) => ({ ...f, title: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Bio</label>
                      <textarea placeholder="Coach biography…" rows={4} value={coachForm.bio}
                        onChange={(e) => setCoachForm((f) => ({ ...f, bio: e.target.value }))}
                        className={inputCls + " resize-none"}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Photo</label>
                      <div className="flex items-center gap-3">
                        {coachForm.photoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={coachForm.photoUrl} alt="preview" className="w-14 h-14 rounded-full object-cover border-2 border-purple-300 shrink-0" />
                        )}
                        <div className="flex-1 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
                            📷 {coachForm.photoUrl ? "Change photo" : "Upload photo"} (opens editor)
                            <input
                              ref={coachPhotoRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) await openCropModal(file, "coach-new");
                              }}
                            />
                          </label>
                          <input type="text" placeholder="Or paste a photo URL" value={coachForm.photoUrl}
                            onChange={(e) => setCoachForm((f) => ({ ...f, photoUrl: e.target.value }))}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Display Order <span className="font-normal text-slate-400">(0 = first / founder)</span></label>
                      <input type="number" value={coachForm.order} min={0}
                        onChange={(e) => setCoachForm((f) => ({ ...f, order: Number(e.target.value) }))}
                        className={inputCls} style={{ maxWidth: 100 }}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                        {editingCoach ? "Save Changes" : "Add Coach"}
                      </button>
                      {editingCoach && (
                        <button type="button" onClick={() => { setEditingCoach(null); setCoachForm({ name: "", title: "", bio: "", photoUrl: "", order: 0 }); }}
                          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="space-y-3">
                  {coaches.length === 0 && <p className="text-slate-400 text-sm">No coaches yet. Add Affy Morris above to get started.</p>}
                  {coaches.map((coach) => (
                    <div key={coach._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-200 to-yellow-200 dark:from-purple-800 dark:to-yellow-900 flex items-center justify-center text-sm font-bold text-purple-600 overflow-hidden">
                            {coach.photoUrl ? (
                              <button
                                type="button"
                                title="Click to edit photo"
                                onClick={() => openCropModalWithSrc(coach.photoUrl, `coach-quick:${coach._id}` as CropState["target"])}
                                className="w-full h-full relative group"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={coach.photoUrl} alt={coach.name} className="w-full h-full object-cover" />
                                <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                                  Edit
                                </span>
                              </button>
                            ) : (
                              coach.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">{coach.name}</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">{coach.title}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{coach.bio}</p>
                          <p className="text-xs text-slate-300 dark:text-slate-600 mt-0.5">Display order: {coach.order}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button onClick={() => startEditCoach(coach)}
                            className="text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold px-3 py-1.5 rounded-lg">
                            Edit Details
                          </button>
                          <button onClick={() => handleDeleteCoach(coach._id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium text-right">
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Photo upload / crop section — always visible */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          📷 {coach.photoUrl ? "Change Photo" : "Upload Photo"} for {coach.name.split(" ")[0]}
                        </p>
                        {quickPhotoCoachId === coach._id ? (
                          <div className="space-y-2">
                            <input
                              ref={quickPhotoRef}
                              type="file"
                              accept="image/*"
                              className="text-sm text-slate-500 dark:text-slate-400 w-full"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) await openCropModal(file, `coach-quick:${coach._id}` as CropState["target"]);
                              }}
                            />
                            <button
                              onClick={() => setQuickPhotoCoachId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setQuickPhotoCoachId(coach._id)}
                            className="w-full text-xs border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-purple-400 dark:hover:border-purple-500 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 py-2 rounded-lg transition-colors font-medium"
                          >
                            {coach.photoUrl ? "🔄 Replace Photo" : "📤 Upload Photo"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── KIT ── */}
            {tab === "kit" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kit</h2>
                <p className="text-xs text-slate-400">Add kit items that appear on the Kit page. Upload a photo, set a name, description, and price.</p>

                {kitMsg && <p className="text-sm text-green-600 dark:text-green-400">{kitMsg}</p>}

                {/* Form */}
                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{editingKit ? "Edit Item" : "Add New Item"}</h3>
                  <form onSubmit={handleSaveKit} className="space-y-4">

                    {/* Photo */}
                    <div>
                      <label className={labelCls}>Photo</label>
                      <div className="flex items-center gap-4">
                        {kitForm.photoUrl ? (
                          <button type="button" onClick={() => openCropModalWithSrc(kitForm.photoUrl, "kit-new")}
                            className="shrink-0 relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={kitForm.photoUrl} alt="preview" className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">Edit</span>
                          </button>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl shrink-0">👕</div>
                        )}
                        <div className="flex-1 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline">
                            📷 {kitForm.photoUrl ? "Change photo" : "Upload photo"} (opens editor)
                            <input ref={kitPhotoRef} type="file" accept="image/*" className="hidden"
                              onChange={async (e) => { const f = e.target.files?.[0]; if (f) await openCropModal(f, "kit-new"); }} />
                          </label>
                          {kitForm.photoUrl && (
                            <button type="button" onClick={() => setKitForm((f) => ({ ...f, photoUrl: "" }))}
                              className="text-xs text-red-500 hover:text-red-700">Remove photo</button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Item Name *</label>
                        <input required placeholder="e.g. Training Bib" value={kitForm.name}
                          onChange={(e) => setKitForm((f) => ({ ...f, name: e.target.value }))}
                          className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Price (£)</label>
                        <input type="number" min={0} step={0.01} placeholder="0.00"
                          value={kitForm.price > 0 ? (kitForm.price / 100).toFixed(2) : ""}
                          onChange={(e) => setKitForm((f) => ({ ...f, price: Math.round(Number(e.target.value) * 100) }))}
                          className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Description</label>
                      <textarea rows={3} placeholder="Describe this kit item…" value={kitForm.description}
                        onChange={(e) => setKitForm((f) => ({ ...f, description: e.target.value }))}
                        className={inputCls + " resize-none"} />
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <label className={labelCls}>Display Order</label>
                        <input type="number" min={0} value={kitForm.order}
                          onChange={(e) => setKitForm((f) => ({ ...f, order: Number(e.target.value) }))}
                          className={inputCls} style={{ maxWidth: 100 }} />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer mt-5">
                        <input type="checkbox" checked={kitForm.available}
                          onChange={(e) => setKitForm((f) => ({ ...f, available: e.target.checked }))}
                          className="accent-purple-600 w-4 h-4" />
                        Available (shown on site)
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button type="submit"
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                        {editingKit ? "Save Changes" : "Add Item"}
                      </button>
                      {editingKit && (
                        <button type="button"
                          onClick={() => { setEditingKit(null); setKitForm({ name: "", description: "", price: 0, photoUrl: "", available: true, order: 0 }); }}
                          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Items list */}
                <div className="space-y-3">
                  {kitItems.length === 0 && <p className="text-slate-400 text-sm">No kit items yet. Add your first item above.</p>}
                  {kitItems.map((item) => (
                    <div key={item._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        {/* Photo */}
                        <button type="button" title="Click to edit photo"
                          onClick={() => item.photoUrl
                            ? openCropModalWithSrc(item.photoUrl, `kit-quick:${item._id}` as CropState["target"])
                            : setKitMsg("Edit the item to upload a photo.")
                          }
                          className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative group">
                          {item.photoUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">Edit</span>
                            </>
                          ) : (
                            <span className="text-2xl">👕</span>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                            {!item.available && (
                              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full">Hidden</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-purple-600 dark:text-purple-400">£{(item.price / 100).toFixed(2)}</p>
                          {item.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>}
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0 items-end">
                          <button onClick={() => startEditKit(item)}
                            className="text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold px-3 py-1.5 rounded-lg">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteKit(item._id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium">
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Quick photo upload */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <label className="flex items-center justify-center gap-1.5 w-full text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium py-1.5 rounded-lg transition-colors cursor-pointer">
                          📷 {item.photoUrl ? "Replace Photo" : "Upload Photo"} (opens editor)
                          <input type="file" accept="image/*" className="hidden"
                            onChange={async (e) => { const f = e.target.files?.[0]; if (f) await openCropModal(f, `kit-quick:${item._id}` as CropState["target"]); }} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ready Time Setting */}
                <div className={sectionCls}>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Order Ready Time</h3>
                  <p className="text-xs text-slate-400 mb-3">This message appears in the order confirmation email sent to customers.</p>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className={labelCls}>Ready in…</label>
                      <input
                        type="text"
                        placeholder="approximately 2 weeks"
                        value={settings.kit_ready_time ?? ""}
                        onChange={(e) => setSetting("kit_ready_time", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <button onClick={handleSaveSettings} disabled={settingsSaving}
                      className="shrink-0 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                      {settingsSaved ? "Saved ✓" : settingsSaving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>

                {/* Kit Orders */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Kit Orders <span className="text-base font-normal text-slate-400 ml-1">({kitOrders.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Orders placed by customers on the Kit page.</p>

                  {kitOrders.length === 0 && (
                    <p className="text-slate-400 text-sm">No orders yet.</p>
                  )}

                  <div className="space-y-3">
                    {kitOrders.map((order) => {
                      const statusColour =
                        order.status === "collected" ? "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                        : order.status === "ready"    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        :                               "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500";
                      return (
                        <div key={order._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            {order.itemPhoto && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={order.itemPhoto} alt={order.itemName} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-900 dark:text-white">{order.itemName}</span>
                                {order.size && <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">Size {order.size}</span>}
                                {order.quantity > 1 && <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">×{order.quantity}</span>}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${statusColour}`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{order.customer.name} · {order.customer.email}</p>
                              {order.customer.phone && <p className="text-xs text-slate-400">{order.customer.phone}</p>}
                              {order.notes && <p className="text-xs text-slate-400 mt-1 italic">&ldquo;{order.notes}&rdquo;</p>}
                              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1.5 shrink-0 items-end">
                              <select
                                value={order.status}
                                onChange={async (e) => {
                                  if (!token) return;
                                  const updated = await updateKitOrder(token, order._id, { status: e.target.value as KitOrderRecord["status"] });
                                  setKitOrders((p) => p.map((o) => o._id === order._id ? updated : o));
                                }}
                                className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="ready">Ready</option>
                                <option value="collected">Collected</option>
                              </select>
                              <button
                                onClick={async () => {
                                  if (!token || !confirm("Delete this order?")) return;
                                  await deleteKitOrder(token, order._id);
                                  setKitOrders((p) => p.filter((o) => o._id !== order._id));
                                }}
                                className="text-xs text-red-400 hover:text-red-600 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── SUBSCRIPTIONS ── */}
            {tab === "subscriptions" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subscriptions</h2>
                <p className="text-xs text-slate-400">Monthly subscribers. Manage billing via Stripe dashboard.</p>
                <div className="flex gap-4 text-sm">
                  {["active","cancelled","past_due","pending"].map((s) => {
                    const count = subscriptions.filter((x) => x.status === s).length;
                    return (
                      <div key={s} className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 shadow-sm text-center">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
                        <p className="text-xs text-slate-400 capitalize">{s.replace("_"," ")}</p>
                      </div>
                    );
                  })}
                </div>
                {subscriptions.length === 0 && <p className="text-slate-400 text-sm">No subscriptions yet.</p>}
                {subscriptions.map((sub) => (
                  <div key={sub._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-white">{sub.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            sub.status === "active"    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : sub.status === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : sub.status === "past_due"  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {sub.status.replace("_"," ")}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                            {sub.plan === "both" ? "Weekend" : "Friday"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{sub.email}</p>
                        {sub.currentPeriodEnd && (
                          <p className="text-xs text-slate-400 mt-1">
                            Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                        <p className="text-xs text-slate-400">
                          Joined: {new Date(sub.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ── CROP & ADJUST MODAL ─────────────────────────────────────────────── */}
      {cropState && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Crop Photo</h3>
                <p className="text-xs text-slate-400 mt-0.5">Click &amp; drag to draw your crop · drag corners to resize</p>
              </div>
              <button onClick={() => { setCropState(null); if (galleryFileRef.current) galleryFileRef.current.value = ""; }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close">×</button>
            </div>

            {/* Interactive crop area */}
            <div className="px-5 pt-4 shrink-0 flex justify-center bg-slate-950">
              <ReactCrop
                crop={ricCrop}
                onChange={(c) => setRicCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                keepSelection
                style={{ maxHeight: 420, maxWidth: "100%" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={cropImgRef}
                  src={cropState.src}
                  alt="crop preview"
                  style={{
                    maxHeight: 420,
                    maxWidth: "100%",
                    display: "block",
                    filter: `brightness(${cropBrightness}%) contrast(${cropContrast}%)`,
                  }}
                />
              </ReactCrop>
            </div>

            {!ricCrop && (
              <p className="text-xs text-center text-purple-400 py-2 bg-slate-950">
                Click and drag on the photo to select what you want to keep
              </p>
            )}

            {/* Controls */}
            <div className="px-5 py-4 space-y-3 shrink-0">
              {/* Brightness */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-16 shrink-0">Brightness</span>
                <input type="range" min={50} max={200} value={cropBrightness}
                  onChange={(e) => setCropBrightness(Number(e.target.value))}
                  className="flex-1 accent-yellow-500" />
                <span className="text-xs text-slate-400 w-10 text-right shrink-0">{cropBrightness}%</span>
              </div>

              {/* Contrast */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-16 shrink-0">Contrast</span>
                <input type="range" min={50} max={200} value={cropContrast}
                  onChange={(e) => setCropContrast(Number(e.target.value))}
                  className="flex-1 accent-blue-500" />
                <span className="text-xs text-slate-400 w-10 text-right shrink-0">{cropContrast}%</span>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setCropState((s) => s ? { ...s, src: s.originalSrc } : s);
                  setRicCrop(undefined);
                  setCompletedCrop(undefined);
                  setCropBrightness(100);
                  setCropContrast(100);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
              >
                Reset
              </button>

              {/* Caption (gallery-new only) */}
              {cropState.target === "gallery-new" && (
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Caption</p>
                  <input
                    type="text"
                    placeholder="Optional caption…"
                    value={cropState.caption}
                    onChange={(e) => setCropState((s) => s ? { ...s, caption: e.target.value } : s)}
                    className={inputCls}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 pb-5 shrink-0">
              <button
                onClick={handleCropApply}
                disabled={cropSaving || !completedCrop || completedCrop.width === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                {cropSaving ? "Saving…" : completedCrop ? "Save Photo" : "Draw a crop first"}
              </button>
              <button
                onClick={() => { setCropState(null); if (galleryFileRef.current) galleryFileRef.current.value = ""; }}
                className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
