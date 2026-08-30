import { NextResponse } from "next/server";

export async function POST(request: Request) {
try {
const body = await request.json();


const messages = Array.isArray(body?.messages)
  ? body.messages
  : [];

if (messages.length === 0) {
  return NextResponse.json(
    { error: "No messages provided." },
    { status: 400 }
  );
}

const lastMessage = messages[messages.length - 1];

const userMessage =
  typeof lastMessage?.content === "string"
    ? lastMessage.content.trim()
    : "";

if (!userMessage) {
  return NextResponse.json(
    { error: "No message provided." },
    { status: 400 }
  );
}

const conversation = messages
  .map((msg: { role?: string; content?: string }) => {
    const role =
      msg.role === "assistant"
        ? "LifePilot AI"
        : "User";

    return role + ": " + (msg.content ?? "");
  })
  .join("\n\n");

const systemPrompt =
  "You are LifePilot AI, a personal productivity assistant.\n\n" +
  "Help the user with tasks, goals, productivity, planning, studying, " +
  "time management, and general questions.\n\n" +
  "IMPORTANT RULES:\n" +
  "1. Answer the user's actual question.\n" +
  "2. Do not force tasks or goals into unrelated questions.\n" +
  "3. If the user asks a simple question such as What is 2+2, answer it directly.\n" +
  "4. Do not invent tasks, goals, names, or personal information.\n" +
  "5. Be clear and helpful.\n" +
  "6. Use conversation history only when relevant.\n\n" +
  "Conversation:\n" +
  conversation +
  "\n\nCurrent user question:\n" +
  userMessage;

const ollamaResponse = await fetch(
  "http://127.0.0.1:11434/api/generate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      prompt: systemPrompt,
      stream: false,
    }),
  }
);

if (!ollamaResponse.ok) {
  const errorText = await ollamaResponse.text();

  console.error(
    "Ollama error:",
    ollamaResponse.status,
    errorText
  );

  return NextResponse.json(
    {
      error:
        "LifePilot AI could not connect to Ollama.",
    },
    { status: 500 }
  );
}

const data = await ollamaResponse.json();

const answer =
  typeof data?.response === "string"
    ? data.response.trim()
    : "";

if (!answer) {
  return NextResponse.json(
    {
      error: "Ollama returned an empty response.",
    },
    { status: 500 }
  );
}

return NextResponse.json({
  response: answer,
});


} catch (error) {
console.error("Chat API error:", error);


return NextResponse.json(
  {
    error:
      "Server error while processing your LifePilot AI request.",
  },
  { status: 500 }
);


}
}


