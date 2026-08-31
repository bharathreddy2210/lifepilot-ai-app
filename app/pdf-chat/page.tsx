"use client";

import { useState } from "react";

export default function PDFChatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file || loading) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pdf-chat", {
        method: "POST",
        body: formData,
      });

      const rawText = await response.text();

      let data: {
        answer?: string;
        error?: string;
      };

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed (${response.status}).`
        );
      }

      setAnswer(data.answer || "No summary was returned.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold">
          📄 LifePilot PDF Chat
        </h1>

        <p className="mt-2 text-slate-400">
          Upload a PDF and let LifePilot AI read it.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">

          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 p-8 text-center transition hover:border-blue-500">

            <div className="text-5xl">📄</div>

            <h2 className="mt-4 text-xl font-semibold">
              Upload your PDF
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Click here to select a PDF file
            </p>

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];

                if (!selectedFile) return;

                if (selectedFile.type !== "application/pdf") {
                  setFile(null);
                  setError("❌ Please select a PDF file.");
                  setAnswer("");
                  return;
                }

                setFile(selectedFile);
                setError("");
                setAnswer("");
              }}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="font-medium">
                📎 {file.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "🤖 AI is reading your PDF..." : "🚀 Analyze PDF"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-center text-sm text-red-300">
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-6">
              <h2 className="text-xl font-semibold">
                🤖 AI Summary
              </h2>

              <div className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">
                {answer}
              </div>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
