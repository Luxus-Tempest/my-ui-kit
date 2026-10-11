import * as React from "react";

/** Mise en page des démos : une ligne étiquetée, une carte (enfants empilés à 20 px). */
export const Row = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
    {label && (
      <span style={{ width: 132, flexShrink: 0, fontSize: 12, fontWeight: 500, color: "var(--ui-fg-3)" }}>
        {label}
      </span>
    )}
    {children}
  </div>
);

export const Card = ({ children, width = 420 }: { children: React.ReactNode; width?: number }) => (
  <div
    style={{
      display: "grid",
      gap: 20,
      alignContent: "start",
      width,
      maxWidth: "100%",
      padding: 24,
      background: "var(--ui-panel)",
      borderRadius: "var(--ui-r-lg)",
    }}
  >
    {children}
  </div>
);
