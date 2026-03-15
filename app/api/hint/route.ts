import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const ANIMAL = "elephant";

export async function POST(req: Request) {
  const { guess, previousHints = [] } = await req.json();

  if (guess.toLowerCase() === ANIMAL) {
    return NextResponse.json({ correct: true });
  }

  const previousHintText =
    previousHints.length > 0
      ? previousHints.map((h: string) => `- ${h}`).join("\n")
      : "None";

  const prompt = `
You are playing a guessing game.

The animal is: ${ANIMAL}.

Previous hints already given:
${previousHintText}

Give a NEW hint that:
- Does NOT repeat or closely resemble any previous hints
- Does NOT use the word "${ANIMAL}"
- Is ONE sentence
- Does NOT ask a follow-up question
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You generate short, helpful game hints." },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
  });

  const hint = completion.choices[0]?.message?.content?.split("\n")[0]?.trim();

  return NextResponse.json({
    correct: false,
    hint: hint ?? "No hint available.",
  });
}
