// client-side auth helpers (uses httpOnly cookie set by backend)
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export async function signup({ username, email, password }) {
  const res = await fetch(`${BACKEND_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
    credentials: "include",
  });
  return res.json();
}

export async function verifyEmail({ email, otp }) {
  const res = await fetch(`${BACKEND_URL}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
    credentials: "include",
  });
  return res.json();
}

export async function login({ login, password }) {
  const res = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
    credentials: "include",
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${BACKEND_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await fetch(`${BACKEND_URL}/me`, { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user || null;
}
