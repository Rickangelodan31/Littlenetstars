import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { adminLogin } from "@/lib/adminApi";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await adminLogin(email, password);
      localStorage.setItem("adminToken", token);
      router.push("/admin");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login – LittleNetStars</title>
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
              LittleNet<span className="text-yellow-500">Stars</span>
            </span>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="admin@littlenetstars.co.uk"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
