const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const Coach = require("../models/Coach");
const GalleryImage = require("../models/GalleryImage");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// ── Auth middleware ──────────────────────────────────────────────
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorised" });
  try {
    req.admin = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── File upload (local — swap for Cloudinary in production) ──────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../littlenetstars/public/gallery")),
  filename: (req, file, cb) => cb(null, `upload_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── POST /api/admin/login ────────────────────────────────────────
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
});

// ── GET /api/admin/verify ────────────────────────────────────────
router.get("/verify", requireAdmin, (req, res) => res.json({ ok: true }));

// ═══════════════════════════════
//  COACHES
// ═══════════════════════════════

router.get("/coaches", requireAdmin, async (req, res, next) => {
  try {
    const coaches = await Coach.find().sort("order");
    res.json(coaches);
  } catch (err) { next(err); }
});

router.post("/coaches", requireAdmin, async (req, res, next) => {
  try {
    const { name, title, bio, photoUrl, order } = req.body;
    const coach = await Coach.create({ name, title, bio, photoUrl, order });
    res.status(201).json(coach);
  } catch (err) { next(err); }
});

router.put("/coaches/:id", requireAdmin, async (req, res, next) => {
  try {
    const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coach) return res.status(404).json({ error: "Coach not found" });
    res.json(coach);
  } catch (err) { next(err); }
});

router.delete("/coaches/:id", requireAdmin, async (req, res, next) => {
  try {
    await Coach.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ═══════════════════════════════
//  GALLERY
// ═══════════════════════════════

router.get("/gallery", requireAdmin, async (req, res, next) => {
  try {
    const images = await GalleryImage.find().sort("order");
    res.json(images);
  } catch (err) { next(err); }
});

// Add image by URL
router.post("/gallery", requireAdmin, async (req, res, next) => {
  try {
    const { imageUrl, caption, order } = req.body;
    const image = await GalleryImage.create({ imageUrl, caption, order });
    res.status(201).json(image);
  } catch (err) { next(err); }
});

// Upload image file
router.post("/gallery/upload", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const imageUrl = `/gallery/${req.file.filename}`;
    const image = await GalleryImage.create({ imageUrl, caption: req.body.caption || "", order: 0 });
    res.status(201).json(image);
  } catch (err) { next(err); }
});

router.put("/gallery/:id", requireAdmin, async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!image) return res.status(404).json({ error: "Image not found" });
    res.json(image);
  } catch (err) { next(err); }
});

router.delete("/gallery/:id", requireAdmin, async (req, res, next) => {
  try {
    await GalleryImage.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
