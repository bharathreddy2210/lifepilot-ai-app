"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
const router = useRouter();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [error, setError] = useState("");

function handleRegister(e: React.FormEvent) {
e.preventDefault();
setError("");


if (password.length < 6) {
  setError("Password must be at least 6 characters.");
  return;
}

if (password !== confirmPassword) {
  setError("Passwords do not match.");
  return;
}

const user = {
  name: name.trim(),
  email: email.trim().toLowerCase(),
  password,
};

localStorage.setItem("lifepilot_user", JSON.stringify(user));
localStorage.setItem("lifepilot_logged_in", "true");

router.push("/dashboard");


}

return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white"> <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">


    <div className="mb-8 text-center">
      <div className="text-5xl">🤖</div>

      <h1 className="mt-4 text-3xl font-bold">
        Create Account
      </h1>

      <p className="mt-2 text-slate-400">
        Start your AI-powered productivity journey.
      </p>
    </div>

    <form onSubmit={handleRegister} className="space-y-5">

      <div>
        <label className="mb-2 block text-sm font-medium">
          Full Name
        </label>

        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

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
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
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
            placeholder="Create a password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Confirm Password
        </label>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
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
        Create Account
      </button>

    </form>

    <p className="mt-6 text-center text-sm text-slate-400">
      Already have an account?{" "}
      <Link
        href="/login"
        className="text-blue-400 hover:text-blue-300"
      >
        Login
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


