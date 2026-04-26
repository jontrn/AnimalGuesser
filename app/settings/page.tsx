"use client";

import { useEffect, useState } from "react";
import BackToGameButton from "@/src/components/BackToGameButton";
import { supabase } from "@/src/lib/supabase/client";

type Theme = "light" | "dark" | "system";
type TextSize = "sm" | "md" | "lg" | "xl";

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [textSize, setTextSize] = useState<TextSize>("md");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data } = await supabase
        .from("user_settings")
        .select("theme, text_size")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setTheme(data.theme);
        setTextSize(data.text_size);
      }
    };

    load();
  }, []);

  const saveSettings = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setStatus("Please log in first.");
      return;
    }

    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      theme,
      text_size: textSize,
      updated_at: new Date().toISOString(),
    });

    setStatus(error ? error.message : "Settings saved.");
    if (!error) {
      localStorage.setItem("theme", theme);
      localStorage.setItem("text_size", textSize);
      window.dispatchEvent(new Event("app-settings-updated"));
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 text-[var(--foreground)] sm:px-6">
      <BackToGameButton />
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Preferences
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-5 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-[var(--foreground)] outline-none"
          >
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="system">system</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">UI Size</label>
          <select
            value={textSize}
            onChange={(e) => setTextSize(e.target.value as TextSize)}
            className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-[var(--foreground)] outline-none"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">VERY Large</option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          className="rounded-2xl bg-[var(--button-bg)] px-4 py-3 font-medium text-[var(--button-fg)] transition-opacity hover:opacity-90"
        >
          Save
        </button>

        {status && <p className="text-sm text-[var(--muted)]">{status}</p>}
      </div>
    </main>
  );
}
