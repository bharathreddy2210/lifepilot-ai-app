"use client";

import { useEffect, useState } from "react";

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

type User = {
name: string;
email: string;
password: string;
};

export default function DashboardPage() {
const [task, setTask] = useState("");
const [tasks, setTasks] = useState<Task[]>([]);

const [goal, setGoal] = useState("");
const [goals, setGoals] = useState<Goal[]>([]);

const [seconds, setSeconds] = useState(25 * 60);
const [timerRunning, setTimerRunning] = useState(false);

const [loaded, setLoaded] = useState(false);
const [user, setUser] = useState<User | null>(null);

// Check login and load user
useEffect(() => {
const loggedIn = localStorage.getItem("lifepilot_logged_in");
const savedUser = localStorage.getItem("lifepilot_user");


if (loggedIn !== "true" || !savedUser) {
  window.location.href = "/login";
  return;
}

try {
  setUser(JSON.parse(savedUser));
} catch {
  localStorage.removeItem("lifepilot_logged_in");
  window.location.href = "/login";
  return;
}

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
  console.error("Could not load saved data:", error);
}

setLoaded(true);


}, []);

// Save tasks
useEffect(() => {
if (!loaded) return;


localStorage.setItem(
  "lifepilot_tasks",
  JSON.stringify(tasks)
);


}, [tasks, loaded]);

// Save goals
useEffect(() => {
if (!loaded) return;


localStorage.setItem(
  "lifepilot_goals",
  JSON.stringify(goals)
);


}, [goals, loaded]);

// Focus timer
useEffect(() => {
if (!timerRunning) {
return;
}


const timer = setInterval(() => {
  setSeconds((currentSeconds) => {
    if (currentSeconds <= 1) {
      setTimerRunning(false);
      return 25 * 60;
    }

    return currentSeconds - 1;
  });
}, 1000);

return () => clearInterval(timer);


}, [timerRunning]);

function addTask() {
const title = task.trim();


if (!title) return;

setTasks((currentTasks) => [
  ...currentTasks,
  {
    id: Date.now(),
    title,
    completed: false,
  },
]);

setTask("");


}

function toggleTask(id: number) {
setTasks((currentTasks) =>
currentTasks.map((item) =>
item.id === id
? {
...item,
completed: !item.completed,
}
: item
)
);
}

function deleteTask(id: number) {
setTasks((currentTasks) =>
currentTasks.filter((item) => item.id !== id)
);
}

function addGoal() {
const title = goal.trim();


if (!title) return;

setGoals((currentGoals) => [
  ...currentGoals,
  {
    id: Date.now(),
    title,
    completed: false,
  },
]);

setGoal("");


}

function toggleGoal(id: number) {
setGoals((currentGoals) =>
currentGoals.map((item) =>
item.id === id
? {
...item,
completed: !item.completed,
}
: item
)
);
}

function deleteGoal(id: number) {
setGoals((currentGoals) =>
currentGoals.filter((item) => item.id !== id)
);
}

function resetTimer() {
setTimerRunning(false);
setSeconds(25 * 60);
}

function formatTime(totalSeconds: number) {
const minutes = Math.floor(totalSeconds / 60);
const remainingSeconds = totalSeconds % 60;


return (
  String(minutes).padStart(2, "0") +
  ":" +
  String(remainingSeconds).padStart(2, "0")
);


}

function clearAllData() {
const confirmed = window.confirm(
"Delete all tasks and goals?"
);


if (!confirmed) return;

setTasks([]);
setGoals([]);

localStorage.removeItem("lifepilot_tasks");
localStorage.removeItem("lifepilot_goals");


}

function logout() {
localStorage.removeItem("lifepilot_logged_in");
window.location.href = "/login";
}

const completedTasks = tasks.filter(
(item) => item.completed
).length;

const completedGoals = goals.filter(
(item) => item.completed
).length;

if (!loaded || !user) {
return ( <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white"> <p className="text-slate-400">
Loading LifePilot... </p> </main>
);
}

