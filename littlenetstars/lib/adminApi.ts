const API = "";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  return data.token as string;
}

export async function verifyAdmin(token: string): Promise<boolean> {
  const res = await fetch(`${API}/api/admin/verify`, { headers: authHeaders(token) });
  return res.ok;
}

// ── Gallery ────────────────────────────────────────────────────────
export interface GalleryImage {
  _id: string;
  imageUrl: string;
  caption: string;
  order: number;
}

export async function fetchGallery(token: string): Promise<GalleryImage[]> {
  const res = await fetch(`${API}/api/admin/gallery`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch gallery");
  return res.json();
}

export async function addGalleryByUrl(token: string, imageUrl: string, caption: string, order: number): Promise<GalleryImage> {
  const res = await fetch(`${API}/api/admin/gallery`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ imageUrl, caption, order }),
  });
  if (!res.ok) throw new Error("Failed to add image");
  return res.json();
}

export async function uploadGalleryImage(token: string, file: File, caption: string): Promise<GalleryImage> {
  const form = new FormData();
  form.append("image", file);
  form.append("caption", caption);
  const res = await fetch(`${API}/api/admin/gallery/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function updateGalleryImage(token: string, id: string, data: Partial<GalleryImage>): Promise<GalleryImage> {
  const res = await fetch(`${API}/api/admin/gallery/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteGalleryImage(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/gallery/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Delete failed");
}

// ── Coaches ────────────────────────────────────────────────────────
export interface Coach {
  _id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  order: number;
}

export async function fetchCoaches(token: string): Promise<Coach[]> {
  const res = await fetch(`${API}/api/admin/coaches`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch coaches");
  return res.json();
}

export async function addCoach(token: string, data: Omit<Coach, "_id">): Promise<Coach> {
  const res = await fetch(`${API}/api/admin/coaches`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add coach");
  return res.json();
}

export async function updateCoach(token: string, id: string, data: Partial<Coach>): Promise<Coach> {
  const res = await fetch(`${API}/api/admin/coaches/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteCoach(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/coaches/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Delete failed");
}

// ── Settings ───────────────────────────────────────────────────────
export async function fetchSettings(token: string): Promise<Record<string, string>> {
  const res = await fetch(`${API}/api/admin/settings`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function saveSettings(token: string, data: Record<string, string>): Promise<void> {
  const res = await fetch(`${API}/api/admin/settings`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save settings");
}

// ── Subscriptions ─────────────────────────────────────────────────
export interface SubscriptionRecord {
  _id: string;
  email: string;
  name: string;
  plan: "saturdays" | "both";
  status: "active" | "cancelled" | "past_due" | "pending";
  currentPeriodEnd?: string;
  createdAt: string;
}

export async function fetchSubscriptions(token: string): Promise<SubscriptionRecord[]> {
  const res = await fetch(`${API}/api/admin/subscriptions`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

// ── Bookings ───────────────────────────────────────────────────────
export interface BookingRecord {
  _id: string;
  location: string;
  date: string;
  time: string;
  children: { name: string; age: number }[];
  parent: { name: string; email: string; phone: string };
  status: "pending_payment" | "paid" | "cancelled" | "refunded";
  isFreeSession: boolean;
  amountPaid?: number;
  createdAt: string;
}

export async function fetchAllBookings(token: string): Promise<BookingRecord[]> {
  const res = await fetch(`${API}/api/admin/bookings`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function deleteBooking(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/bookings?id=${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Delete failed");
}

export async function refundBooking(token: string, bookingId: string): Promise<void> {
  const res = await fetch(`${API}/api/admin/bookings/refund`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Refund failed");
  }
}
