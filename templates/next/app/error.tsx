"use client";

import * as React from "react";
import { Button, EmptyState } from "@rovia/ui";
import { TriangleAlert } from "lucide-react";

/** Erreur dans une page : message, et « Réessayer » qui recharge les données de la page. */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  React.useEffect(() => {
    // Branche ici ton suivi d'erreurs (Sentry…).
    console.error(error);
  }, [error]);
  return (
    <div id="contenu" tabIndex={-1} className="grid min-h-[60svh] place-items-center px-6 outline-none">
      <EmptyState
        // Titre de page : plus grand que l'état vide par défaut.
        className="[&_h1]:text-2xl"
        icon={<TriangleAlert />}
        title="Une erreur est survenue"
        titleAs="h1"
        description={error.digest ? `Référence : ${error.digest}` : "Réessaie dans un instant."}
        actions={<Button onClick={() => retry()}>Réessayer</Button>}
      />
    </div>
  );
}
