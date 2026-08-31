"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setMessage("Enter your email address first.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent. Check your inbox.");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

        <div className="mb-8 text-center">
          <div className="text-4xl">🤖</div>

          <h1 className="mt-4 text-3xl font-bold">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-400">
            Login to your AI productivity account.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium">
                Password
              </label>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Login"}
          </button>

        </form>

        {message && (
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-3 text-center text-sm text-slate-300">
            {message}
          </div>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-sm text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          disabled
          className="w-full rounded-xl border border-slate-700 py-3 font-medium text-slate-400"
        >
          Continue with Google
        </button>

        <p className="mt-2 text-center text-xs text-slate-600">
          Google login will be connected later.
        </p>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Create Account
          </Link>
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}
