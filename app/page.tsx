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

  const loadRandomAnimal = async () => {
    const res = await fetch("/api/animal", { method: "POST" });
    const data = await res.json();
    return data.animal ?? "";
  };

  const startNextRound = async () => {
    setGuess("");
    setHints([]);
    setWon(false);
    setIsIncorrect(false);
    setIncorrectGuesses([]);
    setGaveUp(false);
    setCurrentAnimal(await loadRandomAnimal());
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
    if (gaveUp || won) return;
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
      return;
    }

    setHints((prev) => [...prev, data.hint]);
    setIsIncorrect(true);

    const normalized = guess.trim();
    if (normalized) {
      setIncorrectGuesses((prev) =>
        prev.includes(normalized) ? prev : [...prev, normalized],
      );
    }

    setGuess("");
  };

  useEffect(() => {
    const initializeRound = async () => {
      const animal = await loadRandomAnimal();
      setCurrentAnimal(animal);
    };

    void initializeRound();
  }, []);

  return (
    <main className="mx-auto flex min-h-[calc(100svh-89px)] w-full max-w-7xl flex-col px-4 py-6 sm:px-6 sm:py-8">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col rounded-[32px] border border-[var(--border)] bg-[var(--surface)] px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-1 flex-col justify-center text-center">
          <div className="mx-auto flex min-h-[42vh] w-full max-w-3xl flex-col justify-center gap-5">
            {hints.map((hint, i) => (
              <p key={i} className="text-xl leading-9 text-[var(--foreground)] sm:text-3xl">
                {hint}
              </p>
            ))}
          </div>
        </div>

        {won && (
          <p className="mb-4 text-center text-base font-medium text-[var(--foreground)] sm:text-lg">
            Correct! Want another round?
          </p>
        )}

        {gaveUp && (
          <p className="mb-4 text-center text-base font-medium text-[var(--foreground)] sm:text-lg">
            You gave up. The animal was: {currentAnimal}
          </p>
        )}

        <div className="mt-3 w-full border-t border-[var(--border)] pt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-h-14 flex-1 rounded-full border px-5 py-3 text-center text-lg text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition-colors"
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

            {won || gaveUp ? (
              <button
                type="button"
                onClick={startNextRound}
                className="min-h-14 rounded-full px-6 py-3 font-medium text-[var(--button-fg)] transition-opacity hover:opacity-90 sm:min-w-44"
                style={{ backgroundColor: "var(--button-bg)" }}
              >
                Next Round
              </button>
            ) : (
              <button
                type="button"
                onClick={submitGuess}
                className="min-h-14 rounded-full px-6 py-3 font-medium text-[var(--button-fg)] transition-opacity hover:opacity-90 sm:min-w-44"
                style={{ backgroundColor: "var(--button-bg)" }}
              >
                Submit Guess
              </button>
            )}
          </div>

          {incorrectGuesses.length > 0 && (
            <p className="mt-3 text-center text-sm text-[var(--muted)] sm:text-base">
              Incorrect guesses: {incorrectGuesses.join(", ")}
            </p>
          )}

          {!won && !gaveUp && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={giveUp}
                className="px-4 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                Give Up
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
