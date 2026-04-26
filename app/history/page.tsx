"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";
import BackToGameButton from "@/src/components/BackToGameButton";

type Round = {
  id: string;
  created_at: string;
  animal: string;
  won: boolean;
  guess_count: number;
  final_guess: string | null;
  guesses: string[] | null;
  hints: string[] | null;
};

export default function HistoryPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("rounds")
        .select("id,created_at,animal,won,guess_count,final_guess,guesses,hints")
        .order("created_at", { ascending: false })
        .limit(50);
      setRounds((data as Round[]) ?? []);
    };
    load();
  }, []);

  return (
    <main className="mx-auto mt-16 max-w-2xl text-[var(--foreground)]">
      <BackToGameButton />
      <h1 className="mb-4 text-2xl font-bold">History</h1>
      <div className="space-y-2">
        {rounds.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setExpandedId((prev) => (prev === r.id ? null : r.id))}
            className="w-full rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-left"
          >
            <p>{new Date(r.created_at).toLocaleString()}</p>
            <p>Result: {r.won ? "Win" : "Loss"}</p>
            <p>Animal: {r.animal}</p>
            <p>Guesses: {r.guess_count}</p>
            <p>Final Guess: {r.final_guess ?? "N/A"}</p>

            {expandedId === r.id && (
              <div className="mt-2 space-y-1 border-t border-[var(--border)] pt-2 text-sm">
                <p>
                  Guess List:{" "}
                  {r.guesses && r.guesses.length > 0
                    ? r.guesses.join(", ")
                    : "None"}
                </p>
                <p>
                  Hint List:{" "}
                  {r.hints && r.hints.length > 0 ? r.hints.join(" | ") : "None"}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>
    </main>
  );
}
