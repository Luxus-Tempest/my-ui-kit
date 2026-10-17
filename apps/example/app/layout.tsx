import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Acme Documents", template: "%s · Acme Documents" },
  description: "Application d'exemple construite avec @rovia/ui.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // next-themes pose la classe `dark` sur <html> avant l'hydratation.
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
