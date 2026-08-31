import { NextResponse } from "next/server";

function generateAnswer(message: string): string {
  const text = message.toLowerCase();

  if (
    text.includes("study") ||
    text.includes("exam") ||
    text.includes("learn")
  ) {
    return `Here is a simple study plan:

1. Choose one important topic.
2. Study for 45 minutes.
3. Take a 10-minute break.
4. Practice questions for 30 minutes.
5. Review what you learned for 15 minutes.

Tip: Keep your phone away while studying and focus on one subject at a time.`;
  }

  if (
    text.includes("time") ||
    text.includes("schedule") ||
    text.includes("routine")
  ) {
    return `Try this simple daily routine:

• Morning — Plan your top 3 tasks.
• Morning — Complete your most important task.
• Afternoon — Study or work for 2 focused sessions.
• Evening — Finish smaller tasks.
• Night — Review your progress and plan tomorrow.

Focus on your most important task first.`;
  }

  if (
    text.includes("productivity") ||
    text.includes("productive")
  ) {
    return `Here are 3 simple productivity rules:

1. Pick your top 3 tasks.
2. Work on one task at a time.
3. Use 45 minutes of focused work followed by a short break.

Start with the task that has the biggest impact.`;
  }

  if (
    text.includes("goal") ||
    text.includes("goals")
  ) {
    return `Use this goal method:

1. Write the goal clearly.
2. Set a deadline.
3. Break it into small tasks.
4. Complete one task every day.
5. Review your progress every week.

Small consistent progress is better than trying to do everything at once.`;
  }

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {
    return `Hello! 👋 I'm LifePilot AI.

I can help you with:
• Study planning
• Daily schedules
• Productivity
• Goals
• Time management

What would you like help with?`;
  }

  return `Here's a simple way to approach it:

1. Clearly define what you want to achieve.
2. Break it into smaller tasks.
3. Choose the most important task.
4. Work on it without distractions.
5. Review your progress at the end of the day.

Tell me more about your goal and I can help you create a practical plan.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const answer = generateAnswer(message);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI Assistant error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}