import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import {
  verifyAdmin, fetchAllBookings, deleteBooking,
  fetchSettings, saveSettings,
  fetchGallery, addGalleryByUrl, updateGalleryImage, deleteGalleryImage,
  fetchCoaches, addCoach, updateCoach, deleteCoach,
  fetchSubscriptions,
  type GalleryImage, type Coach, type BookingRecord, type SubscriptionRecord,
} from "@/lib/adminApi";

type Tab = "bookings" | "sessions" | "content" | "gallery" | "coaches" | "subscriptions";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "bookings",      label: "Bookings",      icon: "📋" },
  { id: "sessions",      label: "Sessions",       icon: "📅" },
  { id: "content",       label: "Content",        icon: "✏️" },
  { id: "gallery",       label: "Gallery",        icon: "🖼️" },
  { id: "coaches",       label: "Coaches",        icon: "👤" },
  { id: "subscriptions", label: "Subscriptions",  icon: "⭐" },
];

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("bookings");
  const [ready, setReady] = useState(false);

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
  const [galleryFileCaption, setGalleryFileCaption] = useState("");

  // Coaches
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachForm, setCoachForm] = useState({ name: "", title: "", bio: "", photoUrl: "", order: 0 });
  const [editingCoach, setEditingCoach] = useState<string | null>(null);
  const [coachMsg, setCoachMsg] = useState("");
  const coachPhotoRef = useRef<HTMLInputElement>(null);

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);

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
  }, [token]);

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  // ── Settings ─────────────────────────────────────────────────────
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

  // ── Gallery ──────────────────────────────────────────────────────
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

  async function handleGalleryFileUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !galleryFileRef.current?.files?.[0]) return;
    setGalleryUploading(true);
    try {
      const dataUri = await fileToDataUri(galleryFileRef.current.files[0]);
      const img = await addGalleryByUrl(token, dataUri, galleryFileCaption, images.length);
      setImages((p) => [...p, img]);
      setGalleryFileCaption("");
      if (galleryFileRef.current) galleryFileRef.current.value = "";
      setGalleryMsg("Image uploaded.");
    } catch { setGalleryMsg("Upload failed."); }
    setGalleryUploading(false);
  }

  async function handleDeleteImage(id: string) {
    if (!token || !confirm("Delete this image?")) return;
    await deleteGalleryImage(token, id);
    setImages((p) => p.filter((i) => i._id !== id));
  }

  async function handleUpdateCaption(id: string, caption: string) {
    if (!token) return;
    const updated = await updateGalleryImage(token, id, { caption });
    setImages((p) => p.map((i) => i._id === id ? updated : i));
  }

  // ── Coaches ──────────────────────────────────────────────────────
  async function handleCoachPhotoUpload() {
    if (!coachPhotoRef.current?.files?.[0]) return;
    const dataUri = await fileToDataUri(coachPhotoRef.current.files[0]);
    setCoachForm((f) => ({ ...f, photoUrl: dataUri }));
    if (coachPhotoRef.current) coachPhotoRef.current.value = "";
  }

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

  if (!ready) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Loading…</p>
    </div>
  );

  const paid = bookings.filter((b) => b.status === "paid" && !b.isFreeSession);
  const free = bookings.filter((b) => b.isFreeSession);
  const revenue = paid.reduce((sum, b) => sum + (b.amountPaid ?? 0), 0);
  const activeSubs = subscriptions.filter((s) => s.status === "active").length;

  // ── Input helpers ────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
  const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
  const sectionCls = "bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm space-y-4";

  return (
    <>
      <Head><title>Admin – LittleNetStars</title></Head>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900">

        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
            LittleNet<span className="text-yellow-500">Stars</span>
            <span className="text-slate-400 font-normal text-sm ml-2">Admin</span>
          </span>
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

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-48 shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen pt-6">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full text-left px-5 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${
                  tab === t.id
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-r-2 border-purple-600"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 max-w-4xl">

            {/* ── BOOKINGS ── */}
            {tab === "bookings" && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Bookings</h2>
                {bookings.length === 0 && <p className="text-slate-400 text-sm">No bookings yet.</p>}
                {bookings.map((b) => (
                  <div key={b._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-white">{b.parent.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            b.isFreeSession ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : b.status === "paid" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {b.isFreeSession ? "Free" : b.status === "paid" ? `Paid £${((b.amountPaid ?? 0) / 100).toFixed(2)}` : "Pending"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{b.parent.email} · {b.parent.phone}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                          📍 {b.location} · 📅 {new Date(b.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · ⏰ {b.time}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          👧 {b.children.map((c) => `${c.name} (${c.age})`).join(", ")}
                        </p>
                      </div>
                      <button onClick={async () => {
                        if (!token || !confirm("Delete this booking?")) return;
                        await deleteBooking(token, b._id);
                        setBookings((p) => p.filter((x) => x._id !== b._id));
                      }} className="text-xs text-red-400 hover:text-red-600 shrink-0">Delete</button>
                    </div>
                  </div>
                ))}
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
                    <input type="text" value={settings.duration ?? "45 Minutes"}
                      onChange={(e) => setSetting("duration", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Monthly Subscription Prices</h3>
                  <div>
                    <label className={labelCls}>Saturday Plan Price (£/month)</label>
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
                    <label className={labelCls}>Saturday Plan Name</label>
                    <input type="text" value={settings.plan_saturday_name ?? "Saturday Sessions"}
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

                {/* Homepage */}
                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Homepage</h3>
                  {[
                    { key: "hero_title",       label: "Main Title",         placeholder: "LittleNetStars",                    rows: 1 },
                    { key: "hero_subtitle",    label: "Tagline",             placeholder: "Building Confidence Through Netball", rows: 1 },
                    { key: "hero_description", label: "Hero Description",    placeholder: "Fun, structured netball training…",   rows: 2 },
                    { key: "coaches_teaser",   label: "Coaches Section Text",placeholder: "Led by Affy Morris…",                rows: 3 },
                    { key: "cta_text",         label: "CTA Description",     placeholder: "Your child's first session is on us…",rows: 2 },
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

                {/* About Page */}
                <div className={sectionCls}>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">About Page</h3>
                  <p className="text-xs text-slate-400">If a coach is saved in the Coaches tab with a bio, that overrides the fields below.</p>
                  {[
                    { key: "about_hero_title",   label: "Founder Name",        placeholder: "Affy Morris", rows: 1 },
                    { key: "about_hero_subtitle", label: "Founder Subtitle",    placeholder: "Former Jamaican International · UK Netball Superleague", rows: 1 },
                    { key: "about_bio_1",         label: "Bio Paragraph 1",     placeholder: "Affy is a former Jamaican netball player…", rows: 3 },
                    { key: "about_bio_2",         label: "Bio Paragraph 2",     placeholder: "She represented Jamaica at Under-21 level…", rows: 3 },
                    { key: "about_bio_3",         label: "Bio Paragraph 3",     placeholder: "Affy went on to play in the UK's Netball Superleague…", rows: 3 },
                    { key: "about_bio_4",         label: "Bio Paragraph 4",     placeholder: "With a background that spans…", rows: 3 },
                    { key: "about_bio_5",         label: "Bio Paragraph 5",     placeholder: "She is now dedicated to coaching…", rows: 3 },
                    { key: "about_cta",           label: "About CTA Text",      placeholder: "Book a session with Affy", rows: 1 },
                    { key: "highlight_1_title",   label: "Highlight 1 Title",   placeholder: "Jamaica U21", rows: 1 },
                    { key: "highlight_1_desc",    label: "Highlight 1 Text",    placeholder: "Represented Jamaica at international youth level", rows: 2 },
                    { key: "highlight_2_title",   label: "Highlight 2 Title",   placeholder: "Superleague", rows: 1 },
                    { key: "highlight_2_desc",    label: "Highlight 2 Text",    placeholder: "Competed in the UK Netball Superleague", rows: 2 },
                    { key: "highlight_3_title",   label: "Highlight 3 Title",   placeholder: "Founder", rows: 1 },
                    { key: "highlight_3_desc",    label: "Highlight 3 Text",    placeholder: "Created LittleNetStars to coach the next generation", rows: 2 },
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
                    { key: "gallery_title",    label: "Page Title",    placeholder: "Gallery", rows: 1 },
                    { key: "gallery_subtitle", label: "Subtitle",      placeholder: "Moments from the court", rows: 1 },
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
                    { key: "subs_hero_title",    label: "Page Hero Title",   placeholder: "Weekend Subscription Plans", rows: 1 },
                    { key: "subs_hero_subtitle", label: "Page Hero Subtitle",placeholder: "Lock in your child's weekend sessions…", rows: 2 },
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
                <p className="text-xs text-slate-400">Images you add here appear on the public gallery page immediately.</p>
                {galleryMsg && <p className="text-sm text-green-600 dark:text-green-400">{galleryMsg}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload file */}
                  <div className={sectionCls}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Upload Image File</h3>
                    <p className="text-xs text-slate-400 mb-3">Select an image from your device. It will be stored and displayed on the website.</p>
                    <form onSubmit={handleGalleryFileUpload} className="space-y-2">
                      <input ref={galleryFileRef} type="file" accept="image/*" required
                        className="text-sm text-slate-500 dark:text-slate-400 w-full" />
                      <input type="text" placeholder="Caption (optional)" value={galleryFileCaption}
                        onChange={(e) => setGalleryFileCaption(e.target.value)}
                        className={inputCls}
                      />
                      <button type="submit" disabled={galleryUploading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold py-2 rounded-lg">
                        {galleryUploading ? "Uploading…" : "Upload Image"}
                      </button>
                    </form>
                  </div>

                  {/* Add by URL */}
                  <div className={sectionCls}>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Add by URL</h3>
                    <p className="text-xs text-slate-400 mb-3">Paste a publicly accessible image URL.</p>
                    <form onSubmit={handleAddByUrl} className="space-y-2">
                      <input type="url" required placeholder="https://..." value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        className={inputCls}
                      />
                      <input type="text" placeholder="Caption (optional)" value={imgCaption}
                        onChange={(e) => setImgCaption(e.target.value)}
                        className={inputCls}
                      />
                      <button type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg">
                        Add Image
                      </button>
                    </form>
                  </div>
                </div>

                {/* Image grid */}
                {images.length === 0 ? (
                  <p className="text-slate-400 text-sm">No images yet. Upload one above.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img) => (
                      <div key={img._id} className="relative group bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden aspect-[4/3]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.imageUrl} alt={img.caption} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <input defaultValue={img.caption}
                            onBlur={(e) => { if (e.target.value !== img.caption) handleUpdateCaption(img._id, e.target.value); }}
                            className="w-full text-xs text-white bg-white/20 rounded px-2 py-1 text-center focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button onClick={() => handleDeleteImage(img._id)}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── COACHES ── */}
            {tab === "coaches" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coaches</h2>
                <p className="text-xs text-slate-400">Coaches added here appear on the About page. The first coach (lowest order number) is shown as the founder/hero.</p>
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
                          <img src={coachForm.photoUrl} alt="preview" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                        )}
                        <div className="flex-1 space-y-2">
                          <input ref={coachPhotoRef} type="file" accept="image/*"
                            onChange={handleCoachPhotoUpload}
                            className="text-sm text-slate-500 dark:text-slate-400 w-full"
                          />
                          <input type="text" placeholder="Or paste a photo URL" value={coachForm.photoUrl}
                            onChange={(e) => setCoachForm((f) => ({ ...f, photoUrl: e.target.value }))}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className={labelCls}>Display Order <span className="font-normal text-slate-400">(0 = first / founder)</span></label>
                        <input type="number" value={coachForm.order} min={0}
                          onChange={(e) => setCoachForm((f) => ({ ...f, order: Number(e.target.value) }))}
                          className={inputCls} style={{ maxWidth: 100 }}
                        />
                      </div>
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
                  {coaches.length === 0 && <p className="text-slate-400 text-sm">No coaches yet. Add one above.</p>}
                  {coaches.map((coach) => (
                    <div key={coach._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-yellow-200 dark:from-purple-800 dark:to-yellow-900 flex items-center justify-center shrink-0 text-sm font-bold text-purple-600 overflow-hidden">
                        {coach.photoUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={coach.photoUrl} alt={coach.name} className="w-full h-full object-cover" />
                          : coach.name.split(" ").map((n) => n[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{coach.name}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">{coach.title}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{coach.bio}</p>
                        <p className="text-xs text-slate-300 dark:text-slate-600 mt-0.5">Order: {coach.order}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => startEditCoach(coach)} className="text-xs text-purple-600 hover:text-purple-800 font-medium">Edit</button>
                        <button onClick={() => handleDeleteCoach(coach._id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </div>
                    </div>
                  ))}
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
                            {sub.plan === "both" ? "Weekend" : "Saturday"}
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
    </>
  );
}
