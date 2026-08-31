"use client";

import { useState } from "react";

export default function PDFChatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("❌ Please select a PDF file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage(
      `✅ ${selectedFile.name} selected successfully.`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-3xl font-bold">
          📄 LifePilot PDF Chat
        </h1>

        <p className="mt-2 text-slate-400">
          Upload a PDF and ask questions about it.
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
              onChange={handleFileChange}
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
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4 text-center text-sm">
              {message}
            </div>
          )}

        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            💬 Ask about your PDF
          </h2>

          <div className="mt-4 flex gap-3">

            <input
              value=""
              readOnly
              placeholder={
                file
                  ? "PDF processing will be added next..."
                  : "Upload a PDF first"
              }
              disabled={!file}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none disabled:opacity-50"
            />

            <button
              disabled
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold opacity-50"
            >
              Ask
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}
