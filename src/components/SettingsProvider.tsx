"use client";

import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase/client";

type Theme = "light" | "dark" | "system";
type TextSize = "sm" | "md" | "lg" | "xl";

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-pref", theme);
}

function applyTextSize(size: TextSize) {
  document.documentElement.setAttribute("data-text-size", size);
}

export default function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const load = async () => {
      const localTheme =
        (localStorage.getItem("theme") as Theme | null) ?? "dark";
      const localSize =
        (localStorage.getItem("text_size") as TextSize | null) ?? "md";
      applyTheme(localTheme);
      applyTextSize(localSize);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data } = await supabase
        .from("user_settings")
        .select("theme, text_size")
        .eq("user_id", user.id)
        .single();

      if (data) {
        applyTheme(data.theme as Theme);
        applyTextSize(data.text_size as TextSize);
      }
    };

    load();

    const onUpdate = () => {
      const t = (localStorage.getItem("theme") as Theme | null) ?? "dark";
      const s = (localStorage.getItem("text_size") as TextSize | null) ?? "md";
      applyTheme(t);
      applyTextSize(s);
    };

    window.addEventListener("app-settings-updated", onUpdate);
    return () => window.removeEventListener("app-settings-updated", onUpdate);
  }, []);

  return <>{children}</>;
}