return ( <main className="min-h-screen bg-slate-950 p-6 text-white"> <div className="mx-auto max-w-6xl">


    {/* Header */}

    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h1 className="text-3xl font-bold">
          LifePilot Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Your personal productivity command center
        </p>
      </div>

      <div className="flex items-center gap-3">

        <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2">
          <p className="text-xs text-slate-500">
            Welcome
          </p>

          <p className="font-semibold">
            {user.name}
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-xl bg-red-600 px-4 py-3 font-semibold hover:bg-red-700"
        >
          Logout
        </button>

      </div>

    </header>

    {/* Statistics */}

    <section className="grid gap-4 sm:grid-cols-4">

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">
          Total Tasks
        </p>

        <p className="mt-2 text-3xl font-bold">
          {tasks.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">
          Completed Tasks
        </p>

        <p className="mt-2 text-3xl font-bold text-green-400">
          {completedTasks}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">
          Total Goals
        </p>

        <p className="mt-2 text-3xl font-bold text-yellow-400">
          {goals.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <p className="text-sm text-slate-400">
          Completed Goals
        </p>

        <p className="mt-2 text-3xl font-bold text-blue-400">
          {completedGoals}
        </p>
      </div>

    </section>

    {/* Tasks */}

    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-bold">
        📝 Add Task
      </h2>

      <div className="mt-4 flex gap-3">

        <input
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTask();
            }
          }}
          placeholder="Enter a task..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          onClick={addTask}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Add Task
        </button>

      </div>

      <h2 className="mt-8 text-xl font-bold">
        My Tasks
      </h2>

      <div className="mt-4 space-y-3">

        {tasks.length === 0 && (
          <p className="text-slate-500">
            No tasks yet.
          </p>
        )}

        {tasks.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
          >

            <div className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleTask(item.id)}
                className="h-5 w-5"
              />

              <span
                className={
                  item.completed
                    ? "text-slate-500 line-through"
                    : ""
                }
              >
                {item.title}
              </span>

            </div>

            <button
              onClick={() => deleteTask(item.id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </section>

    {/* Goals */}

    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-bold">
        🎯 Goals
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Set goals and track your progress.
      </p>

      <div className="mt-4 flex gap-3">

        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addGoal();
            }
          }}
          placeholder="Enter a goal..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
        />

        <button
          onClick={addGoal}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
        >
          Add Goal
        </button>

      </div>

      <div className="mt-4 space-y-3">

        {goals.length === 0 && (
          <p className="text-slate-500">
            No goals yet.
          </p>
        )}

        {goals.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
          >

            <div className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleGoal(item.id)}
                className="h-5 w-5"
              />

              <span
                className={
                  item.completed
                    ? "text-slate-500 line-through"
                    : ""
                }
              >
                {item.title}
              </span>

            </div>

            <button
              onClick={() => deleteGoal(item.id)}
              className="text-red-400 hover:text-red-300"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </section>

    {/* Focus Timer */}

    <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="text-xl font-bold">
        ⏱️ Focus Timer
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        25-minute productivity session
      </p>

      <div className="my-8 text-center text-7xl font-bold tracking-wider">
        {formatTime(seconds)}
      </div>

      <div className="flex justify-center gap-3">

        <button
          onClick={() => setTimerRunning(!timerRunning)}
          className="rounded-xl bg-green-600 px-6 py-3 font-semibold hover:bg-green-700"
        >
          {timerRunning ? "Pause" : "Start"}
        </button>

        <button
          onClick={resetTimer}
          className="rounded-xl bg-slate-700 px-6 py-3 font-semibold hover:bg-slate-600"
        >
          Reset
        </button>

      </div>

    </section>

    {/* Navigation */}

    <section className="mt-8 grid gap-4 sm:grid-cols-3">

      <a
        href="/ai-agent"
        className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-blue-500"
      >
        <h3 className="font-bold">
          🤖 AI Assistant
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Ask LifePilot AI for help.
        </p>
      </a>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="font-bold">
          📚 Study Planner
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Plan your study sessions.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="font-bold">
          📈 Productivity
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Track your productivity.
        </p>
      </div>

    </section>

    {/* Clear Data */}

    <button
      onClick={clearAllData}
      className="mt-8 w-full rounded-xl border border-red-900 bg-slate-900 p-3 text-red-400 hover:bg-red-950"
    >
      🗑️ Clear All Tasks & Goals
    </button>

  </div>
</main>


);
}

