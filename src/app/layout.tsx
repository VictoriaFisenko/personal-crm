import type { Metadata } from "next";
import { Literata, Onest } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const sans = Onest({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  fallback: ["system-ui", "sans-serif"],
});

const heading = Literata({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Контакты — Личная CRM",
    template: "%s — Личная CRM",
  },
  description:
    "Люди, которых я знаю лично: кто это, откуда знакомы и о чём договорились.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${sans.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster theme="light" position="bottom-center" />
      </body>
    </html>
  );
}
