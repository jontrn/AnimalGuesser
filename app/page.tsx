"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";

export default function Home() {
  const [guess, setGuess] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [currentAnimal, setCurrentAnimal] = useState("");
  const [gaveUp, setGaveUp] = useState(false);

  const saveRound = async (params: {
    won: boolean;
    finalGuess: string | null;
    guesses: string[];
    hintsUsed: string[];
  }) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    await supabase.from("rounds").insert({
      user_id: user.id,
      animal: currentAnimal,
      won: params.won,
      final_guess: params.finalGuess,
      guess_count: params.guesses.length,
      guesses: params.guesses,
      hints: params.hintsUsed,
      ended_at: new Date().toISOString(),
    });
  };

  const startNextRound = async () => {
    setGuess("");
    setHints([]);
    setWon(false);
    setIsIncorrect(false);
    setIncorrectGuesses([]);
    await loadRandomAnimal();
    setGaveUp(false);
  };

  const giveUp = async () => {
    if (!currentAnimal) return;

    await saveRound({
      won: false,
      finalGuess: null,
      guesses: incorrectGuesses.filter(Boolean),
      hintsUsed: hints,
    });

    setGaveUp(true);
    setIsIncorrect(false);
    setGuess(currentAnimal);
  };

  const submitGuess = async () => {
    if (gaveUp) return;
    if (!guess.trim()) return;

    const res = await fetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guess,
        previousHints: hints,
        animal: currentAnimal,
      }),
    });

    const data = await res.json();

    if (data.correct) {
      const allGuesses = [...incorrectGuesses, guess.trim()].filter(Boolean);
      await saveRound({
        won: true,
        finalGuess: guess.trim(),
        guesses: allGuesses,
        hintsUsed: hints,
      });

      setWon(true);
      setIsIncorrect(false);
    } else {
      setHints((prev) => [...prev, data.hint]);
      setIsIncorrect(true);

      const normalized = guess.trim();
      if (normalized) {
        setIncorrectGuesses((prev) =>
          prev.includes(normalized) ? prev : [...prev, normalized],
        );
      }

      setGuess("");
    }
  };

  const loadRandomAnimal = async () => {
    const res = await fetch("/api/animal", { method: "POST" });
    const data = await res.json();
    setCurrentAnimal(data.animal ?? "");
  };

  useEffect(() => {
    loadRandomAnimal();
  }, []);

  return (
    <main className="relative flex min-h-[calc(100svh-64px)] flex-col justify-between p-6">
      <h1 className="absolute left-1/2 top-6 -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
        AnimalGuesser
      </h1>
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
        {hints.map((hint, i) => (
          <p key={i} className="text-lg">
            {hint}
          </p>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        {won && (
          <p className="text-2xl font-bold text-green-600">
            Correct! Want another round?
          </p>
        )}

        {gaveUp && (
          <p className="text-2xl font-bold text-yellow-400">
            You gave up. The animal was: {currentAnimal}
          </p>
        )}

        <input
          className="w-80 rounded border px-4 py-2 text-center text-[var(--foreground)] placeholder:text-[var(--muted)] transition-colors"
          style={{
            backgroundColor: won
              ? "var(--success-bg)"
              : isIncorrect
                ? "var(--danger-bg)"
                : "var(--input-bg)",
            borderColor: won
              ? "var(--success-border)"
              : isIncorrect
                ? "var(--danger-border)"
                : "var(--input-border)",
          }}
          placeholder="Guess the animal..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitGuess()}
          disabled={won || gaveUp}
        />

        {incorrectGuesses.length > 0 && (
          <div
            className="w-80 rounded border px-3 py-2 text-sm"
            style={{
              backgroundColor: "var(--danger-bg)",
              borderColor: "var(--danger-border)",
              color: "var(--foreground)",
            }}
          >
            Incorrect guesses: {incorrectGuesses.join(", ")}
          </div>
        )}

        {(won || gaveUp) && (
          <button
            type="button"
            onClick={startNextRound}
            className="rounded px-4 py-2 text-[var(--button-fg)] hover:opacity-90"
            style={{ backgroundColor: "var(--button-bg)" }}
          >
            Next Round
          </button>
        )}

        {!won && !gaveUp && (
          <button
            type="button"
            onClick={giveUp}
            className="z-10 mt-2 w-80 rounded px-4 py-2 text-[var(--button-fg)] hover:opacity-90 sm:fixed sm:bottom-6 sm:right-6 sm:mt-0 sm:w-auto"
            style={{ backgroundColor: "#7a2f2f" }}
          >
            Give Up
          </button>
        )}
      </div>
    </main>
  );
}
