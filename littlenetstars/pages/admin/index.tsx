import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import {
  verifyAdmin, fetchAllBookings, deleteBooking,
  fetchSettings, saveSettings,
  fetchGallery, addGalleryByUrl, uploadGalleryImage, updateGalleryImage, deleteGalleryImage,
  fetchCoaches, addCoach, updateCoach, deleteCoach,
  type GalleryImage, type Coach, type BookingRecord,
} from "@/lib/adminApi";

type Tab = "bookings" | "sessions" | "content" | "gallery" | "coaches";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "bookings", label: "Bookings", icon: "📋" },
  { id: "sessions", label: "Sessions", icon: "📅" },
  { id: "content", label: "Content", icon: "✏️" },
  { id: "gallery", label: "Gallery", icon: "🖼️" },
  { id: "coaches", label: "Coaches", icon: "👤" },
];

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

  // Gallery
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imgUrl, setImgUrl] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [galleryMsg, setGalleryMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Coaches
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachForm, setCoachForm] = useState({ name: "", title: "", bio: "", photoUrl: "", order: 0 });
  const [editingCoach, setEditingCoach] = useState<string | null>(null);
  const [coachMsg, setCoachMsg] = useState("");

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
  }, [token]);

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  // ── Settings ─────────────────────────────────────────────────────
  async function handleSaveSettings() {
    if (!token) return;
    await saveSettings(token, settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

  // ── Gallery ──────────────────────────────────────────────────────
  async function handleAddByUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const img = await addGalleryByUrl(token, imgUrl, imgCaption, 0);
      setImages((p) => [...p, img]);
      setImgUrl(""); setImgCaption("");
      setGalleryMsg("Image added.");
    } catch { setGalleryMsg("Failed to add image."); }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !fileRef.current?.files?.[0]) return;
    try {
      const img = await uploadGalleryImage(token, fileRef.current.files[0], uploadCaption);
      setImages((p) => [...p, img]);
      setUploadCaption(""); if (fileRef.current) fileRef.current.value = "";
      setGalleryMsg("Image uploaded.");
    } catch { setGalleryMsg("Upload failed."); }
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
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex gap-8">
          {[
            { label: "Total Bookings", value: bookings.length },
            { label: "Paid Sessions", value: paid.length },
            { label: "Free Sessions", value: free.length },
            { label: "Revenue", value: `£${(revenue / 100).toFixed(2)}` },
          ].map((s) => (
            <div key={s.label}>
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
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {b.parent.email} · {b.parent.phone}
                        </p>
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
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Session Price (£)</label>
                    <input type="number" value={Math.round(Number(settings.price ?? 3000) / 100)}
                      onChange={(e) => setSettings((s) => ({ ...s, price: String(Number(e.target.value) * 100) }))}
                      className="w-40 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Session Times (comma separated)</label>
                    <input type="text" value={settings.times ?? "10:00, 14:00"}
                      onChange={(e) => setSettings((s) => ({ ...s, times: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="10:00, 14:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Locations (comma separated)</label>
                    <input type="text" value={settings.locations ?? "London, Manchester"}
                      onChange={(e) => setSettings((s) => ({ ...s, locations: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="London, Manchester"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Session Duration</label>
                    <input type="text" value={settings.duration ?? "30 Minutes"}
                      onChange={(e) => setSettings((s) => ({ ...s, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button onClick={handleSaveSettings}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                    {settingsSaved ? "Saved ✓" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ── CONTENT ── */}
            {tab === "content" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Website Content</h2>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                  <p className="text-xs text-slate-400">Edit the text that appears on your website. Changes save instantly.</p>

                  {[
                    { key: "hero_title", label: "Homepage — Main Heading", placeholder: "LittleNetStars" },
                    { key: "hero_subtitle", label: "Homepage — Tagline", placeholder: "Building Confidence Through Netball" },
                    { key: "hero_description", label: "Homepage — Description", placeholder: "Fun, structured netball training for young players in London & Manchester." },
                    { key: "cta_text", label: "Homepage — CTA Description", placeholder: "Your child's first session is on us — no card needed. After that, it's just £30 per session." },
                    { key: "about_intro", label: "About Page — Bio Intro", placeholder: "Affy is a former Jamaican netball player..." },
                    { key: "coaches_teaser", label: "Homepage — Coaches Section Text", placeholder: "Led by Affy Morris — former Jamaican international..." },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
                      <textarea rows={2} value={settings[key] ?? ""} placeholder={placeholder}
                        onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  ))}

                  <button onClick={handleSaveSettings}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                    {settingsSaved ? "Saved ✓" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ── GALLERY ── */}
            {tab === "gallery" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gallery</h2>
                {galleryMsg && <p className="text-sm text-green-600 dark:text-green-400">{galleryMsg}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Add by URL */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add by URL</h3>
                    <form onSubmit={handleAddByUrl} className="space-y-2">
                      <input type="url" required placeholder="https://..." value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input type="text" placeholder="Caption" value={imgCaption}
                        onChange={(e) => setImgCaption(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg">Add Image</button>
                    </form>
                  </div>

                  {/* Upload */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Upload File</h3>
                    <form onSubmit={handleUpload} className="space-y-2">
                      <input ref={fileRef} type="file" accept="image/*" required className="text-sm text-slate-500 dark:text-slate-400 w-full" />
                      <input type="text" placeholder="Caption" value={uploadCaption}
                        onChange={(e) => setUploadCaption(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg">Upload</button>
                    </form>
                  </div>
                </div>

                {/* Image grid */}
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
              </div>
            )}

            {/* ── COACHES ── */}
            {tab === "coaches" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Coaches</h2>
                {coachMsg && <p className="text-sm text-green-600 dark:text-green-400">{coachMsg}</p>}

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">{editingCoach ? "Edit Coach" : "Add New Coach"}</h3>
                  <form onSubmit={handleSaveCoach} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input required placeholder="Full name" value={coachForm.name}
                        onChange={(e) => setCoachForm((f) => ({ ...f, name: e.target.value }))}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input placeholder="Title (e.g. Head Coach)" value={coachForm.title}
                        onChange={(e) => setCoachForm((f) => ({ ...f, title: e.target.value }))}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <textarea placeholder="Bio" rows={3} value={coachForm.bio}
                      onChange={(e) => setCoachForm((f) => ({ ...f, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input placeholder="Photo URL (optional)" value={coachForm.photoUrl}
                      onChange={(e) => setCoachForm((f) => ({ ...f, photoUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex gap-3">
                      <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                        {editingCoach ? "Save Changes" : "Add Coach"}
                      </button>
                      {editingCoach && (
                        <button type="button" onClick={() => { setEditingCoach(null); setCoachForm({ name: "", title: "", bio: "", photoUrl: "", order: 0 }); }}
                          className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="space-y-3">
                  {coaches.map((coach) => (
                    <div key={coach._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-yellow-200 dark:from-purple-800 dark:to-yellow-900 flex items-center justify-center shrink-0 text-sm font-bold text-purple-600">
                        {coach.photoUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={coach.photoUrl} alt={coach.name} className="w-12 h-12 rounded-full object-cover" />
                          : coach.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{coach.name}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">{coach.title}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{coach.bio}</p>
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
          </main>
        </div>
      </div>
    </>
  );
}
