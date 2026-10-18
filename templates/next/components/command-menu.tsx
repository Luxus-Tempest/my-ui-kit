"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Tooltip,
} from "@rovia/ui";
import { Languages, LogOut, Search } from "lucide-react";
import { LOCALES, type Locale } from "@/config/locales";
import { navigationItems } from "@/config/navigation";
import { THEMES } from "@/components/theme-toggle";
import { useChangeLocale } from "@/components/locale-menu";

/**
 * Palette ⌘K (Ctrl+K) : aller à une page de la navigation, changer de thème ou de langue,
 * se déconnecter. Le bouton de la barre d'application l'ouvre aussi.
 */
export function CommandMenu({ onSignOut }: { onSignOut: () => void }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const { change } = useChangeLocale();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <Tooltip content="Rechercher" shortcut="⌘K">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Rechercher une page ou une action"
          onClick={() => setOpen(true)}
        >
          <Search />
        </Button>
      </Tooltip>
      <CommandDialog open={open} onOpenChange={setOpen} title="Palette de commandes">
        <CommandInput placeholder="Aller à, changer de thème, de langue…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Aller à">
            {navigationItems.map((item) => (
              <CommandItem key={item.href} onSelect={() => run(() => router.push(item.href))}>
                <item.icon />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Thème">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <CommandItem key={value} onSelect={() => run(() => setTheme(value))}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Langue">
            {(Object.keys(LOCALES) as Locale[]).map((code) => (
              <CommandItem key={code} value={`langue ${LOCALES[code].label}`} onSelect={() => run(() => change(code))}>
                <Languages />
                <span lang={LOCALES[code].tag}>{LOCALES[code].label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Compte">
            <CommandItem onSelect={() => run(onSignOut)}>
              <LogOut />
              Se déconnecter
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
