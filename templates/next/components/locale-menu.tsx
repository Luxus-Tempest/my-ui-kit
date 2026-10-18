"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger, Tooltip } from "@rovia/ui";
import { Languages } from "lucide-react";
import { LOCALES, type Locale } from "@/config/locales";
import { setLocaleAction } from "@/lib/actions";

/** Change la langue : cookie posé par le serveur, puis nouveau rendu (`lang` et `dir` compris). */
export function useChangeLocale() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const change = React.useCallback(
    (locale: string) =>
      startTransition(async () => {
        await setLocaleAction(locale);
        router.refresh();
      }),
    [router],
  );
  return { change, pending };
}

export function LocaleMenu({ locale }: { locale: Locale }) {
  const { change, pending } = useChangeLocale();
  return (
    <Menu>
      <Tooltip content="Langue">
        <MenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label={`Langue : ${LOCALES[locale].label}`} disabled={pending}>
            <Languages />
          </Button>
        </MenuTrigger>
      </Tooltip>
      <MenuContent align="end">
        <MenuRadioGroup value={locale} onValueChange={change}>
          {(Object.keys(LOCALES) as Locale[]).map((code) => (
            <MenuRadioItem key={code} value={code} lang={LOCALES[code].tag}>
              {LOCALES[code].label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
