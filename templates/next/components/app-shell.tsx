"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Alert, AlertDescription } from "@rovia/ui";
import { CoqueApplication } from "@/components/blocks/coque-application/CoqueApplication";
import { CommandMenu } from "@/components/command-menu";
import { LocaleMenu } from "@/components/locale-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/config/locales";
import { navigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { signOutAction } from "@/lib/actions";

/**
 * La coque côté client : elle importe elle même la navigation (icônes), `Link` et le chemin
 * courant ; le layout serveur ne lui passe que des données simples.
 */
export function AppShell({
  user,
  locale,
  demo,
  children,
}: {
  user: { name: string; role: string };
  locale: Locale;
  demo: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [, startTransition] = React.useTransition();
  const signOut = () => startTransition(() => signOutAction());
  return (
    <CoqueApplication
      appName={siteConfig.name}
      navigation={navigation}
      activeHref={pathname}
      user={user}
      onSignOut={signOut}
      linkComponent={Link}
      banner={
        demo ? (
          <Alert tone="warn" style={{ borderRadius: 0 }}>
            <AlertDescription>
              Mode démonstration : n&apos;importe qui peut se connecter. Branche ton fournisseur dans lib/auth.ts.
            </AlertDescription>
          </Alert>
        ) : undefined
      }
      actions={
        <>
          <CommandMenu onSignOut={signOut} />
          <ThemeToggle />
          <LocaleMenu locale={locale} />
        </>
      }
    >
      {children}
    </CoqueApplication>
  );
}
