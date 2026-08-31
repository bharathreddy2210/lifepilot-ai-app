import { NextResponse } from "next/server";

export const runtime = "edge";

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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `Answer this question directly and accurately. Keep the answer concise unless the user asks for detail.

Question:
${message}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 512,
            },
          }),
        }
      );

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        console.error("Gemini error:", data);

        return NextResponse.json(
          {
            error:
              data?.error?.message ||
              `Gemini API error (${response.status})`,
          },
          { status: response.status }
        );
      }

      const answer =
        data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("")
          .trim();

      if (!answer) {
        return NextResponse.json(
          { error: "Gemini returned an empty answer." },
          { status: 502 }
        );
      }

      return NextResponse.json({ answer });
    } catch (error) {
      clearTimeout(timeout);

      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return NextResponse.json(
          {
            error:
              "Gemini is taking too long. Please try again.",
          },
          { status: 504 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
