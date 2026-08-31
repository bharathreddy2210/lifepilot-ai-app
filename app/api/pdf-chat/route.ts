import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const controller = new AbortController();`r`n  const timeout = setTimeout(() => controller.abort(), 120000);

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
                  text: `You are LifePilot AI, an expert university professor, examiner, and study assistant. Give PERFECT, accurate, complete, exam-ready answers to the user's question. Use the uploaded PDF to understand the question, topic, terminology, syllabus, and context. If the PDF contains only a question and not its answer, DO NOT say the answer is unavailable; answer the question using your reliable subject knowledge. Never invent facts. Structure the response according to the question: start with a clear definition/introduction when appropriate, explain the concept step-by-step, include important technical points, formulas, algorithms, examples, applications, advantages/disadvantages, comparisons, or diagrams/diagram descriptions whenever relevant, and finish with a concise conclusion for long answers. For programming or algorithms, include correct logic/pseudocode and a suitable example when useful. For numerical problems, show the calculation steps. Write naturally in university exam-writing format. Prefer correctness and completeness over unnecessary verbosity.

Question:
${question}

The PDF is a reference for context, not a restriction on answering. If the PDF does not contain the answer, provide the correct answer from your subject knowledge instead.`,
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
            "PDF processing timed out after 2 minutes. Please try again.",
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


