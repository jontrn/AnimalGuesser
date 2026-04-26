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
    <main className="mx-auto w-full max-w-3xl px-4 py-10 text-[var(--foreground)] sm:px-6">
      <BackToGameButton />
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Recent Rounds
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">History</h1>
      </div>
      <div className="space-y-3">
        {rounds.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setExpandedId((prev) => (prev === r.id ? null : r.id))}
            className="w-full rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-[var(--shadow-soft)] transition-colors hover:bg-[var(--surface-strong)]"
          >
            <p className="text-sm text-[var(--muted)]">
              {new Date(r.created_at).toLocaleString()}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <p>Result: {r.won ? "Win" : "Loss"}</p>
              <p>Animal: {r.animal}</p>
              <p>Guesses: {r.guess_count}</p>
              <p>Final Guess: {r.final_guess ?? "N/A"}</p>
            </div>

            {expandedId === r.id && (
              <div className="mt-3 space-y-2 border-t border-[var(--border)] pt-3 text-sm leading-6 text-[var(--foreground-soft)]">
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
