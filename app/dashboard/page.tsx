"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = {
  id: number;
  title: string;
  completed: boolean;
};

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Item[]>([]);
  const [goals, setGoals] = useState<Item[]>([]);
  const [task, setTask] = useState("");
  const [goal, setGoal] = useState("");
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    setUserName(
      user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User"
    );

    const { data: taskData, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, completed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (taskError) {
      setErrorMessage(
        "Tasks error: " + taskError.message
      );
    } else {
      setTasks(taskData || []);
    }

    const { data: goalData, error: goalError } = await supabase
      .from("goals")
      .select("id, title, completed")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (goalError) {
      setErrorMessage(
        (current) =>
          current
            ? current + "\nGoals error: " + goalError.message
            : "Goals error: " + goalError.message
      );
    } else {
      setGoals(goalData || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function addTask() {
    if (!task.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: task.trim(),
        completed: false,
      })
      .select("id, title, completed")
      .single();

    if (error) {
      setErrorMessage("Add task error: " + error.message);
      return;
    }

    if (data) {
      setTasks((current) => [...current, data]);
    }

    setTask("");
  }

  async function addGoal() {
    if (!goal.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: goal.trim(),
        completed: false,
      })
      .select("id, title, completed")
      .single();

    if (error) {
      setErrorMessage("Add goal error: " + error.message);
      return;
    }

    if (data) {
      setGoals((current) => [...current, data]);
    }

    setGoal("");
  }

  async function toggleTask(item: Item) {
    const { error } = await supabase
      .from("tasks")
      .update({
        completed: !item.completed,
      })
      .eq("id", item.id)
      .eq(
        "user_id",
        (await supabase.auth.getUser()).data.user?.id
      );

    if (error) {
      setErrorMessage("Update task error: " + error.message);
      return;
    }

    setTasks((current) =>
      current.map((t) =>
        t.id === item.id
          ? { ...t, completed: !t.completed }
          : t
      )
    );
  }

  async function toggleGoal(item: Item) {
    const { error } = await supabase
      .from("goals")
      .update({
        completed: !item.completed,
      })
      .eq("id", item.id)
      .eq(
        "user_id",
        (await supabase.auth.getUser()).data.user?.id
      );

    if (error) {
      setErrorMessage("Update goal error: " + error.message);
      return;
    }

    setGoals((current) =>
      current.map((g) =>
        g.id === item.id
          ? { ...g, completed: !g.completed }
          : g
      )
    );
  }

  async function deleteTask(id: number) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage("Delete task error: " + error.message);
      return;
    }

    setTasks((current) =>
      current.filter((t) => t.id !== id)
    );
  }

  async function deleteGoal(id: number) {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage("Delete goal error: " + error.message);
      return;
    }

    setGoals((current) =>
      current.filter((g) => g.id !== id)
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-xl">
          Loading LifePilot...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">

        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              LifePilot Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Welcome, {userName} 👋
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {errorMessage && (
          <div className="mb-6 whitespace-pre-wrap rounded-xl border border-red-500 bg-red-950 p-4 text-red-200">
            <p className="font-bold">
              Database Error
            </p>

            <p className="mt-2 text-sm">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">

          {/* TASKS */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-2xl font-bold">
              📝 My Tasks
            </h2>

            <div className="mt-5 flex gap-3">

              <input
                value={task}
                onChange={(e) =>
                  setTask(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask();
                  }
                }}
                placeholder="Add a task..."
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <button
                onClick={addTask}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
              >
                Add
              </button>

            </div>

            <div className="mt-5 space-y-3">

              {tasks.length === 0 && (
                <p className="text-slate-500">
                  No tasks yet.
                </p>
              )}

              {tasks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
                >

                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() =>
                      toggleTask(item)
                    }
                    className="h-5 w-5"
                  />

                  <span
                    className={`flex-1 ${
                      item.completed
                        ? "line-through text-slate-500"
                        : ""
                    }`}
                  >
                    {item.title}
                  </span>

                  <button
                    onClick={() =>
                      deleteTask(item.id)
                    }
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>

          </section>

          {/* GOALS */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-2xl font-bold">
              🎯 My Goals
            </h2>

            <div className="mt-5 flex gap-3">

              <input
                value={goal}
                onChange={(e) =>
                  setGoal(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addGoal();
                  }
                }}
                placeholder="Add a goal..."
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-yellow-500"
              />

              <button
                onClick={addGoal}
                className="rounded-xl bg-yellow-600 px-5 py-3 font-semibold hover:bg-yellow-700"
              >
                Add
              </button>

            </div>

            <div className="mt-5 space-y-3">

              {goals.length === 0 && (
                <p className="text-slate-500">
                  No goals yet.
                </p>
              )}

              {goals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
                >

                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() =>
                      toggleGoal(item)
                    }
                    className="h-5 w-5"
                  />

                  <span
                    className={`flex-1 ${
                      item.completed
                        ? "line-through text-slate-500"
                        : ""
                    }`}
                  >
                    {item.title}
                  </span>

                  <button
                    onClick={() =>
                      deleteGoal(item.id)
                    }
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>

          </section>

        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">
            🤖 AI Assistant
          </h2>

          <p className="mt-2 text-slate-400">
            Ask LifePilot AI for productivity help.
          </p>

          <button
            onClick={() => router.push("/ai-agent")}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            Open AI Assistant
          </button>
        </section>

      </div>
    </main>
  );
}