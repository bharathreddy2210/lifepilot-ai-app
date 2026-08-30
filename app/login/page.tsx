
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const savedUser = localStorage.getItem("lifepilot_user");

    if (!savedUser) {
      setError("No account found. Please create an account first.");
      return;
    }

    try {
      const user = JSON.parse(savedUser);

      if (
        email.trim().toLowerCase() !==
          String(user.email).toLowerCase() ||
        password !== user.password
      ) {
        setError("Invalid email or password.");
        return;
      }

      localStorage.setItem("lifepilot_logged_in", "true");

      router.push("/dashboard");
    } catch {
      setError("Unable to read account information.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="text-5xl">🤖</div>

          <h1 className="mt-4 text-3xl font-bold">
            Welcome to LifePilot AI
          </h1>

          <p className="mt-2 text-slate-400">
            Sign in to continue your productivity journey.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

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
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-slate-400 hover:text-white"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950 p-3 text-sm text-red-300">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-700"
            >
              Sign In
            </button>

          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />

            <span className="text-sm text-slate-500">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={() =>
              setError("Google login will be connected in a later step.")
            }
            className="w-full rounded-xl border border-slate-700 py-3 font-medium hover:bg-slate-800"
          >
            Continue with Google
          </button>

        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300"
          >
            Create an account
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


