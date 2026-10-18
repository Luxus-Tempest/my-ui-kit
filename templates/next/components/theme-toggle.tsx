"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button, Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger, Tooltip } from "@rovia/ui";
import { Monitor, Moon, Sun } from "lucide-react";

export const THEMES = [
  { value: "light", label: "Thème clair", icon: Sun },
  { value: "dark", label: "Thème sombre", icon: Moon },
  { value: "system", label: "Thème du système", icon: Monitor },
] as const;

/** Bascule clair, sombre ou système (mémorisé par next-themes dans le navigateur). */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Menu>
      <Tooltip content="Thème">
        <MenuTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Changer de thème">
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
          </Button>
        </MenuTrigger>
      </Tooltip>
      <MenuContent align="end">
        <MenuRadioGroup value={theme} onValueChange={setTheme}>
          {THEMES.map(({ value, label, icon: Icon }) => (
            <MenuRadioItem key={value} value={value}>
              <Icon />
              {label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
