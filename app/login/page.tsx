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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading || googleLoading) return;

    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setMessage("❌ Login failed. No session was created.");
        setLoading(false);
        return;
      }

      setMessage("✅ Login successful! Opening dashboard...");

      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Unable to connect. Please try again."
      );

      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (loading || googleLoading) return;

    setGoogleLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setMessage(`❌ Google login failed: ${error.message}`);
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);

      setMessage(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Google login failed. Please try again."
      );

      setGoogleLoading(false);
    }
  }

  async function handleResetPassword() {
    const userEmail = email.trim();

    if (!userEmail) {
      setMessage("⚠️ Enter your email address first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        userEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage("✅ Password reset email sent. Check your inbox.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Something went wrong."
      );
    } finally {
      setLoading(false);
    }
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
              disabled={loading || googleLoading}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">
                Password
              </label>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading || googleLoading}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
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
              disabled={loading || googleLoading}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <span className="text-sm text-slate-500">
            OR
          </span>

          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white py-3 font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {googleLoading ? (
            "Connecting to Google..."
          ) : (
            <>
              <span className="text-lg">G</span>
              Continue with Google
            </>
          )}
        </button>

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
