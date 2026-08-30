"use client";

import { useEffect, useState } from "react";

type Message = {
role: "user" | "assistant";
content: string;
};

type Task = {
id: number;
title: string;
completed: boolean;
};

type Goal = {
id: number;
title: string;
completed: boolean;
};

export default function AIAgentPage() {
const [messages, setMessages] = useState<Message[]>([
{
role: "assistant",
content:
"Hello! 👋 I'm LifePilot AI. I can help you with your tasks, goals, productivity, planning, studying, and general questions.",
},
]);

const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);

const [tasks, setTasks] = useState<Task[]>([]);
const [goals, setGoals] = useState<Goal[]>([]);

useEffect(() => {
try {
const savedTasks = localStorage.getItem("lifepilot_tasks");
const savedGoals = localStorage.getItem("lifepilot_goals");


  if (savedTasks) {
    setTasks(JSON.parse(savedTasks));
  }

  if (savedGoals) {
    setGoals(JSON.parse(savedGoals));
  }
} catch (error) {
  console.error("Could not load dashboard data:", error);
}


}, []);

async function sendMessage(customMessage?: string) {
const text = (customMessage ?? input).trim();


if (!text || loading) {
  return;
}

const userMessage: Message = {
  role: "user",
  content: text,
};

const updatedMessages = [...messages, userMessage];

setMessages(updatedMessages);
setInput("");
setLoading(true);

try {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: updatedMessages,
      tasks,
      goals,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error || "Server returned an invalid response."
    );
  }

  const assistantText =
    typeof data?.response === "string"
      ? data.response
      : "I couldn't generate a response.";

  setMessages((currentMessages) => [
    ...currentMessages,
    {
      role: "assistant",
      content: assistantText,
    },
  ]);
} catch (error) {
  console.error("AI request error:", error);

  setMessages((currentMessages) => [
    ...currentMessages,
    {
      role: "assistant",
      content:
        error instanceof Error
          ? "❌ " + error.message
          : "❌ Something went wrong.",
    },
  ]);
} finally {
  setLoading(false);
}


}

function clearChat() {
setMessages([
{
role: "assistant",
content:
"Chat cleared. 👋 What would you like help with?",
},
]);
}

const completedTasks = tasks.filter(
(task) => task.completed
).length;

const completedGoals = goals.filter(
(goal) => goal.completed
).length;

return ( <main className="min-h-screen bg-slate-950 px-4 py-6 text-white"> <div className="mx-auto max-w-5xl">


    {/* Header */}

    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h1 className="text-3xl font-bold">
          🤖 LifePilot AI
        </h1>

        <p className="mt-1 text-slate-400">
          Your personal AI productivity assistant
        </p>
      </div>

      <a
        href="/dashboard"
        className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-center text-sm hover:border-blue-500"
      >
        ← Back to Dashboard
      </a>

    </header>

    {/* Current Data */}

    <section className="mb-6 grid gap-4 sm:grid-cols-4">

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">
          Tasks
        </p>

        <p className="mt-1 text-2xl font-bold">
          {tasks.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">
          Completed
        </p>

        <p className="mt-1 text-2xl font-bold text-green-400">
          {completedTasks}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">
          Goals
        </p>

        <p className="mt-1 text-2xl font-bold text-yellow-400">
          {goals.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">
          Goals Done
        </p>

        <p className="mt-1 text-2xl font-bold text-blue-400">
          {completedGoals}
        </p>
      </div>

    </section>

    {/* Chat */}

    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

      <div className="min-h-[450px] space-y-4 p-6">

        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >

            <div
              className={
                message.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-blue-600 px-5 py-3"
                  : "max-w-[85%] rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3"
              }
            >

              <p className="mb-1 text-xs font-semibold opacity-60">
                {message.role === "user"
                  ? "You"
                  : "LifePilot AI"}
              </p>

              <p className="whitespace-pre-wrap leading-7">
                {message.content}
              </p>

            </div>

          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-slate-400">
              LifePilot AI is thinking... 🤔
            </div>
          </div>
        )}

      </div>

      {/* Input */}

      <div className="border-t border-slate-800 p-4">

        <div className="flex gap-3">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask LifePilot AI anything..."
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : "Send 🚀"}
          </button>

        </div>

        <button
          onClick={clearChat}
          className="mt-3 text-sm text-slate-500 hover:text-red-400"
        >
          🗑️ Clear Chat
        </button>

      </div>

    </section>

  </div>
</main>


);
}

