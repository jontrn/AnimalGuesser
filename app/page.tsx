"use client";

import { useState } from "react";

export default function Home() {
  const [guess, setGuess] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [won, setWon] = useState(false);

  const submitGuess = async () => {
    if (!guess.trim()) return;

    const res = await fetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guess,
        previousHints: hints,
      }),
    });

    const data = await res.json();

    if (data.correct) {
      setWon(true);
    } else {
      setHints((prev) => [...prev, data.hint]);
    }

    setGuess("");
  };

  return (
    <main className="flex flex-col h-screen justify-between p-6">
      {/* Hint area */}
      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
        {hints.map((hint, i) => (
          <p key={i} className="text-lg">
            {hint}
          </p>
        ))}

        {won && (
          <p className="text-2xl font-bold text-green-600">
            🎉 Correct! Want another round?
          </p>
        )}
      </div>

      {/* Input area */}
      {!won && (
        <div className="flex justify-center">
          <input
            className="border rounded px-4 py-2 w-80 text-center"
            placeholder="Guess the animal..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitGuess()}
          />
        </div>
      )}
    </main>
  );
}
