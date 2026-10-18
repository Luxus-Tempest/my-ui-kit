"use client";

import * as React from "react";
import { Connexion } from "@/components/blocks/connexion/Connexion";
import { siteConfig } from "@/config/site";
import { signInAction } from "@/lib/actions";

/** Le bloc connexion, branché sur l'action serveur `signInAction` (lib/auth.ts). */
export function ConnexionForm({ next }: { next: string | null }) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();
  return (
    <Connexion
      appName={siteConfig.name}
      description="Accédez à votre espace, où que vous soyez."
      // Fournisseurs tiers (Google…) : à ajouter quand ton fournisseur d'authentification les gère.
      providers={[]}
      signUpHref="/inscription"
      error={error}
      pending={pending}
      onSubmit={(values) =>
        startTransition(async () => {
          setError(null);
          const result = await signInAction(values, next);
          if (result?.error) setError(result.error);
        })
      }
    />
  );
}
