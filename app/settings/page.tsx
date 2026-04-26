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
    <main className="mx-auto mt-16 w-full max-w-2xl text-[var(--foreground)]">
      <BackToGameButton />
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>

      <div className="space-y-4 rounded border border-[var(--border)] bg-[var(--surface)] p-4">
        <div>
          <label className="mb-1 block text-sm">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="w-full rounded border border-[var(--border)] bg-[var(--input-bg)] p-2 text-[var(--foreground)]"
          >
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="system">system</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">UI Size</label>
          <select
            value={textSize}
            onChange={(e) => setTextSize(e.target.value as TextSize)}
            className="w-full rounded border border-[var(--border)] bg-[var(--input-bg)] p-2 text-[var(--foreground)]"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">VERY Large</option>
          </select>
        </div>

        <button
          onClick={saveSettings}
          className="rounded bg-[var(--button-bg)] px-4 py-2 text-[var(--button-fg)] hover:opacity-90"
        >
          Save
        </button>

        {status && <p className="text-sm text-[var(--muted)]">{status}</p>}
      </div>
    </main>
  );
}
