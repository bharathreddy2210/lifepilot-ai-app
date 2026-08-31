"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
};

export default function AIAgentPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    setHistoryLoading(true);

    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Chat history error:", error);
        return;
      }

      setChats((data || []) as Chat[]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function saveChat(
    updatedMessages: Message[],
    chatId: string | null
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const firstUserMessage =
      updatedMessages.find((item) => item.role === "user")?.content ||
      "New Chat";

    const title =
      firstUserMessage.length > 40
        ? `${firstUserMessage.slice(0, 40)}...`
        : firstUserMessage;

    if (chatId) {
      const { error } = await supabase
        .from("chat_history")
        .update({
          messages: updatedMessages,
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", chatId);

      if (error) {
        console.error("Update chat error:", error);
      }
    } else {
      const { data, error } = await supabase
        .from("chat_history")
        .insert({
          user_id: user.id,
          title,
          messages: updatedMessages,
        })
        .select()
        .single();

      if (error) {
        console.error("Create chat error:", error);
        return;
      }

      if (data) {
        setCurrentChatId(data.id);
      }
    }

    await loadChats();
  }

  async function sendMessage() {
    const text = message.trim();

    if (!text || loading) return;

    const updatedMessages = [
      ...messages,
      {
        role: "user" as const,
        content: text,
      },
    ];

    setMessages(updatedMessages);
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

      const finalMessages: Message[] = [
        ...updatedMessages,
        {
          role: "assistant",
          content: data.answer || "No answer received.",
        },
      ];

      setMessages(finalMessages);

      await saveChat(finalMessages, currentChatId);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Something went wrong. Please try again.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    if (loading) return;

    setMessages([]);
    setMessage("");
    setCurrentChatId(null);
  }

  function openChat(chat: Chat) {
    if (loading) return;

    setCurrentChatId(chat.id);
    setMessages(chat.messages || []);
    setMessage("");
  }

  async function deleteChat(chatId: string) {
    if (loading) return;

    const confirmed = window.confirm(
      "Delete this conversation?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("chat_history")
      .delete()
      .eq("id", chatId);

    if (error) {
      console.error("Delete chat error:", error);
      return;
    }

    if (currentChatId === chatId) {
      newChat();
    }

    await loadChats();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto flex max-w-6xl gap-4">

        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:block">

          <button
            onClick={newChat}
            disabled={loading}
            className="mb-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:opacity-50"
          >
            + New Chat
          </button>

          <h2 className="mb-3 text-sm font-semibold text-slate-400">
            CHAT HISTORY
          </h2>

          {historyLoading ? (
            <p className="text-sm text-slate-500">
              Loading chats...
            </p>
          ) : chats.length === 0 ? (
            <p className="text-sm text-slate-500">
              No previous chats.
            </p>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 rounded-xl p-2 transition ${
                    currentChatId === chat.id
                      ? "bg-slate-800"
                      : "hover:bg-slate-800"
                  }`}
                >
                  <button
                    onClick={() => openChat(chat)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate text-sm">
                      {chat.title}
                    </div>
                  </button>

                  <button
                    onClick={() => deleteChat(chat.id)}
                    className="text-xs text-slate-500 hover:text-red-400"
                    title="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main Chat */}
        <section className="flex min-w-0 flex-1 flex-col">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                🤖 LifePilot AI
              </h1>

              <p className="mt-2 text-slate-400">
                Your personal productivity assistant
              </p>
            </div>

            <button
              onClick={newChat}
              disabled={loading || messages.length === 0}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 md:hidden"
            >
              + New
            </button>
          </div>

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

        </section>
      </div>
    </main>
  );
}
