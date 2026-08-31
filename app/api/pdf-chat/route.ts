import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const question = String(formData.get("question") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF file." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF must be smaller than 10 MB." },
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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
                  inline_data: {
                    mime_type: "application/pdf",
                    data: buffer.toString("base64"),
                  },
                },
                {
                  text: `Answer the user's question using the uploaded PDF as the primary source.

Question:
${question}

If the answer is not available in the PDF, clearly say that the information was not found in the uploaded PDF. Do not invent information.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini PDF error:", data);

      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            `Gemini API error (${response.status})`,
        },
        { status: response.status }
      );
    }

    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return NextResponse.json(
        { error: "Gemini returned an empty answer." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      answer,
      filename: file.name,
    });
  } catch (error) {
    console.error("PDF chat error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error:
            "PDF processing timed out. Please try again with a smaller PDF.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process PDF.",
      },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
