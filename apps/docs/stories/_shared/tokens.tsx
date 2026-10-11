import * as React from "react";
import { Text } from "@acme/ui";

/** Lit la valeur calculée d'un jeton sur l'élément : elle suit le thème actif. */
export function useTokenValue(name: string) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setValue(getComputedStyle(el).getPropertyValue(name).trim());
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    return () => observer.disconnect();
  }, [name]);
  return [ref, value] as const;
}

/** Échantillon de couleur : pastille, nom du jeton, valeur, rôle. */
export function Swatch({ token, role, border }: { token: string; role?: string; border?: boolean }) {
  const [ref, value] = useTokenValue(token);
  return (
    <div ref={ref} style={{ display: "grid", gap: 8, minWidth: 0 }}>
      <div
        style={{
          height: 56,
          borderRadius: "var(--ui-r-md)",
          background: `var(${token})`,
          boxShadow: border ? "inset 0 0 0 1px var(--ui-line)" : undefined,
        }}
      />
      <div style={{ display: "grid", gap: 2 }}>
        <Text size={12.5} weight="semibold" mono>{token}</Text>
        <Text size={12} tone="subtle" mono>{value}</Text>
        {role && <Text size={12} tone="muted">{role}</Text>}
      </div>
    </div>
  );
}

export function SwatchGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 20, maxWidth: 1040 }}>
      {children}
    </div>
  );
}

export function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 16, marginBottom: 40 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <Text as="h2" size={16} weight="semibold" style={{ margin: 0 }}>{title}</Text>
        {description && <Text as="p" size={13} tone="muted" style={{ margin: 0, maxWidth: 720 }}>{description}</Text>}
      </div>
      {children}
    </section>
  );
}
