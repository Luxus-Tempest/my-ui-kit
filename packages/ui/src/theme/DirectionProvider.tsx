import * as React from "react";
import { DirectionProvider as RadixDirectionProvider, useDirection } from "@radix-ui/react-direction";

export type Direction = "ltr" | "rtl";

export interface DirectionProviderProps {
  /** Sens de lecture : `rtl` pour l'arabe ou l'hébreu. */
  dir: Direction;
  children: React.ReactNode;
}

/**
 * Sens de lecture de l'interface. Les primitives Radix (menus, onglets,
 * curseurs, navigation clavier) inversent leurs flèches ; poser aussi
 * `dir="rtl"` sur `<html>` pour que la mise en page CSS suive.
 *
 *   <html dir="rtl" lang="ar">…<DirectionProvider dir="rtl">…</DirectionProvider>
 */
export function DirectionProvider({ dir, children }: DirectionProviderProps) {
  return <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>;
}

export { useDirection };
