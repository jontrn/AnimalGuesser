"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";
import BackToGameButton from "@/src/components/BackToGameButton";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setMsg(error ? error.message : "Signed in.");
      if (!error) window.location.href = "/";
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? error.message : "Check your email to confirm sign-up.");
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 text-[var(--foreground)] sm:px-6">
      <BackToGameButton />
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-7">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Account
        </p>
        <h1 className="mb-2 mt-2 text-3xl font-semibold tracking-tight">
          {mode === "signin" ? "Log in" : "Create account"}
        </h1>
        <p className="mb-6 text-sm leading-6 text-[var(--foreground-soft)]">
          Save your rounds, track your stats, and pick up where you left off.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            className="rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-[var(--foreground)] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-[var(--foreground)] outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button
            className="rounded-2xl bg-[var(--button-bg)] p-3 font-medium text-[var(--button-fg)] transition-opacity hover:opacity-90"
            type="submit"
          >
            {mode === "signin" ? "Log in" : "Sign up"}
          </button>
        </form>
        <button
          className="mt-4 text-sm text-[var(--foreground-soft)] underline underline-offset-4"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Need an account?" : "Already have an account?"}
        </button>
        {msg && <p className="mt-4 text-sm text-[var(--muted)]">{msg}</p>}
      </div>
    </main>
  );
}
