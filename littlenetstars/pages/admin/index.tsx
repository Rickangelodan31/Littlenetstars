import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import {
  verifyAdmin,
  fetchGallery,
  addGalleryByUrl,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  fetchCoaches,
  addCoach,
  updateCoach,
  deleteCoach,
  type GalleryImage,
  type Coach,
} from "@/lib/adminApi";

type Tab = "gallery" | "coaches";

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("gallery");
  const [ready, setReady] = useState(false);

  // Gallery state
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imgUrl, setImgUrl] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [imgOrder, setImgOrder] = useState(0);
  const [uploadCaption, setUploadCaption] = useState("");
  const [galleryMsg, setGalleryMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Coach state
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [coachForm, setCoachForm] = useState({ name: "", title: "", bio: "", photoUrl: "", order: 0 });
  const [coachMsg, setCoachMsg] = useState("");
  const [editingCoach, setEditingCoach] = useState<string | null>(null);

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
    fetchGallery(token).then(setImages).catch(console.error);
    fetchCoaches(token).then(setCoaches).catch(console.error);
  }, [token]);

  function logout() {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  }

  // ── Gallery handlers ─────────────────────────────────────────────
  async function handleAddByUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      const img = await addGalleryByUrl(token, imgUrl, imgCaption, imgOrder);
      setImages((prev) => [...prev, img]);
      setImgUrl(""); setImgCaption(""); setImgOrder(0);
      setGalleryMsg("Image added.");
    } catch { setGalleryMsg("Failed to add image."); }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !fileRef.current?.files?.[0]) return;
    try {
      const img = await uploadGalleryImage(token, fileRef.current.files[0], uploadCaption);
      setImages((prev) => [...prev, img]);
      setUploadCaption(""); if (fileRef.current) fileRef.current.value = "";
      setGalleryMsg("Image uploaded.");
    } catch { setGalleryMsg("Upload failed."); }
  }

  async function handleDeleteImage(id: string) {
    if (!token || !confirm("Delete this image?")) return;
    try {
      await deleteGalleryImage(token, id);
      setImages((prev) => prev.filter((i) => i._id !== id));
    } catch { setGalleryMsg("Delete failed."); }
  }

  async function handleUpdateCaption(id: string, caption: string) {
    if (!token) return;
    try {
      const updated = await updateGalleryImage(token, id, { caption });
      setImages((prev) => prev.map((i) => (i._id === id ? updated : i)));
    } catch { setGalleryMsg("Update failed."); }
  }

  // ── Coach handlers ───────────────────────────────────────────────
  async function handleSaveCoach(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingCoach) {
        const updated = await updateCoach(token, editingCoach, coachForm);
        setCoaches((prev) => prev.map((c) => (c._id === editingCoach ? updated : c)));
        setEditingCoach(null);
        setCoachMsg("Coach updated.");
      } else {
        const created = await addCoach(token, coachForm);
        setCoaches((prev) => [...prev, created]);
        setCoachMsg("Coach added.");
      }
      setCoachForm({ name: "", title: "", bio: "", photoUrl: "", order: 0 });
    } catch { setCoachMsg("Failed to save coach."); }
  }

  async function handleDeleteCoach(id: string) {
    if (!token || !confirm("Delete this coach?")) return;
    try {
      await deleteCoach(token, id);
      setCoaches((prev) => prev.filter((c) => c._id !== id));
    } catch { setCoachMsg("Delete failed."); }
  }

  function startEditCoach(coach: Coach) {
    setEditingCoach(coach._id);
    setCoachForm({ name: coach.name, title: coach.title, bio: coach.bio, photoUrl: coach.photoUrl, order: coach.order });
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Verifying…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin – LittleNetStars</title>
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
            LittleNet<span className="text-yellow-500">Stars</span>{" "}
            <span className="text-slate-400 font-normal text-sm">Admin</span>
          </span>
          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 px-6 pt-6">
          {(["gallery", "coaches"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <main className="px-6 py-8 max-w-4xl">
          {/* ── GALLERY TAB ── */}
          {tab === "gallery" && (
            <div className="space-y-8">
              {galleryMsg && (
                <p className="text-sm text-green-600 dark:text-green-400">{galleryMsg}</p>
              )}

              {/* Add by URL */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Add image by URL</h2>
                <form onSubmit={handleAddByUrl} className="space-y-3">
                  <input
                    type="url" required placeholder="https://..." value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-3">
                    <input
                      type="text" placeholder="Caption" value={imgCaption}
                      onChange={(e) => setImgCaption(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number" placeholder="Order" value={imgOrder}
                      onChange={(e) => setImgOrder(Number(e.target.value))}
                      className="w-20 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                    Add Image
                  </button>
                </form>
              </section>

              {/* Upload file */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Upload image file</h2>
                <form onSubmit={handleUpload} className="space-y-3">
                  <input ref={fileRef} type="file" accept="image/*" required
                    className="text-sm text-slate-600 dark:text-slate-300"
                  />
                  <input
                    type="text" placeholder="Caption" value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                    Upload
                  </button>
                </form>
              </section>

              {/* Image list */}
              <section className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Current gallery ({images.length})</h2>
                {images.length === 0 && (
                  <p className="text-sm text-slate-400">No images yet.</p>
                )}
                {images.map((img) => (
                  <div key={img._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={img.caption} className="w-16 h-12 object-cover rounded-lg bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <input
                        defaultValue={img.caption}
                        onBlur={(e) => { if (e.target.value !== img.caption) handleUpdateCaption(img._id, e.target.value); }}
                        className="w-full text-sm text-slate-700 dark:text-slate-300 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{img.imageUrl}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(img._id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </section>
            </div>
          )}

          {/* ── COACHES TAB ── */}
          {tab === "coaches" && (
            <div className="space-y-8">
              {coachMsg && (
                <p className="text-sm text-green-600 dark:text-green-400">{coachMsg}</p>
              )}

              {/* Coach form */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  {editingCoach ? "Edit Coach" : "Add Coach"}
                </h2>
                <form onSubmit={handleSaveCoach} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required placeholder="Name" value={coachForm.name}
                      onChange={(e) => setCoachForm((f) => ({ ...f, name: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      placeholder="Title (e.g. Head Coach)" value={coachForm.title}
                      onChange={(e) => setCoachForm((f) => ({ ...f, title: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <textarea
                    placeholder="Bio" rows={3} value={coachForm.bio}
                    onChange={(e) => setCoachForm((f) => ({ ...f, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-3">
                    <input
                      placeholder="Photo URL (optional)" value={coachForm.photoUrl}
                      onChange={(e) => setCoachForm((f) => ({ ...f, photoUrl: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number" placeholder="Order" value={coachForm.order}
                      onChange={(e) => setCoachForm((f) => ({ ...f, order: Number(e.target.value) }))}
                      className="w-20 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                      {editingCoach ? "Save Changes" : "Add Coach"}
                    </button>
                    {editingCoach && (
                      <button type="button" onClick={() => { setEditingCoach(null); setCoachForm({ name: "", title: "", bio: "", photoUrl: "", order: 0 }); }}
                        className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* Coach list */}
              <section className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Coaches ({coaches.length})</h2>
                {coaches.length === 0 && (
                  <p className="text-sm text-slate-400">No coaches yet.</p>
                )}
                {coaches.map((coach) => (
                  <div key={coach._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-yellow-200 dark:from-purple-800 dark:to-yellow-900 flex items-center justify-center shrink-0">
                      {coach.photoUrl
                        ? // eslint-disable-next-line @next/next/no-img-element
                          <img src={coach.photoUrl} alt={coach.name} className="w-12 h-12 rounded-full object-cover" />
                        : <span className="text-sm font-bold text-purple-600">{coach.name.split(" ").map((n) => n[0]).join("")}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{coach.name}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">{coach.title}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{coach.bio}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => startEditCoach(coach)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteCoach(coach._id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
