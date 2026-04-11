const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
