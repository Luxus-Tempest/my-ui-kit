"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@acme/ui";

/**
 * Le thème vient de next-themes (classe `dark` sur <html>) : les jetons de
 * @acme/ui suivent cette classe, le ThemeProvider de la librairie n'est pas
 * nécessaire.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
