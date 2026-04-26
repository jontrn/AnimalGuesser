import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function normalizeAnimal(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .join(" ")
    .trim();
}

async function getRecentAnimals(
  url: string,
  serviceRoleKey: string,
  limit = 50,
) {
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("rounds")
    .select("animal")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data
    .map((row) => normalizeAnimal(String(row.animal ?? "")))
    .filter(Boolean);
}

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error:
          "Server configuration error: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  if (!groqKey) {
    return NextResponse.json(
      {
        error: "Server configuration error: missing GROQ_API_KEY.",
      },
      { status: 500 },
    );
  }

  const recentAnimals = await getRecentAnimals(supabaseUrl, serviceRoleKey, 50);
  const banned = new Set(recentAnimals);
  const bannedListText = recentAnimals.length > 0 ? recentAnimals.join(", ") : "none";

  for (let attempt = 0; attempt < 3; attempt++) {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 1,
      messages: [
        {
          role: "system",
          content:
            "Return exactly one random, simple animal in lowercase. Prefer one word. No punctuation. No explanation.",
        },
        {
          role: "user",
          content: `Give me a random, simple animal (preferably one word). It cannot be in this list: ${bannedListText}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const animal = normalizeAnimal(raw);

    if (!animal) continue;
    if (banned.has(animal)) continue;

    return NextResponse.json({ animal });
  }

  return NextResponse.json(
    { error: "Failed to generate a non-recent animal." },
    { status: 500 },
  );
}
