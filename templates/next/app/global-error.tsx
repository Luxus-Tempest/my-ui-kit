"use client";

/**
 * Erreur dans le layout racine lui même : la page entière est remplacée, sans les styles de
 * l'application. Reste volontairement minimale.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="fr">
      <body
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100svh",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ display: "grid", gap: 16, justifyItems: "center", textAlign: "center", padding: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Une erreur est survenue</h1>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: "#0b57d0",
              color: "#fff",
              font: "inherit",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
