import Link from "next/link";

export default function BackToGameButton() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)] transition-colors hover:bg-[var(--surface-strong)]"
    >
      {"<- Back to Game"}
    </Link>
  );
}
