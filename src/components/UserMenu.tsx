"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase/client";

export default function UserMenu() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="w-full max-w-36">
      <details className="w-full">
        <summary className="block w-full list-none cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface-strong)] px-2 py-1.5 text-center text-xs text-[var(--foreground)] hover:opacity-90">
          Menu
        </summary>

        <div className="mt-2 w-full overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface-strong)]">
          <Link
            href="/"
            className="block px-2 py-1.5 text-center text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
          >
            Home
          </Link>
          <Link
            href="/profile"
            className="block px-2 py-1.5 text-center text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
          >
            Profile
          </Link>
          <Link
            href="/history"
            className="block px-2 py-1.5 text-center text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
          >
            History
          </Link>
          <Link
            href="/settings"
            className="block px-2 py-1.5 text-center text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
          >
            Settings
          </Link>

          <div className="h-px bg-[var(--border)]" />

          {!email ? (
            <Link
              href="/auth"
              className="block px-2 py-1.5 text-center text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
            >
              Log in
            </Link>
          ) : (
            <button
              onClick={signOut}
              className="block w-full px-2 py-1.5 text-center text-xs text-[var(--foreground)] hover:bg-[var(--surface)]"
            >
              Sign out
            </button>
          )}
        </div>
      </details>
    </div>
  );
}
