/**
 * Échelle d'espacement : un pas vaut 4 px. `2` → 8px, `4.5` → 18px.
 * Une chaîne passe telle quelle ("auto", "1rem", "var(--x)").
 */
export type Space = number | string;

export function space(value: Space | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value * 4}px` : value;
}

/**
 * Retire les clés `undefined` d'un objet de style. Sans cela, React applique
 * `rowGap: undefined` comme une valeur vide, ce qui efface le `gap` posé juste
 * avant (une propriété longue écrase la propriété raccourcie).
 */
export function compactStyle(style: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key in style) if (style[key] !== undefined && style[key] !== null) out[key] = style[key];
  return out;
}
