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
    <main className="mx-auto mt-24 w-full max-w-sm text-[var(--foreground)]">
      <BackToGameButton />
      <h1 className="mb-4 text-2xl font-bold">
        {mode === "signin" ? "Log in" : "Create account"}
      </h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          className="rounded border border-[var(--border)] bg-[var(--input-bg)] p-2 text-[var(--foreground)]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="rounded border border-[var(--border)] bg-[var(--input-bg)] p-2 text-[var(--foreground)]"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          className="rounded bg-[var(--button-bg)] p-2 text-[var(--button-fg)] hover:opacity-90"
          type="submit"
        >
          {mode === "signin" ? "Log in" : "Sign up"}
        </button>
      </form>
      <button
        className="mt-3 text-sm underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Need an account?" : "Already have an account?"}
      </button>
      {msg && <p className="mt-3 text-sm text-[var(--muted)]">{msg}</p>}
    </main>
  );
}
