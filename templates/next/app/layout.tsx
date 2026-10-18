import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { getLocale, htmlAttributes } from "@/lib/locale";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const arabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor.dark },
  ],
};

/**
 * Langue et sens viennent du cookie `locale`, lu ici côté serveur : l'arabe s'affiche de droite
 * à gauche dès le premier rendu. (Lire un cookie rend les routes dynamiques : c'est voulu.)
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    // next-themes pose la classe `dark` sur <html> avant l'hydratation.
    <html {...htmlAttributes(locale)} className={`${inter.variable} ${arabic.variable}`} suppressHydrationWarning>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
