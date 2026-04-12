const BASE_URL = "";

export type BookingPayload = {
  location: string;
  date: string;
  time: string;
  children: { name: string; age: string }[];
  parent: { name: string; email: string; phone: string };
};

export type BookingData = {
  _id: string;
  location: string;
  date: string;
  time: string;
  children: { name: string; age: number }[];
  parent: { name: string; email: string; phone: string };
  isFreeSession?: boolean;
};

export async function checkFreeEligible(email: string): Promise<{ eligible: boolean }> {
  try {
    const res = await fetch(`${BASE_URL}/api/bookings/check-free?email=${encodeURIComponent(email)}`);
    if (!res.ok) return { eligible: false };
    return res.json();
  } catch {
    return { eligible: false };
  }
}

export async function createBooking(payload: BookingPayload): Promise<{ bookingId: string; isFreeSession: boolean }> {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create booking");
  }
  return res.json();
}

export async function createCheckoutSession(bookingId: string): Promise<{ url: string }> {
  const res = await fetch(`${BASE_URL}/api/payments/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create checkout session");
  }
  return res.json();
}

export async function fetchBooking(bookingId: string): Promise<BookingData> {
  const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch booking");
  }
  return res.json();
}

export async function verifyPayment(sessionId: string): Promise<{
  paid: boolean;
  booking: BookingData;
}> {
  const res = await fetch(`${BASE_URL}/api/payments/verify?session_id=${sessionId}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to verify payment");
  }
  return res.json();
}
