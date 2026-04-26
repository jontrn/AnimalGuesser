import Link from "next/link";

export default function BackToGameButton() {
  return (
    <Link
      href="/"
      className="mb-4 inline-flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-sm text-[var(--foreground)] hover:bg-[var(--surface-strong)]"
    >
      {"<- Back to Game"}
    </Link>
  );
}
