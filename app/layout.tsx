import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SettingsProvider from "@/src/components/SettingsProvider";
import "./globals.css";
import UserMenu from "@/src/components/UserMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnimalGuesser",
  description: "A calm little animal guessing game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
                AnimalGuesser
              </p>
              <UserMenu />
            </div>
          </header>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
