"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function PDFChatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQuestion() {
    if (!file || !question.trim() || loading) return;

    const currentQuestion = question.trim();

    setQuestion("");
    setError("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: currentQuestion,
      },
    ]);

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("question", currentQuestion);

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

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.answer || "No answer received.",
        },
      ]);
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
          Upload a PDF and ask questions about it.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 p-6 text-center hover:border-blue-500">

            <div className="text-5xl">📄</div>

            <h2 className="mt-3 text-xl font-semibold">
              {file ? "PDF Selected" : "Upload your PDF"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {file ? file.name : "Click here to select a PDF file"}
            </p>

            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];

                if (!selectedFile) return;

                if (selectedFile.type !== "application/pdf") {
                  setFile(null);
                  setMessages([]);
                  setError("Please select a PDF file.");
                  return;
                }

                setFile(selectedFile);
                setMessages([]);
                setError("");
              }}
            />
          </label>

          {file && (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="font-medium">
                📎 {file.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            💬 Chat with your PDF
          </h2>

          <div className="mt-4 min-h-80 space-y-4 rounded-xl bg-slate-950 p-4">

            {messages.length === 0 && (
              <div className="flex min-h-64 items-center justify-center text-center text-slate-500">
                <div>
                  <div className="text-4xl">🤖</div>
                  <p className="mt-3">
                    {file
                      ? "Ask a question about your PDF."
                      : "Upload a PDF first."}
                  </p>
                </div>
              </div>
            )}

            {messages.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl p-4 ${
                  item.role === "user"
                    ? "ml-8 bg-blue-600"
                    : "mr-8 bg-slate-800"
                }`}
              >
                <div className="mb-1 text-xs font-semibold text-slate-300">
                  {item.role === "user" ? "You" : "LifePilot AI"}
                </div>

                <div className="whitespace-pre-wrap leading-7">
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="mr-8 rounded-xl bg-slate-800 p-4">
                <span className="animate-pulse">
                  🤖 LifePilot AI is thinking...
                </span>
              </div>
            )}

          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
              ❌ {error}
            </div>
          )}

          <div className="mt-4 flex gap-3">

            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  askQuestion();
                }
              }}
              disabled={!file || loading}
              placeholder={
                file
                  ? "Ask something about your PDF..."
                  : "Upload a PDF first"
              }
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
            />

            <button
              onClick={askQuestion}
              disabled={!file || !question.trim() || loading}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "..." : "Ask"}
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}
