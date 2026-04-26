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
    <main className="mx-auto w-full max-w-4xl px-4 py-10 text-[var(--foreground)] sm:px-6">
      <BackToGameButton />
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Stats
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[var(--muted)]">Total Games</p>
          <p className="mt-3 text-3xl font-semibold">{stats.totalGames}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[var(--muted)]">Wins</p>
          <p className="mt-3 text-3xl font-semibold">{stats.wins}</p>
        </div>
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[var(--muted)]">Win Rate</p>
          <p className="mt-3 text-3xl font-semibold">{stats.winRate}%</p>
        </div>
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-[var(--muted)]">Avg Guesses</p>
          <p className="mt-3 text-3xl font-semibold">{stats.avgGuesses}</p>
        </div>
      </div>
    </main>
  );
}
