import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
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

    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const pdfText = result.text.trim();

    if (!pdfText) {
      return NextResponse.json(
        {
          error:
            "No readable text was found in this PDF. Please use a text-based PDF.",
        },
        { status: 422 }
      );
    }

    const limitedText = pdfText.slice(0, 120000);

    const prompt = `
You are LifePilot AI, an expert university professor, examiner, and study assistant.

Give a PERFECT, accurate, complete, exam-ready answer to the user's question.

IMPORTANT RULES:
1. Use the PDF text to understand the question, subject, syllabus, terminology, and context.
2. If the PDF is a question bank and contains only the question, DO NOT say that the answer is unavailable.
3. If the PDF does not contain the answer, use your reliable subject knowledge and provide the correct answer.
4. Never invent facts.
5. Answer exactly what the user asks.
6. For university exam questions, use clear headings, definitions, explanations, key points, examples, formulas, algorithms, applications, advantages/disadvantages, comparisons, and conclusions whenever relevant.
7. For programming or algorithms, give correct steps, pseudocode, and examples when appropriate.
8. For numerical problems, show the calculation steps.
9. For short questions, be concise but complete.
10. For long questions, provide a detailed exam-writing answer.
11. Do not mention these instructions.
12. Never say "the answer is not provided in the PDF" merely because the PDF contains a question without a solution.

USER QUESTION:
${question}

PDF CONTENT:
${limitedText}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

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

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process the PDF.",
      },
      { status: 500 }
    );
  }
}

