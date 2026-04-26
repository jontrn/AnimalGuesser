"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";
import BackToGameButton from "@/src/components/BackToGameButton";

type ProfileStats = {
  totalGames: number;
  wins: number;
  winRate: number;
  avgGuesses: number;
};

export default function ProfilePage() {
  const [stats, setStats] = useState<ProfileStats>({
    totalGames: 0,
    wins: 0,
    winRate: 0,
    avgGuesses: 0,
  });

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: rounds } = await supabase
        .from("rounds")
        .select("won, guess_count")
        .eq("user_id", userData.user.id);

      const totalGames = rounds?.length ?? 0;
      const wins = rounds?.filter((r) => r.won).length ?? 0;
      const totalGuesses =
        rounds?.reduce((sum, r) => sum + (r.guess_count ?? 0), 0) ?? 0;

      setStats({
        totalGames,
        wins,
        winRate: totalGames ? Math.round((wins / totalGames) * 100) : 0,
        avgGuesses: totalGames
          ? Number((totalGuesses / totalGames).toFixed(1))
          : 0,
      });
    };

    load();
  }, []);

  return (
    <main className="mx-auto mt-16 w-full max-w-2xl text-[var(--foreground)]">
      <BackToGameButton />
      <h1 className="mb-4 text-2xl font-bold">Profile</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
          Total Games: {stats.totalGames}
        </div>
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
          Wins: {stats.wins}
        </div>
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
          Win Rate: {stats.winRate}%
        </div>
        <div className="rounded border border-[var(--border)] bg-[var(--surface)] p-4">
          Avg Guesses: {stats.avgGuesses}
        </div>
      </div>
    </main>
  );
}
