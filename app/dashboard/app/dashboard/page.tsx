"use client";

import { useState } from "react";

const tasks = [
  { title: "Complete AI project", priority: "High", done: true },
  { title: "Study for examination", priority: "Medium", done: false },
  { title: "Work on presentation", priority: "Medium", done: false },
  { title: "Read research paper", priority: "Low", done: false },
];

const goals = [
  { icon: "💻", title: "Build AI Project", progress: 75 },
  { icon: "📚", title: "Complete Studies", progress: 60 },
  { icon: "🏃", title: "Fitness Routine", progress: 40 },
];

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 p-5 md:block">

        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl">
            🤖
          </div>

          <div>
            <h1 className="font-bold">LifePilot AI</h1>
            <p className="text-xs text-slate-500">AI Productivity</p>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            ["🏠", "Dashboard"],
            ["🤖", "AI Agent"],
            ["✅", "Tasks"],
            ["🎯", "Goals"],
            ["📅", "Schedule"],
            ["📊", "Analytics"],
            ["📄", "Documents"],
          ].map(([icon, name]) => (
            <button
              key={name}
              onClick={() => setActive(name)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left ${
                active === name
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <span>{icon}</span>
              {name}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 space-y-2">
          <button className="flex w-full gap-3 rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900">
            ⚙️ Settings
          </button>

          <button className="flex w-full gap-3 rounded-xl px-4 py-3 text-slate-400 hover:bg-slate-900">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="md:ml-64">

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-slate-800 px-6 py-5 md:px-10">
          <div>
            <p className="text-sm text-slate-500">
              AI Productivity Dashboard
            </p>

            <h2 className="text-2xl font-bold">
              Good afternoon 👋
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
            B
          </div>
        </header>

        <div className="p-6 md:p-10">

          {/* PRODUCTIVITY */}
          <section className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>
                <p className="text-sm font-semibold text-blue-400">
                  TODAY'S PRODUCTIVITY
                </p>

                <h3 className="mt-2 text-3xl font-bold">
                  You're doing great! 🚀
                </h3>

                <p className="mt-2 text-slate-400">
                  Keep your focus and complete your priority tasks.
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400">
                  82%
                </div>

                <p className="text-sm text-slate-500">
                  Productivity Score
                </p>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Stat icon="✅" value="24" title="Tasks Completed" />
            <Stat icon="🎯" value="5" title="Active Goals" />
            <Stat icon="🔥" value="7" title="Day Streak" />
            <Stat icon="⏱️" value="4.5h" title="Focus Time" />

          </section>

          {/* TASKS + AI */}
          <section className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* TASKS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">YOUR DAY</p>
                  <h3 className="text-xl font-bold">Today's Tasks</h3>
                </div>

                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-700">
                  + Add
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.title}
                    className="flex items-center justify-between rounded-xl border border-slate-800 p-4"
                  >
                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          task.done
                            ? "border-green-500 bg-green-500"
                            : "border-slate-600"
                        }`}
                      >
                        {task.done && "✓"}
                      </div>

                      <span
                        className={
                          task.done
                            ? "text-slate-500 line-through"
                            : "text-slate-200"
                        }
                      >
                        {task.title}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500">
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm font-semibold text-blue-400">
                AI ASSISTANT
              </p>

              <h3 className="mt-1 text-xl font-bold">
                🤖 Your AI Recommendation
              </h3>

              <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">

                <p className="leading-7 text-slate-300">
                  You have 2 high-priority tasks remaining today.
                  I recommend focusing on your AI project for the
                  next 60 minutes.
                </p>

                <button className="mt-5 rounded-lg bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700">
                  Start Focus Session
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-slate-800 p-5">
                <p className="text-xs text-slate-500">
                  AI INSIGHT
                </p>

                <p className="mt-2 text-slate-300">
                  Your productivity is 18% higher than last week.
                  Keep maintaining your current routine!
                </p>
              </div>
            </div>
          </section>

          {/* GOALS */}
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">YOUR GOALS</p>
                <h3 className="text-xl font-bold">Active Goals</h3>
              </div>

              <button className="text-sm text-blue-400">
                View all →
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {goals.map((goal) => (
                <div
                  key={goal.title}
                  className="rounded-xl border border-slate-800 p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <h4 className="font-semibold">{goal.title}</h4>
                  </div>

                  <div className="mt-5 flex justify-between text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span>{goal.progress}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

function Stat({
  icon,
  value,
  title,
}: {
  icon: string;
  value: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>

      <p className="mt-4 font-semibold">{title}</p>
    </div>
  );
}