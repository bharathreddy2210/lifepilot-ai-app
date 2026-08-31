"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAgentPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = message.trim();

    if (!text || loading) return;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
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
          `Server returned invalid response (${response.status}).`
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
          content:
            data.answer || "No answer received.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `❌ ${error.message}`
              : "❌ Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto flex max-w-3xl flex-col">

        <h1 className="text-3xl font-bold">
          🤖 LifePilot AI
        </h1>

        <p className="mt-2 text-slate-400">
          Your personal productivity assistant
        </p>

        <div className="mt-6 min-h-[500px] rounded-2xl border border-slate-800 bg-slate-900 p-5">

          {messages.length === 0 && (
            <div className="flex min-h-[400px] items-center justify-center text-center text-slate-500">
              <div>
                <div className="text-5xl">🤖</div>
                <p className="mt-4">
                  Ask LifePilot anything about productivity,
                  study, planning, or time management.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
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
                  {item.role === "user"
                    ? "You"
                    : "LifePilot AI"}
                </div>

                <div className="whitespace-pre-wrap">
                  {item.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="mr-8 rounded-xl bg-slate-800 p-4">
                <span className="animate-pulse">
                  LifePilot AI is thinking...
                </span>
              </div>
            )}
          </div>

        </div>

        <div className="mt-4 flex gap-3">

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            disabled={loading}
            placeholder="Ask LifePilot AI..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>

        </div>

      </div>
    </main>
  );
}