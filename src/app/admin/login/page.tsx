"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <div className="mb-6 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded bg-amber-500 text-xl font-black text-slate-900">
            AP
          </span>
          <h1 className="mt-3 text-xl font-bold">AP Auto Parts Admin</h1>
          <p className="text-sm text-slate-500">Sign in to manage your business</p>
        </div>
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 py-2.5 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
